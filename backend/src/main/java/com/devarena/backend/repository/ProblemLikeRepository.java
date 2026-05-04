package com.devarena.backend.repository;

import com.devarena.backend.model.ProblemLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProblemLikeRepository extends JpaRepository<ProblemLike, Long> {
    Optional<ProblemLike> findByProblemIdAndUserId(Long problemId, Long userId);
    boolean existsByProblemIdAndUserId(Long problemId, Long userId);

    @Query("SELECT pl.problem.id FROM ProblemLike pl WHERE pl.user.id = :userId")
    List<Long> findProblemIdsByUserId(@Param("userId") Long userId);
}
