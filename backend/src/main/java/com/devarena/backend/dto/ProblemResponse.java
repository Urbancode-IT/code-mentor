package com.devarena.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProblemResponse {
    private Long id;
    private String title;
    private String introduction;
    private String requirements;
    private String suggestedImplementation;
    private String difficulty;
    private String category;
    private List<String> tags;
    private String authorName;
    private int credits;
    private int solutionCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
