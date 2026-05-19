package com.devarena.backend.service;

import com.devarena.backend.model.PasswordResetToken;
import com.devarena.backend.model.User;
import com.devarena.backend.repository.PasswordResetTokenRepository;
import com.devarena.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);
    private static final String RESEND_ENDPOINT = "https://api.resend.com/emails";

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    @Value("${app.mail.resend.api-key}")
    private String resendApiKey;

    @Value("${app.mail.from}")
    private String mailFrom;

    @Value("${app.password-reset.token-ttl-minutes:30}")
    private long tokenTtlMinutes;

    public PasswordResetService(UserRepository userRepository,
                                PasswordResetTokenRepository tokenRepository,
                                PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void requestReset(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return; // silent — do not reveal whether an email is registered
        }
        User user = userOpt.get();

        String rawToken = generateToken();
        PasswordResetToken token = new PasswordResetToken();
        token.setToken(rawToken);
        token.setUser(user);
        token.setExpiresAt(LocalDateTime.now().plusMinutes(tokenTtlMinutes));
        tokenRepository.save(token);

        String resetLink = frontendBaseUrl + "/reset-password.html?token=" + rawToken;
        String to = user.getEmail();
        String name = user.getDisplayName();
        CompletableFuture.runAsync(() -> sendResetEmail(to, name, resetLink));
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        PasswordResetToken token = tokenRepository.findByToken(rawToken)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset link."));
        if (token.isUsed()) {
            throw new IllegalArgumentException("This reset link has already been used.");
        }
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("This reset link has expired. Please request a new one.");
        }

        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        token.setUsed(true);
        tokenRepository.save(token);
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private void sendResetEmail(String to, String displayName, String resetLink) {
        if (resendApiKey == null || resendApiKey.isBlank()) {
            log.error("RESEND_API_KEY is not set; cannot send password reset email to {}", to);
            return;
        }
        try {
            String greeting = (displayName == null || displayName.isBlank()) ? "" : "Hi " + displayName + ",<br><br>";
            String html =
                    greeting +
                            "We received a request to reset the password on your DevArena account.<br>" +
                            "Click the link below to set a new password. The link expires in " + tokenTtlMinutes + " minutes.<br><br>" +
                            "<a href=\"" + resetLink + "\">Reset my password</a><br><br>" +
                            "Or paste this URL into your browser:<br>" + resetLink + "<br><br>" +
                            "If you did not request this, you can safely ignore this email.<br><br>" +
                            "Thanks,<br>The DevArena Team";

            Map<String, Object> body = Map.of(
                    "from", mailFrom,
                    "to", new String[]{to},
                    "subject", "Reset your DevArena password",
                    "html", html
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(resendApiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            RequestEntity<Map<String, Object>> request = new RequestEntity<>(body, headers,
                    org.springframework.http.HttpMethod.POST, URI.create(RESEND_ENDPOINT));

            ResponseEntity<String> response = restTemplate.exchange(request, String.class);
            log.info("Resend accepted reset email for {}: status {}", to, response.getStatusCode());
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}", to, e);
        }
    }
}
