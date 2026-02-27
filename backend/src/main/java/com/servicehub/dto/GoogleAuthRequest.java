package com.servicehub.dto;

import com.servicehub.entity.UserRole;
import lombok.Data;

@Data
public class GoogleAuthRequest {
    private String idToken;       // Google ID token from frontend
    private UserRole role;        // Required on first-time registration
}
