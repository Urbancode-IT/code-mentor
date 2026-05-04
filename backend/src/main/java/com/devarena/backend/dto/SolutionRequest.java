package com.devarena.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SolutionRequest {

    @NotBlank
    private String repoUrl;

    @NotBlank
    private String description;

    private String tags;

    private String screenshotUrls;
}
