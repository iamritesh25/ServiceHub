package com.servicehub.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private Long id;
    private String name;
    private String email;
    private String role;
    private String profileImageUrl;
    // true if this was the very first Google login (frontend can prompt for extra info)
    private boolean newUser;
}
