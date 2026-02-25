package com.servicehub.controller;

import com.servicehub.dto.*;
import com.servicehub.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    // Register new user
    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@RequestBody UserRegistrationDTO dto) {
        UserResponseDTO response = userService.register(dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Login user (UPDATED)
    @PostMapping("/login")
    public ResponseEntity<UserResponseDTO> login(@RequestBody UserLoginDTO dto) {

    	UserResponseDTO response = userService.login(dto);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Get user by ID
    @GetMapping("/user/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        UserResponseDTO response = userService.getUserById(id);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
