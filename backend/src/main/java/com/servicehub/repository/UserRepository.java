package com.servicehub.repository;

import com.servicehub.entity.User;
import com.servicehub.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    List<User> findByRole(UserRole role);

    // NEW: Google OAuth lookup
    Optional<User> findByGoogleId(String googleId);
}
