package com.servicehub.controller;

import com.servicehub.dto.CancellationRequest;
import com.servicehub.entity.Booking;
import com.servicehub.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/{serviceId}")
    public Booking createBooking(@PathVariable Long serviceId,
                                 @RequestBody(required = false) Map<String, Object> body,
                                 Authentication authentication) {

        String bookingLocation = null;
        Double bookingLatitude = null;
        Double bookingLongitude = null;

        if (body != null) {
            if (body.get("bookingLocation") instanceof String s && !s.isBlank()) {
                bookingLocation = s;
            }
            if (body.get("bookingLatitude") instanceof Number n) bookingLatitude = n.doubleValue();
            if (body.get("bookingLongitude") instanceof Number n) bookingLongitude = n.doubleValue();
        }

        return bookingService.createBooking(serviceId, bookingLocation,
                bookingLatitude, bookingLongitude, authentication);
    }

    @GetMapping("/customer")
    public List<Booking> getCustomerBookings(Authentication authentication) {
        return bookingService.getCustomerBookings(authentication);
    }

    /**
     * GET /api/bookings/provider?status=PENDING&sort=DESC
     * Supports optional filtering by status and sort direction.
     */
    @GetMapping("/provider")
    public List<Booking> getRequests(
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "DESC") String sort,
            Authentication authentication) {
        return bookingService.getProviderRequestsFiltered(status, sort, authentication);
    }

    @PutMapping("/{id}")
    public Booking updateStatus(@PathVariable Long id, @RequestParam String status) {
        return bookingService.updateStatus(id, status);
    }

    /**
     * POST /api/bookings/{id}/cancel
     * Cancel booking with mandatory reason. Available to customer and provider.
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(
            @PathVariable Long id,
            @RequestBody CancellationRequest req,
            Authentication authentication) {
        try {
            Booking b = bookingService.cancelBooking(id, req, authentication);
            return ResponseEntity.ok(b);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DELETE /api/bookings/{id}
     * Soft-delete a booking. Only allowed after status = COMPLETED.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            bookingService.deleteBooking(id, authentication);
            return ResponseEntity.ok(Map.of("message", "Booking deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
