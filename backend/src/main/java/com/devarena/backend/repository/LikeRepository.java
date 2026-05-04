package com.devarena.backend.repository;

import com.devarena.backend.model.Like;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findBySolutionIdAndUserId(Long solutionId, Long userId);
    boolean existsBySolutionIdAndUserId(Long solutionId, Long userId);
}
