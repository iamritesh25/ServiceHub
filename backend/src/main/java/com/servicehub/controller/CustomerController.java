package com.servicehub.controller;

import com.servicehub.dto.UpdateCustomerProfileDTO;
import com.servicehub.dto.UserResponseDTO;
import com.servicehub.service.UserService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    private final UserService userService;

    public CustomerController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public UserResponseDTO getProfile(Authentication authentication) {
        return userService.getCurrentUser(authentication);
    }

    @PutMapping("/profile")
    public UserResponseDTO updateProfile(@RequestBody UpdateCustomerProfileDTO dto,
            Authentication authentication) {
        return userService.updateCustomerProfile(dto, authentication);
    }
}