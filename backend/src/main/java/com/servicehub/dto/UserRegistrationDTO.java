package com.servicehub.dto;

import com.servicehub.entity.UserRole;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRegistrationDTO {
    private String name;
    private String email;
    private String password;
    private String phone;
    private UserRole role;
}
