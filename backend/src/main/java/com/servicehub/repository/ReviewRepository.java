package com.servicehub.repository;

import com.servicehub.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProviderId(Long providerId);
    List<Review> findByCustomerId(Long customerId);
    List<Review> findByProviderIdAndCustomerId(Long providerId, Long customerId);
    boolean existsByBookingId(Long bookingId);
    @Transactional
    @Modifying
    @Query("""
        DELETE FROM Review r
        WHERE r.booking.id IN (
            SELECT b.id FROM Booking b
            WHERE b.service.id = :serviceId
        )
    """)
    void deleteReviewsByServiceId(@Param("serviceId") Long serviceId);
}
