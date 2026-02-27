package com.servicehub.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.servicehub.dto.RazorpayVerifyRequest;
import com.servicehub.entity.Booking;
import com.servicehub.entity.PaymentTransaction;
import com.servicehub.repository.BookingRepository;
import com.servicehub.repository.PaymentTransactionRepository;
import com.servicehub.repository.UserRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.Map;

@Service
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PaymentTransactionRepository transactionRepository;

    public PaymentService(BookingRepository bookingRepository,
                          UserRepository userRepository,
                          EmailService emailService,
                          PaymentTransactionRepository transactionRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.transactionRepository = transactionRepository;
    }

    /**
     * STEP 1: Create Razorpay Order — only allowed when booking is COMPLETED.
     */
    public Map<String, Object> createOrder(Long bookingId, Authentication authentication)
            throws RazorpayException {

        String email = authentication.getName();

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getCustomer().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized: Not your booking");
        }

        if ("PAID".equals(booking.getPaymentStatus())) {
            throw new RuntimeException("Already paid");
        }

        if (!"COMPLETED".equals(booking.getStatus())) {
            throw new RuntimeException("Payment is only allowed after service is COMPLETED");
        }

        long amountInPaise = (long) (booking.getService().getPrice() * 100);

        RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "booking_" + bookingId);
        orderRequest.put("payment_capture", 1);

        Order order = client.orders.create(orderRequest);

        // Persist transaction record
        PaymentTransaction txn = new PaymentTransaction();
        txn.setBooking(booking);
        txn.setRazorpayOrderId(order.get("id"));
        txn.setAmount(BigDecimal.valueOf(booking.getService().getPrice()));
        txn.setCurrency("INR");
        txn.setStatus("CREATED");
        transactionRepository.save(txn);

        return Map.of(
            "orderId",    order.get("id"),
            "amount",     amountInPaise,
            "currency",   "INR",
            "keyId",      razorpayKeyId,
            "bookingId",  bookingId,
            "serviceName", booking.getService().getName()
        );
    }

    /**
     * STEP 2: Verify Razorpay payment signature (backend-side verification).
     */
    public void verifyAndConfirmPayment(RazorpayVerifyRequest req, Authentication authentication)
            throws Exception {

        String email = authentication.getName();

        Booking booking = bookingRepository.findById(req.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getCustomer().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }

        // HMAC-SHA256 signature verification
        String payload = req.getRazorpayOrderId() + "|" + req.getRazorpayPaymentId();
        String generatedSignature = hmacSha256(payload, razorpayKeySecret);

        if (!generatedSignature.equals(req.getRazorpaySignature())) {
            throw new RuntimeException("Payment signature verification failed");
        }

        // Update booking payment status
        booking.setPaymentStatus("PAID");
        bookingRepository.save(booking);

        // Update transaction record
        transactionRepository.findByRazorpayOrderId(req.getRazorpayOrderId())
            .ifPresent(txn -> {
                txn.setRazorpayPaymentId(req.getRazorpayPaymentId());
                txn.setRazorpaySignature(req.getRazorpaySignature());
                txn.setStatus("PAID");
                transactionRepository.save(txn);
            });

        // Send email notifications
        emailService.sendCustomerPaymentConfirmation(booking);
        emailService.sendProviderPaymentNotification(booking);
    }

    // ── HMAC-SHA256 helper ──────────────────────────────────────
    private String hmacSha256(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(
                secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(hash);
    }
}
