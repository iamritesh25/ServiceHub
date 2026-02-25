package com.servicehub.service;

import com.servicehub.entity.Booking;
import com.servicehub.entity.User;
import com.servicehub.repository.BookingRepository;
import com.servicehub.repository.ServiceRepository;
import com.servicehub.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;

    public BookingService(BookingRepository bookingRepository,
                          UserRepository userRepository,
                          ServiceRepository serviceRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.serviceRepository = serviceRepository;
    }

    // 🔵 Provider Dashboard - View Requests
    public List<Booking> getProviderRequests(Authentication authentication) {

        String email = authentication.getName();

        User provider = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return bookingRepository.findByProvider(provider);  // ✅ FIXED
    }

    // 🔵 Provider updates booking status
    public Booking updateStatus(Long bookingId, String status) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(status);

        return bookingRepository.save(booking);
    }

    // 🔵 NEW: Customer creates booking
    public Booking createBooking(Long serviceId, Authentication authentication) {

        String email = authentication.getName();

        User customer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        com.servicehub.entity.Service service =
                serviceRepository.findById(serviceId)
                        .orElseThrow(() -> new RuntimeException("Service not found"));

        User provider = service.getProvider();

        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setProvider(provider);
        booking.setService(service);
        booking.setStatus("PENDING");
        booking.setPaymentStatus("UNPAID");
        booking.setCreatedAt(LocalDateTime.now());

        return bookingRepository.save(booking);
    }
    
    public List<Booking> getCustomerBookings(Authentication authentication) {

        String email = authentication.getName();

        User customer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return bookingRepository.findByCustomer(customer);
    }
}