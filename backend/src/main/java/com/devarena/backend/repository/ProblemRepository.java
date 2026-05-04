package com.devarena.backend.repository;

import com.devarena.backend.model.Problem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProblemRepository extends JpaRepository<Problem, Long> {
    List<Problem> findAllByOrderByCreatedAtDesc();
    List<Problem> findByDifficultyOrderByCreatedAtDesc(String difficulty);
    List<Problem> findByTagsContainingIgnoreCase(String tag);
    List<Problem> findByCategoryIgnoreCaseOrderByCreatedAtDesc(String category);
    List<Problem> findByTitleContainingIgnoreCaseOrIntroductionContainingIgnoreCase(String title, String introduction);
}
