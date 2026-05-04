package com.devarena.backend.controller;

import com.devarena.backend.dto.CommentRequest;
import com.devarena.backend.dto.CommentResponse;
import com.devarena.backend.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/solution/{solutionId}")
    public ResponseEntity<List<CommentResponse>> getCommentsBySolution(@PathVariable Long solutionId) {
        return ResponseEntity.ok(commentService.getCommentsBySolution(solutionId));
    }

    @PostMapping("/solution/{solutionId}")
    public ResponseEntity<CommentResponse> addComment(@PathVariable Long solutionId,
                                                       @Valid @RequestBody CommentRequest request,
                                                       @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(commentService.addComment(solutionId, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        commentService.deleteComment(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
