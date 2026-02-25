package com.servicehub.controller;

import com.servicehub.dto.CreateReviewDTO;
import com.servicehub.dto.ReviewDTO;
import com.servicehub.entity.User;
import com.servicehub.service.ReviewService;
import com.servicehub.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserService userService;

    // ✅ CUSTOMER: Create Review
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReviewDTO> createReview(
            @RequestBody CreateReviewDTO dto,
            Authentication authentication) {

        String email = authentication.getName();
        ReviewDTO response = reviewService.createReview(dto, email);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // ✅ PROVIDER: Get Own Reviews
    @GetMapping("/provider")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<List<ReviewDTO>> getProviderReviews(Authentication authentication) {

        String email = authentication.getName();
        User provider = userService.getUserEntityByEmail(email);

        List<ReviewDTO> reviews = reviewService.getReviewsForProvider(provider.getId());

        return new ResponseEntity<>(reviews, HttpStatus.OK);
    }

    // ✅ CUSTOMER: Get Own Reviews
    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<ReviewDTO>> getCustomerReviews(Authentication authentication) {

        String email = authentication.getName();
        User customer = userService.getUserEntityByEmail(email);

        List<ReviewDTO> reviews = reviewService.getReviewsByCustomer(customer.getId());

        return new ResponseEntity<>(reviews, HttpStatus.OK);
    }

    // Get Review by ID
    @GetMapping("/{id}")
    public ResponseEntity<ReviewDTO> getReviewById(@PathVariable Long id) {
        ReviewDTO response = reviewService.getReviewById(id);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Update Review
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReviewDTO> updateReview(
            @PathVariable Long id,
            @RequestBody CreateReviewDTO dto) {

        ReviewDTO response = reviewService.updateReview(id, dto);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Delete Review
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}