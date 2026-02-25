package com.servicehub.repository;

import com.servicehub.entity.ProviderProfile;
import com.servicehub.entity.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProviderProfileRepository extends JpaRepository<ProviderProfile, Long> {

    Optional<ProviderProfile> findByUserId(Long userId);

    // ✅ FIXED (IMPORTANT)
    Optional<ProviderProfile> findByUser_Email(String email);

    List<ProviderProfile> findByServiceType(ServiceType serviceType);

    List<ProviderProfile> findByLocation(String location);

    List<ProviderProfile> findByServiceTypeAndLocation(ServiceType serviceType, String location);
}