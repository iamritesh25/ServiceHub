package com.servicehub.repository;

import com.servicehub.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    Optional<PaymentTransaction> findByBookingId(Long bookingId);
    Optional<PaymentTransaction> findByRazorpayOrderId(String orderId);
}
