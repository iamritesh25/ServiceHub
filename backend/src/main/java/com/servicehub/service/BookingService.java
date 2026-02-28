package com.servicehub.service;

import com.servicehub.dto.CancellationRequest;
import com.servicehub.entity.Booking;
import com.servicehub.entity.User;
import com.servicehub.repository.BookingRepository;
import com.servicehub.repository.ServiceRepository;
import com.servicehub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final EmailService emailService;

    public List<Booking> getProviderRequests(Authentication authentication) {
        User provider = getUserFromAuth(authentication);
        return bookingRepository.findByProviderOrderByCreatedAtDesc(provider);
    }

    public List<Booking> getProviderRequestsFiltered(String status, String sortDir,
            Authentication authentication) {
        User provider = getUserFromAuth(authentication);
        List<Booking> bookings = (status != null && !status.isBlank())
                ? bookingRepository.findByProviderAndStatusOrderByNewest(provider, status.toUpperCase())
                : bookingRepository.findByProviderOrderByCreatedAtDesc(provider);

        if ("ASC".equalsIgnoreCase(sortDir)) {
            bookings = bookings.stream()
                    .sorted(Comparator.comparing(Booking::getCreatedAt))
                    .collect(Collectors.toList());
        }
        return bookings;
    }

    public List<Booking> getCustomerBookings(Authentication authentication) {
        User customer = getUserFromAuth(authentication);
        return bookingRepository.findByCustomerOrderByCreatedAtDesc(customer);
    }

    public Booking updateStatus(Long bookingId, String status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(status);
        Booking saved = bookingRepository.save(booking);

        if ("ACCEPTED".equalsIgnoreCase(status)) {
            emailService.sendCustomerBookingAcceptedNotification(saved);
        } else if ("COMPLETED".equalsIgnoreCase(status)) {
            emailService.sendServiceCompletedPayNow(saved);
        }
        return saved;
    }

    public Booking createBooking(Long serviceId,
                                 String bookingLocation,
                                 Double bookingLatitude,
                                 Double bookingLongitude,
                                 Authentication authentication) {

        User customer = getUserFromAuth(authentication);
        com.servicehub.entity.Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setProvider(service.getProvider());
        booking.setService(service);
        booking.setStatus("PENDING");
        booking.setPaymentStatus("UNPAID");
        booking.setIsDeleted(false);
        booking.setCreatedAt(LocalDateTime.now());

        if (bookingLocation != null && !bookingLocation.isBlank()) {
            booking.setBookingLocation(bookingLocation);
            booking.setBookingLatitude(bookingLatitude);
            booking.setBookingLongitude(bookingLongitude);
        } else {
            booking.setBookingLocation(customer.getLocation());
            booking.setBookingLatitude(customer.getLatitude());
            booking.setBookingLongitude(customer.getLongitude());
        }

        Booking saved = bookingRepository.save(booking);
        emailService.sendProviderBookingRequestNotification(saved);
        return saved;
    }

    public Booking cancelBooking(Long bookingId, CancellationRequest req,
            Authentication authentication) {

        User user = getUserFromAuth(authentication);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        boolean isCustomer = booking.getCustomer().getEmail().equals(user.getEmail());
        boolean isProvider = booking.getProvider().getEmail().equals(user.getEmail());

        if (!isCustomer && !isProvider) {
            throw new RuntimeException("Unauthorized: Cannot cancel this booking");
        }

        if ("COMPLETED".equals(booking.getStatus()) || "CANCELLED".equals(booking.getStatus())) {
            throw new RuntimeException("Cannot cancel a booking that is " + booking.getStatus());
        }

        if (req.getReason() == null || req.getReason().isBlank()) {
            throw new RuntimeException("Cancellation reason is required");
        }

        booking.setStatus("CANCELLED");
        booking.setCancellationReason(req.getReason());
        booking.setCancelledBy(isCustomer ? "CUSTOMER" : "PROVIDER");
        booking.setCancelledAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);
        emailService.sendCancellationNotifications(saved);
        return saved;
    }

    /**
     * Soft delete — EXTENDED: now allows COMPLETED, CANCELLED, and REJECTED bookings.
     */
    public void deleteBooking(Long bookingId, Authentication authentication) {

        User user = getUserFromAuth(authentication);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        boolean isCustomer = booking.getCustomer().getEmail().equals(user.getEmail());
        boolean isProvider = booking.getProvider().getEmail().equals(user.getEmail());

        if (!isCustomer && !isProvider) {
            throw new RuntimeException("Unauthorized: Cannot delete this booking");
        }

        // Allow delete for COMPLETED, CANCELLED, or REJECTED
        List<String> deletableStatuses = List.of("COMPLETED", "CANCELLED", "REJECTED");
        if (!deletableStatuses.contains(booking.getStatus())) {
            throw new RuntimeException(
                "Booking can only be deleted when status is COMPLETED, CANCELLED, or REJECTED. Current: " + booking.getStatus()
            );
        }

        booking.setIsDeleted(true);
        booking.setDeletedAt(LocalDateTime.now());
        bookingRepository.save(booking);
    }

    private User getUserFromAuth(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
