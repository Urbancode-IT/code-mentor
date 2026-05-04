package com.devarena.backend.repository;

import com.devarena.backend.model.CourseOffer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseOfferRepository extends JpaRepository<CourseOffer, Long> {
    List<CourseOffer> findByActiveTrueOrderByCreditsRequiredAsc();
}
