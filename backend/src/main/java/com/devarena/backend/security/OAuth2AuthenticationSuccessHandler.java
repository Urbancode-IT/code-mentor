package com.devarena.backend.security;

import com.devarena.backend.model.Role;
import com.devarena.backend.model.User;
import com.devarena.backend.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    public OAuth2AuthenticationSuccessHandler(UserRepository userRepository,
                                              PasswordEncoder passwordEncoder,
                                              JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        String provider = oauthToken.getAuthorizedClientRegistrationId();
        OAuth2User oauthUser = oauthToken.getPrincipal();
        Map<String, Object> attrs = oauthUser.getAttributes();

        String email = extractEmail(provider, attrs);
        String name = extractName(provider, attrs);
        String providerId = extractProviderId(provider, attrs);
        String avatarUrl = extractAvatarUrl(provider, attrs);

        if (email == null || email.isBlank()) {
            redirectWithError(response, "Email permission is required to sign in.");
            return;
        }

        User user = userRepository.findByEmail(email).orElseGet(() ->
                createUser(provider, providerId, email, name, avatarUrl));

        if (user.getAuthProvider() == null) {
            user.setAuthProvider(provider);
            user.setProviderId(providerId);
            if (user.getProfilePicUrl() == null && avatarUrl != null) {
                user.setProfilePicUrl(avatarUrl);
            }
            userRepository.save(user);
        }

        String jwt = tokenProvider.generateTokenForUser(user.getUsername(), user.getRole().name());

        String redirectUrl = frontendBaseUrl + "/oauth-callback.html#token=" + enc(jwt)
                + "&username=" + enc(user.getUsername())
                + "&role=" + enc(user.getRole().name())
                + "&displayName=" + enc(user.getDisplayName())
                + "&userId=" + user.getId()
                + "&profilePicUrl=" + enc(user.getProfilePicUrl() == null ? "" : user.getProfilePicUrl())
                + "&credits=" + user.getCredits();

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    private User createUser(String provider, String providerId, String email, String name, String avatarUrl) {
        User user = new User();
        user.setEmail(email);
        user.setUsername(generateUniqueUsername(email, name));
        user.setDisplayName(name == null || name.isBlank() ? user.getUsername() : name);
        user.setPassword(passwordEncoder.encode(randomPassword()));
        user.setRole(Role.USER);
        user.setAuthProvider(provider);
        user.setProviderId(providerId);
        user.setProfilePicUrl(avatarUrl);
        return userRepository.save(user);
    }

    private String generateUniqueUsername(String email, String name) {
        String base = (name != null && !name.isBlank())
                ? name.toLowerCase().replaceAll("[^a-z0-9]", "")
                : email.split("@")[0].toLowerCase().replaceAll("[^a-z0-9]", "");
        if (base.isBlank()) base = "user";
        if (base.length() > 40) base = base.substring(0, 40);

        String candidate = base;
        int suffix = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = base + suffix;
            suffix++;
        }
        return candidate;
    }

    private String randomPassword() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String extractEmail(String provider, Map<String, Object> attrs) {
        Object email = attrs.get("email");
        return email == null ? null : email.toString();
    }

    private String extractName(String provider, Map<String, Object> attrs) {
        Object name = attrs.get("name");
        if (name != null && !name.toString().isBlank()) return name.toString();
        if ("github".equalsIgnoreCase(provider)) {
            Object login = attrs.get("login");
            return login == null ? null : login.toString();
        }
        return null;
    }

    private String extractProviderId(String provider, Map<String, Object> attrs) {
        Object id = attrs.get("sub");
        if (id == null) id = attrs.get("id");
        return id == null ? null : id.toString();
    }

    private String extractAvatarUrl(String provider, Map<String, Object> attrs) {
        if ("google".equalsIgnoreCase(provider)) {
            Object pic = attrs.get("picture");
            return pic == null ? null : pic.toString();
        }
        if ("github".equalsIgnoreCase(provider)) {
            Object pic = attrs.get("avatar_url");
            return pic == null ? null : pic.toString();
        }
        return null;
    }

    private void redirectWithError(HttpServletResponse response, String message) throws IOException {
        response.sendRedirect(frontendBaseUrl + "/login.html?oauth_error=" + enc(message));
    }

    private String enc(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }
}
