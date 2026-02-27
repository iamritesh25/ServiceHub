package com.servicehub.service;

import com.servicehub.dto.CreateReviewDTO;
import com.servicehub.dto.ReviewDTO;
import com.servicehub.entity.Booking;
import com.servicehub.entity.Review;
import com.servicehub.entity.User;
import com.servicehub.exception.BadRequestException;
import com.servicehub.exception.ResourceNotFoundException;
import com.servicehub.repository.BookingRepository;
import com.servicehub.repository.ReviewRepository;
import com.servicehub.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProviderService providerService;

    // ✅ CREATE REVIEW
    public ReviewDTO createReview(CreateReviewDTO dto, String customerEmail) {

        if (dto.getRating() == null || dto.getRating() < 1 || dto.getRating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }

        Booking booking = bookingRepository.findById(dto.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getStatus().equals("COMPLETED")) {
            throw new BadRequestException("You can only review completed bookings");
        }

        if (reviewRepository.existsByBookingId(dto.getBookingId())) {
            throw new BadRequestException("Review already submitted for this booking");
        }

        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new BadRequestException("You can review only your own bookings");
        }

        User provider = booking.getProvider();

        Review review = new Review();
        review.setCustomer(customer);
        review.setProvider(provider);
        review.setBooking(booking);
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());

        Review saved = reviewRepository.save(review);

        providerService.updateProviderRating(provider.getId());

        return convertToDTO(saved);
    }

    // GET BY ID
    public ReviewDTO getReviewById(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        return convertToDTO(review);
    }

    // GET PROVIDER REVIEWS
    public List<ReviewDTO> getReviewsForProvider(Long providerId) {
        return reviewRepository.findByProviderId(providerId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // GET CUSTOMER REVIEWS
    public List<ReviewDTO> getReviewsByCustomer(Long customerId) {
        return reviewRepository.findByCustomerId(customerId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // UPDATE REVIEW
    public ReviewDTO updateReview(Long id, CreateReviewDTO dto) {

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (dto.getRating() == null || dto.getRating() < 1 || dto.getRating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }

        review.setRating(dto.getRating());
        review.setComment(dto.getComment());

        Review updated = reviewRepository.save(review);

        providerService.updateProviderRating(review.getProvider().getId());

        return convertToDTO(updated);
    }

    // DELETE REVIEW
    public void deleteReview(Long id) {

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        reviewRepository.delete(review);

        providerService.updateProviderRating(review.getProvider().getId());
    }

    // DTO CONVERTER
    private ReviewDTO convertToDTO(Review review) {
        return new ReviewDTO(
                review.getId(),
                review.getCustomer().getId(),
                review.getCustomer().getName(),
                review.getProvider().getId(),
                review.getProvider().getName(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}