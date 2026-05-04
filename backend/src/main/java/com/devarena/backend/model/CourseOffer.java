package com.devarena.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "course_offers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CourseOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "credits_required", nullable = false)
    private int creditsRequired;

    @Column(length = 500)
    private String imageUrl;

    @Column(length = 500)
    private String link;

    @Column(nullable = false)
    private boolean active = true;
}
