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
                dto.getRole()
        );

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

        String token = jwtService.generateToken(user);

        UserResponseDTO response = new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getCreatedAt()
        );

        response.setToken(token);

        return response;
    }


    // ========================= GET USER BY ID =========================
    public UserResponseDTO getUserById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id: " + id));

        return convertToResponseDTO(user);
    }

    // ========================= GET USER BY EMAIL =========================
    public UserResponseDTO getUserByEmail(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with email: " + email));

        return convertToResponseDTO(user);
    }

    // ========================= GET USERS BY ROLE =========================
    public List<UserResponseDTO> getUsersByRole(UserRole role) {

        return userRepository.findByRole(role)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ========================= GET ALL USERS =========================
    public List<UserResponseDTO> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ========================= UPDATE USER =========================
    public UserResponseDTO updateUser(Long id, UserRegistrationDTO dto) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id: " + id));

        user.setName(dto.getName());
        user.setPhone(dto.getPhone());

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        User updatedUser = userRepository.save(user);

        return convertToResponseDTO(updatedUser);
    }

    // ========================= DELETE USER =========================
    public void deleteUser(Long id) {

        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }

        userRepository.deleteById(id);
    }

    // ========================= CHECK USER EXISTS =========================
    public boolean userExists(Long id) {
        return userRepository.existsById(id);
    }

    // ========================= GET USER ENTITY (Internal Use) =========================
    public User getUserEntity(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id: " + id));
    }

    // ========================= CONVERT ENTITY → DTO =========================
    private UserResponseDTO convertToResponseDTO(User user) {

        return new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
    public User getUserEntityByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with email: " + email));
    }
    
    public User getCurrentUser(Authentication authentication) {

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateCustomerProfile(UpdateCustomerProfileDTO dto,
            Authentication authentication) {

User user = getCurrentUser(authentication);

user.setName(dto.getName());
user.setPhone(dto.getPhone());   // ✅ changed
user.setLocation(dto.getLocation());

return userRepository.save(user);
}
    
}
