package com.devarena.backend.service;

import com.devarena.backend.dto.SolutionRequest;
import com.devarena.backend.dto.SolutionResponse;
import com.devarena.backend.exception.ResourceNotFoundException;
import com.devarena.backend.exception.UnauthorizedException;
import com.devarena.backend.model.Problem;
import com.devarena.backend.model.Solution;
import com.devarena.backend.model.User;
import com.devarena.backend.model.Role;
import com.devarena.backend.repository.LikeRepository;
import com.devarena.backend.repository.ProblemRepository;
import com.devarena.backend.repository.SolutionRepository;
import com.devarena.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
public class SolutionService {

    private final SolutionRepository solutionRepository;
    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;

    public SolutionService(SolutionRepository solutionRepository, ProblemRepository problemRepository,
                           UserRepository userRepository, LikeRepository likeRepository) {
        this.solutionRepository = solutionRepository;
        this.problemRepository = problemRepository;
        this.userRepository = userRepository;
        this.likeRepository = likeRepository;
    }

    public List<SolutionResponse> getSolutionsByProblem(Long problemId, String currentUsername) {
        return solutionRepository.findByProblemIdOrderByLikeCountDesc(problemId).stream()
                .map(s -> toResponse(s, currentUsername))
                .toList();
    }

    public List<SolutionResponse> getSolutionsByUser(Long userId, String currentUsername) {
        return solutionRepository.findByAuthorIdOrderByCreatedAtDesc(userId).stream()
                .map(s -> toResponse(s, currentUsername))
                .toList();
    }

    @Transactional
    public SolutionResponse submitSolution(Long problemId, SolutionRequest request, String username) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with id: " + problemId));

        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Solution solution = new Solution();
        solution.setProblem(problem);
        solution.setAuthor(author);
        solution.setRepoUrl(request.getRepoUrl());
        solution.setDescription(request.getDescription());
        solution.setTags(request.getTags());
        solution.setScreenshotUrls(request.getScreenshotUrls());

        solution = solutionRepository.save(solution);

        // Award credits based on problem difficulty
        int credits = switch (problem.getDifficulty()) {
            case "ADVANCED" -> 30;
            case "INTERMEDIATE" -> 20;
            default -> 10;
        };
        author.setCredits(author.getCredits() + credits);
        userRepository.save(author);

        return toResponse(solution, username);
    }

    @Transactional
    public void deleteSolution(Long id, String username) {
        Solution solution = solutionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Solution not found with id: " + id));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!solution.getAuthor().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("You can only delete your own solutions");
        }

        // Deduct credits that were awarded for this solution
        User author = solution.getAuthor();
        int credits = switch (solution.getProblem().getDifficulty()) {
            case "ADVANCED" -> 30;
            case "INTERMEDIATE" -> 20;
            default -> 10;
        };
        author.setCredits(Math.max(0, author.getCredits() - credits));
        userRepository.save(author);

        solutionRepository.delete(solution);
    }

    private SolutionResponse toResponse(Solution solution, String currentUsername) {
        boolean liked = false;
        if (currentUsername != null) {
            User currentUser = userRepository.findByUsername(currentUsername).orElse(null);
            if (currentUser != null) {
                liked = likeRepository.existsBySolutionIdAndUserId(solution.getId(), currentUser.getId());
            }
        }

        List<String> tagList = solution.getTags() != null && !solution.getTags().isBlank()
                ? Arrays.stream(solution.getTags().split(",")).map(String::trim).filter(t -> !t.isEmpty()).toList()
                : Collections.emptyList();

        List<String> screenshots = solution.getScreenshotUrls() != null && !solution.getScreenshotUrls().isBlank()
                ? Arrays.stream(solution.getScreenshotUrls().split(",")).map(String::trim).filter(u -> !u.isEmpty()).toList()
                : Collections.emptyList();

        SolutionResponse resp = new SolutionResponse();
        resp.setId(solution.getId());
        resp.setProblemId(solution.getProblem().getId());
        resp.setProblemTitle(solution.getProblem().getTitle());
        resp.setRepoUrl(solution.getRepoUrl());
        resp.setDescription(solution.getDescription());
        resp.setTags(tagList);
        resp.setAuthorName(solution.getAuthor().getDisplayName());
        resp.setAuthorId(solution.getAuthor().getId());
        resp.setAuthorProfilePicUrl(solution.getAuthor().getProfilePicUrl());
        resp.setLikeCount(solution.getLikeCount());
        resp.setLikedByCurrentUser(liked);
        resp.setCommentCount(solution.getComments() != null ? solution.getComments().size() : 0);
        resp.setScreenshotUrls(screenshots);
        resp.setCreatedAt(solution.getCreatedAt());
        return resp;
    }
}
