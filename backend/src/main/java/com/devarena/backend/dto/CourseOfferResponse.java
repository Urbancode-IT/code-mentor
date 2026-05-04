package com.devarena.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CourseOfferResponse {
    private Long id;
    private String title;
    private String description;
    private int creditsRequired;
    private String imageUrl;
    private String link;
    private boolean redeemable;
}
