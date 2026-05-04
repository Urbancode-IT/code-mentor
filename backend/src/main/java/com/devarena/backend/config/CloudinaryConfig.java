package com.devarena.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Bean
    public RestClient cloudinaryRestClient() {
        return RestClient.builder()
                .baseUrl("https://api.cloudinary.com/v1_1/" + cloudName)
                .build();
    }
}
