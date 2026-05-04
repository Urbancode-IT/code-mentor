package com.devarena.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final RestClient restClient;
    private final String apiKey;
    private final String apiSecret;

    public CloudinaryService(RestClient cloudinaryRestClient,
                             @Value("${cloudinary.api-key}") String apiKey,
                             @Value("${cloudinary.api-secret}") String apiSecret) {
        this.restClient = cloudinaryRestClient;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }

    @SuppressWarnings("unchecked")
    public String upload(MultipartFile file, String folder) throws IOException {
        long timestamp = System.currentTimeMillis() / 1000;
        String toSign = "folder=" + folder + "&timestamp=" + timestamp + apiSecret;
        String signature = sha1(toSign);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        });
        body.add("folder", folder);
        body.add("timestamp", String.valueOf(timestamp));
        body.add("api_key", apiKey);
        body.add("signature", signature);

        Map<String, Object> result;
        try {
            result = restClient.post()
                    .uri("/image/upload")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(Map.class);
        } catch (Exception e) {
            throw new IOException("Cloudinary upload failed: " + e.getMessage(), e);
        }

        if (result == null || !result.containsKey("secure_url")) {
            throw new IOException("Cloudinary returned no URL. Response: " + result);
        }

        return (String) result.get("secure_url");
    }

    @SuppressWarnings("unchecked")
    public void delete(String publicId) {
        long timestamp = System.currentTimeMillis() / 1000;
        String toSign = "public_id=" + publicId + "&timestamp=" + timestamp + apiSecret;
        String signature = sha1(toSign);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("public_id", publicId);
        body.add("timestamp", String.valueOf(timestamp));
        body.add("api_key", apiKey);
        body.add("signature", signature);

        try {
            restClient.post()
                    .uri("/image/destroy")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(Map.class);
        } catch (Exception ignored) {
        }
    }

    private String sha1(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-1");
            byte[] hash = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-1 not available", e);
        }
    }
}
