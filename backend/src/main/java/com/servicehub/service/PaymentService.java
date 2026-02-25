package com.servicehub.service;

import com.servicehub.entity.Booking;
import com.servicehub.repository.BookingRepository;
import com.servicehub.repository.UserRepository;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import java.util.Map;

@Service
public class PaymentService {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public PaymentService(BookingRepository bookingRepository,
                          UserRepository userRepository,
                          EmailService emailService) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    // STEP 1: Create PaymentIntent
    public Map<String, Object> createOrder(Long bookingId, Authentication authentication)
            throws Exception {

        Stripe.apiKey = stripeSecretKey;

        String email = authentication.getName();

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getCustomer().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized: Not your booking");
        }

        if ("PAID".equals(booking.getPaymentStatus())) {
            throw new RuntimeException("Already paid");
        }

        if (!"ACCEPTED".equals(booking.getStatus())) {
            throw new RuntimeException("Booking must be ACCEPTED before payment");
        }

        long amountInPaise = (long) (booking.getService().getPrice() * 100);

        PaymentIntentCreateParams params =
                PaymentIntentCreateParams.builder()
                        .setAmount(amountInPaise)
                        .setCurrency("inr")
                        .setAutomaticPaymentMethods(
                                PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                        .setEnabled(true)
                                        .build()
                        )
                        .putMetadata("bookingId", bookingId.toString())
                        .build();

        PaymentIntent intent = PaymentIntent.create(params);

        return Map.of(
                "clientSecret", intent.getClientSecret(),
                "bookingId", bookingId,
                "amount", amountInPaise
        );
    }

    // STEP 2: Verify Payment
    public Map<String, String> verifyAndComplete(
            Long bookingId,
            String paymentIntentId,
            Authentication authentication) throws Exception {

        Stripe.apiKey = stripeSecretKey;

        String email = authentication.getName();

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getCustomer().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }

        PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);

        if (!"succeeded".equals(intent.getStatus())) {
            throw new RuntimeException("Payment not successful");
        }

        booking.setPaymentStatus("PAID");
        bookingRepository.save(booking);

        emailService.sendCustomerPaymentConfirmation(booking);
        emailService.sendProviderPaymentNotification(booking);

        return Map.of(
                "status", "PAID",
                "message", "Payment successful! Emails sent."
        );
    }

    public Map<String, String> createCheckoutSession(Long bookingId, Authentication authentication) throws Exception {

        Stripe.apiKey = stripeSecretKey;

        String email = authentication.getName();

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getCustomer().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }

        if ("PAID".equals(booking.getPaymentStatus())) {
            throw new RuntimeException("Already paid");
        }

        if (!"ACCEPTED".equals(booking.getStatus())) {
            throw new RuntimeException("Booking must be ACCEPTED");
        }

        long amount = (long) (booking.getService().getPrice() * 100);

        SessionCreateParams params =
                SessionCreateParams.builder()
                        .setMode(SessionCreateParams.Mode.PAYMENT)
                        .setSuccessUrl("http://localhost:5173/payment-success?bookingId=" + bookingId)
                        .setCancelUrl("http://localhost:5173/payment-cancel")
                        .addLineItem(
                                SessionCreateParams.LineItem.builder()
                                        .setQuantity(1L)
                                        .setPriceData(
                                                SessionCreateParams.LineItem.PriceData.builder()
                                                        .setCurrency("inr")
                                                        .setUnitAmount(amount)
                                                        .setProductData(
                                                                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                        .setName(booking.getService().getName())
                                                                        .build()
                                                        )
                                                        .build()
                                        )
                                        .build()
                        )
                        .build();

        Session session = Session.create(params);

        return Map.of("checkoutUrl", session.getUrl());
    }
}