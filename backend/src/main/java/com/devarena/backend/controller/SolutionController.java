package com.devarena.backend.controller;

import com.devarena.backend.dto.SolutionRequest;
import com.devarena.backend.dto.SolutionResponse;
import com.devarena.backend.service.CloudinaryService;
import com.devarena.backend.service.SolutionService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/solutions")
public class SolutionController {

    private static final List<String> ALLOWED_TYPES = List.of("image/jpeg", "image/png", "image/gif", "image/webp");

    private final SolutionService solutionService;
    private final CloudinaryService cloudinaryService;

    public SolutionController(SolutionService solutionService, CloudinaryService cloudinaryService) {
        this.solutionService = solutionService;
        this.cloudinaryService = cloudinaryService;
    }

    @GetMapping("/problem/{problemId}")
    public ResponseEntity<List<SolutionResponse>> getSolutionsByProblem(
            @PathVariable Long problemId,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(solutionService.getSolutionsByProblem(problemId, username));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SolutionResponse>> getSolutionsByUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(solutionService.getSolutionsByUser(userId, username));
    }

    @PostMapping("/problem/{problemId}")
    public ResponseEntity<SolutionResponse> submitSolution(
            @PathVariable Long problemId,
            @Valid @RequestBody SolutionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(solutionService.submitSolution(problemId, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSolution(@PathVariable Long id,
                                                @AuthenticationPrincipal UserDetails userDetails) {
        solutionService.deleteSolution(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/upload-screenshots", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadScreenshots(
            @RequestParam("files") MultipartFile[] files,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {

        if (files.length > 5) {
            return ResponseEntity.badRequest().body(Map.of("message", "Maximum 5 screenshots allowed"));
        }

        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            String contentType = file.getContentType();
            if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Only image files (JPEG, PNG, GIF, WebP) are allowed"));
            }
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("message", "Each file must be under 5MB"));
            }

            String url = cloudinaryService.upload(file, "devarena/screenshots");
            urls.add(url);
        }

        return ResponseEntity.ok(Map.of("urls", urls));
    }
}
