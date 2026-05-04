package com.devarena.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProblemRequest {

    @NotBlank
    @Size(max = 200)
    private String title;

    @NotBlank
    private String introduction;

    @NotBlank
    private String requirements;

    private String suggestedImplementation;

    @NotBlank
    private String difficulty;

    @NotBlank
    private String category;

    private String tags;
}
