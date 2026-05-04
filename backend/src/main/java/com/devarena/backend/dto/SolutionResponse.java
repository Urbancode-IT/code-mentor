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
public class SolutionResponse {
    private Long id;
    private Long problemId;
    private String problemTitle;
    private String repoUrl;
    private String description;
    private List<String> tags;
    private String authorName;
    private Long authorId;
    private String authorProfilePicUrl;
    private int likeCount;
    private boolean likedByCurrentUser;
    private int commentCount;
    private List<String> screenshotUrls;
    private LocalDateTime createdAt;
}
