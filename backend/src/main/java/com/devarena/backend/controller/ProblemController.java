package com.devarena.backend.controller;

import com.devarena.backend.dto.ProblemRequest;
import com.devarena.backend.dto.ProblemResponse;
import com.devarena.backend.service.ProblemService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/problems")
public class ProblemController {

    private final ProblemService problemService;

    public ProblemController(ProblemService problemService) {
        this.problemService = problemService;
    }

    @GetMapping
    public ResponseEntity<List<ProblemResponse>> getAllProblems() {
        return ResponseEntity.ok(problemService.getAllProblems());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProblemResponse> getProblemById(@PathVariable Long id) {
        return ResponseEntity.ok(problemService.getProblemById(id));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<ProblemResponse>> filterByDifficulty(@RequestParam String difficulty) {
        return ResponseEntity.ok(problemService.filterByDifficulty(difficulty));
    }

    @GetMapping("/category")
    public ResponseEntity<List<ProblemResponse>> filterByCategory(@RequestParam String category) {
        return ResponseEntity.ok(problemService.filterByCategory(category));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProblemResponse>> search(@RequestParam String q) {
        return ResponseEntity.ok(problemService.search(q));
    }

    @PostMapping
    public ResponseEntity<ProblemResponse> createProblem(@Valid @RequestBody ProblemRequest request,
                                                         @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(problemService.createProblem(request, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProblemResponse> updateProblem(@PathVariable Long id,
                                                         @Valid @RequestBody ProblemRequest request) {
        return ResponseEntity.ok(problemService.updateProblem(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProblem(@PathVariable Long id) {
        problemService.deleteProblem(id);
        return ResponseEntity.noContent().build();
    }
}
