package com.servicehub.controller;

import com.servicehub.dto.RazorpayVerifyRequest;
import com.servicehub.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * POST /api/payment/create-order/{bookingId}
     * Creates a Razorpay order. Booking must be COMPLETED.
     */
    @PostMapping("/create-order/{bookingId}")
    public ResponseEntity<?> createOrder(
            @PathVariable Long bookingId,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(
                    paymentService.createOrder(bookingId, authentication)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/payment/verify
     * Verifies Razorpay payment signature and marks booking PAID.
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @RequestBody RazorpayVerifyRequest req,
            Authentication authentication) {
        try {
            paymentService.verifyAndConfirmPayment(req, authentication);
            return ResponseEntity.ok(Map.of("message", "Payment verified and confirmed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
