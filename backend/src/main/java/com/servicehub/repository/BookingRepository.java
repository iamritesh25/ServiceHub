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

    List<Booking> findByProvider(User provider);
    List<Booking> findByCustomer(User customer);
    @Transactional
    @Modifying
    @Query("DELETE FROM Booking b WHERE b.service.id = :serviceId")
    void deleteBookingsByServiceId(@Param("serviceId") Long serviceId);
}