package com.devarena.backend.controller;

import com.devarena.backend.service.LikeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/likes")
public class LikeController {

    private final LikeService likeService;

    public LikeController(LikeService likeService) {
        this.likeService = likeService;
    }

    @PostMapping("/toggle/{solutionId}")
    public ResponseEntity<Map<String, Object>> toggleLike(@PathVariable Long solutionId,
                                                           @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(likeService.toggleLike(solutionId, userDetails.getUsername()));
    }
}
