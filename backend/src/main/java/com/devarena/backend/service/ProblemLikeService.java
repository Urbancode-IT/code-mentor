package com.devarena.backend.service;

import com.devarena.backend.exception.ResourceNotFoundException;
import com.devarena.backend.model.Problem;
import com.devarena.backend.model.ProblemLike;
import com.devarena.backend.model.User;
import com.devarena.backend.repository.ProblemLikeRepository;
import com.devarena.backend.repository.ProblemRepository;
import com.devarena.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ProblemLikeService {

    private final ProblemLikeRepository problemLikeRepository;
    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;

    public ProblemLikeService(ProblemLikeRepository problemLikeRepository,
                              ProblemRepository problemRepository,
                              UserRepository userRepository) {
        this.problemLikeRepository = problemLikeRepository;
        this.problemRepository = problemRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Map<String, Object> toggleLike(Long problemId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with id: " + problemId));

        Optional<ProblemLike> existing = problemLikeRepository.findByProblemIdAndUserId(problemId, user.getId());

        boolean liked;
        if (existing.isPresent()) {
            problemLikeRepository.delete(existing.get());
            liked = false;
        } else {
            ProblemLike pl = new ProblemLike();
            pl.setProblem(problem);
            pl.setUser(user);
            problemLikeRepository.save(pl);
            liked = true;
        }

        return Map.of("liked", liked);
    }

    public List<Long> getLikedProblemIds(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return problemLikeRepository.findProblemIdsByUserId(user.getId());
    }
}
