package com.devarena.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class OAuth2ClientConfig {

    @Value("${app.oauth2.google.client-id:}")
    private String googleClientId;

    @Value("${app.oauth2.google.client-secret:}")
    private String googleClientSecret;

    @Value("${app.oauth2.github.client-id:}")
    private String githubClientId;

    @Value("${app.oauth2.github.client-secret:}")
    private String githubClientSecret;

    @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        List<ClientRegistration> registrations = new ArrayList<>();
        if (notBlank(googleClientId) && notBlank(googleClientSecret)) {
            registrations.add(CommonOAuth2Provider.GOOGLE
                    .getBuilder("google")
                    .clientId(googleClientId)
                    .clientSecret(googleClientSecret)
                    .build());
        }
        if (notBlank(githubClientId) && notBlank(githubClientSecret)) {
            registrations.add(CommonOAuth2Provider.GITHUB
                    .getBuilder("github")
                    .clientId(githubClientId)
                    .clientSecret(githubClientSecret)
                    .scope("read:user", "user:email")
                    .build());
        }
        if (registrations.isEmpty()) {
            // Placeholder so Spring Security's OAuth2 autoconfig can still wire up — no real provider is active.
            registrations.add(CommonOAuth2Provider.GOOGLE
                    .getBuilder("google-disabled")
                    .clientId("disabled")
                    .clientSecret("disabled")
                    .build());
        }
        return new InMemoryClientRegistrationRepository(registrations);
    }

    private boolean notBlank(String value) {
        return value != null && !value.isBlank();
    }
}
