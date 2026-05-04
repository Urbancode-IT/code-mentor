package com.devarena.backend.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProfileRequest {

    @Size(max = 50, message = "Username must be at most 50 characters")
    private String username;

    @Size(max = 100, message = "Email must be at most 100 characters")
    private String email;

    @Size(max = 100, message = "Display name must be at most 100 characters")
    private String displayName;

    @Size(max = 2000, message = "Bio must be at most 2000 characters")
    private String bio;

    @Size(max = 500, message = "Profile picture URL must be at most 500 characters")
    private String profilePicUrl;
}
