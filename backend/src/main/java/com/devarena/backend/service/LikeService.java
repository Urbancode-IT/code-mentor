package com.devarena.backend.service;

import com.devarena.backend.exception.ResourceNotFoundException;
import com.devarena.backend.model.Like;
import com.devarena.backend.model.Solution;
import com.devarena.backend.model.User;
import com.devarena.backend.repository.LikeRepository;
import com.devarena.backend.repository.SolutionRepository;
import com.devarena.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class LikeService {

    private final LikeRepository likeRepository;
    private final SolutionRepository solutionRepository;
    private final UserRepository userRepository;

    public LikeService(LikeRepository likeRepository, SolutionRepository solutionRepository,
                       UserRepository userRepository) {
        this.likeRepository = likeRepository;
        this.solutionRepository = solutionRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Map<String, Object> toggleLike(Long solutionId, String username) {
        Solution solution = solutionRepository.findById(solutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Solution not found with id: " + solutionId));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Optional<Like> existingLike = likeRepository.findBySolutionIdAndUserId(solutionId, user.getId());

        boolean liked;
        if (existingLike.isPresent()) {
            likeRepository.delete(existingLike.get());
            solution.setLikeCount(Math.max(0, solution.getLikeCount() - 1));
            liked = false;
        } else {
            Like like = new Like();
            like.setSolution(solution);
            like.setUser(user);
            likeRepository.save(like);
            solution.setLikeCount(solution.getLikeCount() + 1);
            liked = true;
        }

        solutionRepository.save(solution);

        Map<String, Object> result = new HashMap<>();
        result.put("liked", liked);
        result.put("likeCount", solution.getLikeCount());
        return result;
    }
}
