package com.servicehub.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(name = "razorpay_order_id")
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id")
    private String razorpayPaymentId;

    @Column(name = "razorpay_signature", length = 512)
    private String razorpaySignature;

    @Column(nullable = false)
    private BigDecimal amount;

    // NEW: commission tracking
    @Column(name = "commission_percent")
    private BigDecimal commissionPercent;

    @Column(name = "commission_amount")
    private BigDecimal commissionAmount;

    @Column(name = "provider_payout")
    private BigDecimal providerPayout;

    @Column(length = 10)
    private String currency = "INR";

    // CREATED | PAID | FAILED
    @Column(length = 50)
    private String status = "CREATED";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
