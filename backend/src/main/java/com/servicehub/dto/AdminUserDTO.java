package com.servicehub.dto;

import com.servicehub.entity.User;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AdminUserDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String status;
    private String phone;
    private String location;
    private String authProvider;
    private LocalDateTime createdAt;
    private String serviceType;
    private Double rating;

    public static AdminUserDTO from(User user) {
        AdminUserDTO dto = new AdminUserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setStatus(user.getStatus() != null ? user.getStatus() : "ACTIVE");
        dto.setPhone(user.getPhone());
        dto.setLocation(user.getLocation());
        dto.setAuthProvider(user.getAuthProvider());
        dto.setCreatedAt(user.getCreatedAt());
        if (user.getProviderProfile() != null) {
            dto.setServiceType(user.getProviderProfile().getServiceType() != null
                ? user.getProviderProfile().getServiceType().name() : null);
            dto.setRating(user.getProviderProfile().getRating());
        }
        return dto;
    }
}
