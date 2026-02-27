package com.servicehub.dto;

import com.servicehub.entity.UserRole;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class UserResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private UserRole role;
    private LocalDateTime createdAt;
    private String token;
    private String profileImage;  // NEW
    private String authProvider;  // NEW

    public UserResponseDTO(Long id, String name, String email, String phone,
                           UserRole role, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.createdAt = createdAt;
    }
}
