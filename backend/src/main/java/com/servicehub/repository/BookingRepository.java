package com.servicehub.repository;

import com.servicehub.entity.Booking;
import com.servicehub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    // ── Original queries ──────────────────────────────────────
    List<Booking> findByProvider(User provider);
    List<Booking> findByCustomer(User customer);

    @Transactional
    @Modifying
    @Query("DELETE FROM Booking b WHERE b.service.id = :serviceId")
    void deleteBookingsByServiceId(@Param("serviceId") Long serviceId);

    // ── NEW: Provider - sorted newest first, exclude soft-deleted ─
    @Query("SELECT b FROM Booking b WHERE b.provider = :provider AND (b.isDeleted = false OR b.isDeleted IS NULL) ORDER BY b.createdAt DESC")
    List<Booking> findByProviderOrderByCreatedAtDesc(@Param("provider") User provider);

    // ── NEW: Customer - sorted newest first, exclude soft-deleted ─
    @Query("SELECT b FROM Booking b WHERE b.customer = :customer AND (b.isDeleted = false OR b.isDeleted IS NULL) ORDER BY b.createdAt DESC")
    List<Booking> findByCustomerOrderByCreatedAtDesc(@Param("customer") User customer);

    // ── NEW: Provider with filters ────────────────────────────
    @Query("""
        SELECT b FROM Booking b
        WHERE b.provider = :provider
          AND (b.isDeleted = false OR b.isDeleted IS NULL)
          AND (:status IS NULL OR b.status = :status)
        ORDER BY b.createdAt DESC
        """)
    List<Booking> findByProviderAndStatusOrderByNewest(
        @Param("provider") User provider,
        @Param("status") String status
    );
}
