package com.devarena.backend.service;

import com.devarena.backend.model.PasswordResetToken;
import com.devarena.backend.model.User;
import com.devarena.backend.repository.PasswordResetTokenRepository;
import com.devarena.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    @Value("${app.mail.from}")
    private String mailFrom;

    @Value("${app.password-reset.token-ttl-minutes:30}")
    private long tokenTtlMinutes;

    public PasswordResetService(UserRepository userRepository,
                                PasswordResetTokenRepository tokenRepository,
                                PasswordEncoder passwordEncoder,
                                JavaMailSender mailSender) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
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
        sendResetEmail(user.getEmail(), user.getDisplayName(), resetLink);
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
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(to);
            message.setSubject("Reset your DevArena password");
            message.setText(
                    "Hi " + (displayName == null ? "" : displayName) + ",\n\n" +
                            "We received a request to reset the password on your DevArena account.\n" +
                            "Click the link below to set a new password. The link expires in " + tokenTtlMinutes + " minutes.\n\n" +
                            resetLink + "\n\n" +
                            "If you did not request this, you can safely ignore this email.\n\n" +
                            "Thanks,\nThe DevArena Team"
            );
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}", to, e);
        }
    }
}
