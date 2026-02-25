package com.servicehub.service;

import com.servicehub.dto.CreateServiceDTO;
import com.servicehub.entity.User;
import com.servicehub.repository.BookingRepository;
import com.servicehub.repository.ReviewRepository;
import com.servicehub.repository.ServiceRepository;
import com.servicehub.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;


@Service
public class ServiceService {

    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;

    private final BookingRepository bookingRepository;

    private final ReviewRepository reviewRepository;

    public ServiceService(ServiceRepository serviceRepository,
                          UserRepository userRepository,
                          BookingRepository bookingRepository,
                          ReviewRepository reviewRepository) {
        this.serviceRepository = serviceRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.reviewRepository = reviewRepository;
    }

    public com.servicehub.entity.Service createService(CreateServiceDTO dto,
                                                       Authentication authentication) {

        String email = authentication.getName();

        User provider = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        com.servicehub.entity.Service service =
                new com.servicehub.entity.Service();

        service.setName(dto.getName());
        service.setPrice(dto.getPrice());
        service.setDescription(dto.getDescription());
        service.setProvider(provider);

        return serviceRepository.save(service);
    }

    public List<com.servicehub.entity.Service> getMyServices(Authentication authentication) {

        String email = authentication.getName();

        User provider = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return serviceRepository.findByProviderWithProfile(provider);
    }

    public List<com.servicehub.entity.Service> searchServices(String keyword) {
        return serviceRepository.searchWithProviderProfile(keyword);
    }
    
    @Transactional
    public void deleteService(Long serviceId, Authentication authentication) {

        String email = authentication.getName();

        User provider = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        com.servicehub.entity.Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        if (!service.getProvider().getId().equals(provider.getId())) {
            throw new RuntimeException("You can delete only your own services");
        }

        // DELETE REVIEWS
        reviewRepository.deleteReviewsByServiceId(serviceId);

        // DELETE BOOKINGS
        bookingRepository.deleteBookingsByServiceId(serviceId);

        // DELETE SERVICE
        serviceRepository.delete(service);
    }
}