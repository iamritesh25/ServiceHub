package com.servicehub.controller;

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

    // ================= CREATE PAYMENT (Stripe PaymentIntent) =================
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

    // ================= VERIFY PAYMENT =================
    @PostMapping("/verify/{bookingId}")
    public ResponseEntity<?> verifyPayment(
            @PathVariable Long bookingId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {

        try {
            return ResponseEntity.ok(
                    paymentService.verifyAndComplete(
                            bookingId,
                            body.get("paymentIntentId"),
                            authentication
                    )
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
    @PostMapping("/create-checkout/{bookingId}")
    public ResponseEntity<?> createCheckout(
            @PathVariable Long bookingId,
            Authentication authentication) {

        try {
            return ResponseEntity.ok(
                    paymentService.createCheckoutSession(bookingId, authentication)
            );
        } catch (Exception e) {
            e.printStackTrace(); // VERY IMPORTANT to see real error
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}