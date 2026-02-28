package com.servicehub.repository;

import com.servicehub.entity.Booking;
import com.servicehub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByProvider(User provider);
    List<Booking> findByCustomer(User customer);

    @Transactional
    @Modifying
    @Query("DELETE FROM Booking b WHERE b.service.id = :serviceId")
    void deleteBookingsByServiceId(@Param("serviceId") Long serviceId);

    @Query("SELECT b FROM Booking b WHERE b.provider = :provider AND (b.isDeleted = false OR b.isDeleted IS NULL) ORDER BY b.createdAt DESC")
    List<Booking> findByProviderOrderByCreatedAtDesc(@Param("provider") User provider);

    @Query("SELECT b FROM Booking b WHERE b.customer = :customer AND (b.isDeleted = false OR b.isDeleted IS NULL) ORDER BY b.createdAt DESC")
    List<Booking> findByCustomerOrderByCreatedAtDesc(@Param("customer") User customer);

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

    // ── Admin queries ────────────────────────────────────────

    @Query("SELECT b FROM Booking b WHERE (b.isDeleted = false OR b.isDeleted IS NULL) ORDER BY b.createdAt DESC")
    List<Booking> findAllActive();

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status AND (b.isDeleted = false OR b.isDeleted IS NULL)")
    long countByStatus(@Param("status") String status);

    @Query("SELECT COUNT(b) FROM Booking b WHERE (b.isDeleted = false OR b.isDeleted IS NULL)")
    long countActive();

    @Query("""
        SELECT FUNCTION('TO_CHAR', b.createdAt, 'YYYY-MM') as month,
               SUM(CASE WHEN b.paymentStatus = 'PAID' THEN b.service.price ELSE 0 END) as revenue,
               COUNT(b.id) as bookings
        FROM Booking b
        WHERE b.createdAt >= :since AND (b.isDeleted = false OR b.isDeleted IS NULL)
        GROUP BY FUNCTION('TO_CHAR', b.createdAt, 'YYYY-MM')
        ORDER BY month ASC
        """)
    List<Object[]> revenueAndBookingsByMonth(@Param("since") LocalDateTime since);

    @Query("""
        SELECT b.service.name, COUNT(b.id) as cnt
        FROM Booking b
        WHERE (b.isDeleted = false OR b.isDeleted IS NULL)
        GROUP BY b.service.name
        ORDER BY cnt DESC
        """)
    List<Object[]> topServices();

    @Query("SELECT SUM(b.service.price) FROM Booking b WHERE b.paymentStatus = 'PAID' AND (b.isDeleted = false OR b.isDeleted IS NULL)")
    Double totalRevenue();

    @Query("""
        SELECT b FROM Booking b
        WHERE (b.isDeleted = false OR b.isDeleted IS NULL)
          AND (:status IS NULL OR b.status = :status)
          AND (:providerEmail IS NULL OR b.provider.email = :providerEmail)
          AND (:customerEmail IS NULL OR b.customer.email = :customerEmail)
        ORDER BY b.createdAt DESC
        """)
    List<Booking> adminFilterBookings(
        @Param("status") String status,
        @Param("providerEmail") String providerEmail,
        @Param("customerEmail") String customerEmail
    );
}
