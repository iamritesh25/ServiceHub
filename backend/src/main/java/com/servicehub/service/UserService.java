package com.servicehub.service;

import com.servicehub.dto.UpdateCustomerProfileDTO;
import com.servicehub.entity.User;
import com.servicehub.repository.UserRepository;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import java.util.Optional;
import com.servicehub.dto.UserLoginDTO;
import com.servicehub.dto.UserRegistrationDTO;
import com.servicehub.dto.UserResponseDTO;
import com.servicehub.entity.UserRole;
import com.servicehub.exception.BadRequestException;
import com.servicehub.exception.ResourceNotFoundException;
import com.servicehub.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    // ========================= REGISTER =========================
    public UserResponseDTO register(UserRegistrationDTO dto) {

        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new BadRequestException("Email already registered");
        }

        User user = new User(
                dto.getName(),
                dto.getEmail(),
                passwordEncoder.encode(dto.getPassword()),
                dto.getPhone(),
                dto.getRole());

        User savedUser = userRepository.save(user);

        return convertToResponseDTO(savedUser);
    }

    // ========================= LOGIN =========================
    public UserResponseDTO login(UserLoginDTO dto) {

        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        // Block suspended or deleted users from logging in
        if ("SUSPENDED".equals(user.getStatus())) {
            throw new RuntimeException("Your account has been suspended. Please contact support.");
        }
        if (Boolean.TRUE.equals(user.getIsDeleted())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(user);

        UserResponseDTO response = new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getCreatedAt());

        response.setToken(token);
        response.setProfileImage(user.getProfileImage());

        return response;
    }

    // ========================= GET USER BY ID =========================
    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return convertToResponseDTO(user);
    }

    // ========================= GET USER ENTITY BY ID =========================
    public User getUserEntity(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    // ========================= GET USER ENTITY BY EMAIL =========================
    public User getUserEntityByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    // ========================= GET CURRENT USER =========================
    public UserResponseDTO getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return convertToResponseDTO(user);
    }

    // ========================= GET ALL CUSTOMERS =========================
    public List<UserResponseDTO> getAllCustomers() {
        return userRepository.findByRole(UserRole.CUSTOMER)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ========================= GET ALL PROVIDERS =========================
    public List<UserResponseDTO> getAllProviders() {
        return userRepository.findByRole(UserRole.PROVIDER)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ========================= UPDATE CUSTOMER PROFILE =========================
    public UserResponseDTO updateCustomerProfile(UpdateCustomerProfileDTO dto, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (dto.getName() != null && !dto.getName().isBlank()) {
            user.setName(dto.getName());
        }
        if (dto.getPhone() != null) {
            user.setPhone(dto.getPhone());
        }
        if (dto.getLocation() != null) {
            user.setLocation(dto.getLocation());
        }

        User savedUser = userRepository.save(user);
        return convertToResponseDTO(savedUser);
    }

    // ========================= CONVERT TO DTO =========================
    public UserResponseDTO convertToResponseDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getCreatedAt());
        dto.setProfileImage(user.getProfileImage());
        return dto;
    }
}
