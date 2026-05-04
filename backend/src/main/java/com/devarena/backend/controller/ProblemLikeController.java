package com.devarena.backend.controller;

import com.devarena.backend.service.ProblemLikeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/problem-likes")
public class ProblemLikeController {

    private final ProblemLikeService problemLikeService;

    public ProblemLikeController(ProblemLikeService problemLikeService) {
        this.problemLikeService = problemLikeService;
    }

    @PostMapping("/toggle/{problemId}")
    public ResponseEntity<Map<String, Object>> toggleLike(@PathVariable Long problemId,
                                                           @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(problemLikeService.toggleLike(problemId, userDetails.getUsername()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Long>> getMyLikedProblemIds(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(problemLikeService.getLikedProblemIds(userDetails.getUsername()));
    }
}
