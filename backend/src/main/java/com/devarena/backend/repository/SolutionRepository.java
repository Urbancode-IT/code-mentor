package com.devarena.backend.repository;

import com.devarena.backend.model.Solution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SolutionRepository extends JpaRepository<Solution, Long> {
    List<Solution> findByProblemIdOrderByLikeCountDesc(Long problemId);
    List<Solution> findByAuthorIdOrderByCreatedAtDesc(Long authorId);

    @Query("SELECT s.author.id, COUNT(s) as cnt FROM Solution s WHERE s.createdAt >= :since GROUP BY s.author.id ORDER BY cnt DESC")
    List<Object[]> findTopContributorsSince(@Param("since") LocalDateTime since);
}
