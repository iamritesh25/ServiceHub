package com.servicehub.controller;

import com.servicehub.entity.Booking;
import com.servicehub.service.BookingService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // CUSTOMER creates booking
    @PostMapping("/{serviceId}")
    public Booking createBooking(@PathVariable Long serviceId,
                                 Authentication authentication) {
        return bookingService.createBooking(serviceId, authentication);
    }
    
    @GetMapping("/customer")
    public List<Booking> getCustomerBookings(Authentication authentication) {
        return bookingService.getCustomerBookings(authentication);
    }

    // PROVIDER views requests
    @GetMapping("/provider")
    public List<Booking> getRequests(Authentication authentication) {
        return bookingService.getProviderRequests(authentication);
    }

    // PROVIDER updates status
    @PutMapping("/{id}")
    public Booking updateStatus(@PathVariable Long id,
                                @RequestParam String status) {
        return bookingService.updateStatus(id, status);
    }
}