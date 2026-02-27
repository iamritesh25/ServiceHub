package com.servicehub.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "service_id")
    @JsonIgnoreProperties({"provider"})
    private Service service;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    @JsonIgnoreProperties({"providerProfile", "bookings"})
    private User customer;

    @ManyToOne
    @JoinColumn(name = "provider_id")
    @JsonIgnoreProperties({"providerProfile", "bookings"})
    private User provider;

    // PENDING | ACCEPTED | REJECTED | COMPLETED | CANCELLED
    private String status;

    // UNPAID | PAID
    private String paymentStatus;

    @Column(name = "booking_location")
    private String bookingLocation;

    @Column(name = "booking_latitude")
    private Double bookingLatitude;

    @Column(name = "booking_longitude")
    private Double bookingLongitude;

    // ── NEW: Cancellation fields ─────────────────────────────
    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "cancelled_by", length = 50)
    private String cancelledBy;   // CUSTOMER | PROVIDER

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;
    // ─────────────────────────────────────────────────────────

    // ── NEW: Soft delete ─────────────────────────────────────
    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    // ─────────────────────────────────────────────────────────

    private LocalDateTime createdAt = LocalDateTime.now();
}
