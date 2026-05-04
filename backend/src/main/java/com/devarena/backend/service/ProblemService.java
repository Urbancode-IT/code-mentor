package com.devarena.backend.service;

import com.devarena.backend.dto.ProblemRequest;
import com.devarena.backend.dto.ProblemResponse;
import com.devarena.backend.exception.ResourceNotFoundException;
import com.devarena.backend.model.Problem;
import com.devarena.backend.model.User;
import com.devarena.backend.repository.ProblemRepository;
import com.devarena.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;

    public ProblemService(ProblemRepository problemRepository, UserRepository userRepository) {
        this.problemRepository = problemRepository;
        this.userRepository = userRepository;
    }

    public List<ProblemResponse> getAllProblems() {
        return problemRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    public ProblemResponse getProblemById(Long id) {
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with id: " + id));
        return toResponse(problem);
    }

    public List<ProblemResponse> filterByDifficulty(String difficulty) {
        return problemRepository.findByDifficultyOrderByCreatedAtDesc(difficulty.toUpperCase()).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ProblemResponse> filterByCategory(String category) {
        return problemRepository.findByCategoryIgnoreCaseOrderByCreatedAtDesc(category).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ProblemResponse> search(String query) {
        return problemRepository.findByTitleContainingIgnoreCaseOrIntroductionContainingIgnoreCase(query, query).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ProblemResponse createProblem(ProblemRequest request, String username) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Problem problem = new Problem();
        problem.setTitle(request.getTitle());
        problem.setIntroduction(request.getIntroduction());
        problem.setRequirements(request.getRequirements());
        problem.setSuggestedImplementation(request.getSuggestedImplementation());
        problem.setDifficulty(request.getDifficulty().toUpperCase());
        problem.setCategory(request.getCategory());
        problem.setTags(request.getTags());
        problem.setAuthor(author);

        problem = problemRepository.save(problem);
        return toResponse(problem);
    }

    @Transactional
    public ProblemResponse updateProblem(Long id, ProblemRequest request) {
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with id: " + id));

        problem.setTitle(request.getTitle());
        problem.setIntroduction(request.getIntroduction());
        problem.setRequirements(request.getRequirements());
        problem.setSuggestedImplementation(request.getSuggestedImplementation());
        problem.setDifficulty(request.getDifficulty().toUpperCase());
        problem.setCategory(request.getCategory());
        problem.setTags(request.getTags());
        problem.setUpdatedAt(LocalDateTime.now());

        problem = problemRepository.save(problem);
        return toResponse(problem);
    }

    @Transactional
    public void deleteProblem(Long id) {
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with id: " + id));
        problemRepository.delete(problem);
    }

    private int creditsForDifficulty(String difficulty) {
        return switch (difficulty) {
            case "ADVANCED" -> 30;
            case "INTERMEDIATE" -> 20;
            default -> 10;
        };
    }

    private ProblemResponse toResponse(Problem problem) {
        List<String> tagList = problem.getTags() != null && !problem.getTags().isBlank()
                ? Arrays.asList(problem.getTags().split(","))
                : Collections.emptyList();

        ProblemResponse resp = new ProblemResponse();
        resp.setId(problem.getId());
        resp.setTitle(problem.getTitle());
        resp.setIntroduction(problem.getIntroduction());
        resp.setRequirements(problem.getRequirements());
        resp.setSuggestedImplementation(problem.getSuggestedImplementation());
        resp.setDifficulty(problem.getDifficulty());
        resp.setCategory(problem.getCategory());
        resp.setTags(tagList);
        resp.setAuthorName(problem.getAuthor().getDisplayName());
        resp.setSolutionCount(problem.getSolutions() != null ? problem.getSolutions().size() : 0);
        resp.setCredits(creditsForDifficulty(problem.getDifficulty()));
        resp.setCreatedAt(problem.getCreatedAt());
        resp.setUpdatedAt(problem.getUpdatedAt());
        return resp;
    }
}
