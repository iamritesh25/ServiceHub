package com.servicehub.repository;

import com.servicehub.entity.Service;
import com.servicehub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ServiceRepository extends JpaRepository<Service, Long> {

    List<Service> findByProvider(User provider);

    // 🔥 SEARCH WITH PROVIDER PROFILE (FOR RATING)
    @Query("""
        SELECT s FROM Service s
        JOIN FETCH s.provider p
        LEFT JOIN FETCH p.providerProfile
        WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
    """)
    List<Service> searchWithProviderProfile(@Param("keyword") String keyword);

    // 🔥 MY SERVICES
    @Query("""
        SELECT s FROM Service s
        JOIN FETCH s.provider p
        LEFT JOIN FETCH p.providerProfile
        WHERE p = :provider
    """)
    List<Service> findByProviderWithProfile(@Param("provider") User provider);
}