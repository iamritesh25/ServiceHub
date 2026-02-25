package com.servicehub.service;

import com.servicehub.dto.CreateProviderProfileDTO;
import com.servicehub.dto.ProviderProfileDTO;
import com.servicehub.entity.ProviderProfile;
import com.servicehub.entity.ServiceType;
import com.servicehub.entity.User;
import com.servicehub.entity.UserRole;
import com.servicehub.exception.BadRequestException;
import com.servicehub.exception.ResourceNotFoundException;
import com.servicehub.repository.ProviderProfileRepository;
import com.servicehub.repository.ReviewRepository;
import com.servicehub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProviderService {

    @Autowired
    private ProviderProfileRepository providerProfileRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserService userService;

    // 🔥 ADDED: to update users table location
    @Autowired
    private UserRepository userRepository;

    public ProviderProfileDTO createProviderProfile(Long userId, CreateProviderProfileDTO dto) {
        User user = userService.getUserEntity(userId);

        if (user.getRole() != UserRole.PROVIDER) {
            throw new BadRequestException("User must have PROVIDER role to create a profile");
        }

        if (providerProfileRepository.findByUserId(userId).isPresent()) {
            throw new BadRequestException("Provider profile already exists for this user");
        }

        ProviderProfile profile = new ProviderProfile(
            user,
            dto.getServiceType(),
            dto.getExperience(),
            dto.getDescription(),
            dto.getLocation()
        );

        // 🔥 ALSO update users table location
        user.setLocation(dto.getLocation());
        userRepository.save(user);

        ProviderProfile savedProfile = providerProfileRepository.save(profile);
        return convertToDTO(savedProfile);
    }

    public ProviderProfileDTO getProviderProfileById(Long id) {
        ProviderProfile profile = providerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found with id: " + id));
        return convertToDTO(profile);
    }

    public ProviderProfileDTO getProviderProfileByUserId(Long userId) {
        ProviderProfile profile = providerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found for user id: " + userId));
        return convertToDTO(profile);
    }

    public ProviderProfileDTO updateProviderProfile(Long id, CreateProviderProfileDTO dto) {
        ProviderProfile profile = providerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found with id: " + id));

        profile.setServiceType(dto.getServiceType());
        profile.setExperience(dto.getExperience());
        profile.setDescription(dto.getDescription());
        profile.setLocation(dto.getLocation());

        // 🔥 ALSO update users table location
        User user = profile.getUser();
        user.setLocation(dto.getLocation());
        userRepository.save(user);

        ProviderProfile updatedProfile = providerProfileRepository.save(profile);
        return convertToDTO(updatedProfile);
    }

    public List<ProviderProfileDTO> searchByServiceType(ServiceType serviceType) {
        return providerProfileRepository.findByServiceType(serviceType).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ProviderProfileDTO> searchByLocation(String location) {
        return providerProfileRepository.findByLocation(location).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ProviderProfileDTO> searchByServiceTypeAndLocation(ServiceType serviceType, String location) {
        return providerProfileRepository.findByServiceTypeAndLocation(serviceType, location).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ProviderProfileDTO> getAllProviders() {
        return providerProfileRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public void deleteProviderProfile(Long id) {
        if (!providerProfileRepository.existsById(id)) {
            throw new ResourceNotFoundException("Provider profile not found with id: " + id);
        }
        providerProfileRepository.deleteById(id);
    }

    public void updateProviderRating(Long providerUserId) {
        ProviderProfile profile = providerProfileRepository.findByUserId(providerUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Provider profile not found for user id: " + providerUserId));

        List<Integer> ratings = reviewRepository.findByProviderId(providerUserId).stream()
                .map(review -> review.getRating())
                .collect(Collectors.toList());

        if (ratings.isEmpty()) {
            profile.setRating(0.0);
        } else {
            double avgRating = ratings.stream()
                    .mapToInt(Integer::intValue)
                    .average()
                    .orElse(0.0);
            profile.setRating(Math.round(avgRating * 100.0) / 100.0);
        }

        providerProfileRepository.save(profile);
    }

    private ProviderProfileDTO convertToDTO(ProviderProfile profile) {
        return new ProviderProfileDTO(
            profile.getId(),
            profile.getUser().getId(),
            profile.getUser().getName(),
            profile.getUser().getEmail(),
            profile.getUser().getPhone(),
            profile.getServiceType(),
            profile.getExperience(),
            profile.getDescription(),
            profile.getLocation(),
            profile.getRating()
        );
    }

    public ProviderProfileDTO updateProviderProfileByEmail(String email,
                                                           CreateProviderProfileDTO dto) {

        ProviderProfile profile = providerProfileRepository
                .findByUser_Email(email)
                .orElse(null);

        User user = userService.getUserEntityByEmail(email);

        if (profile == null) {

            profile = new ProviderProfile(
                user,
                dto.getServiceType(),
                dto.getExperience(),
                dto.getDescription(),
                dto.getLocation()
            );

        } else {

            profile.setServiceType(dto.getServiceType());
            profile.setExperience(dto.getExperience());
            profile.setDescription(dto.getDescription());
            profile.setLocation(dto.getLocation());
        }

        // 🔥 ALSO update users table location
        user.setLocation(dto.getLocation());
        userRepository.save(user);

        ProviderProfile saved = providerProfileRepository.save(profile);

        return convertToDTO(saved);
    }
}