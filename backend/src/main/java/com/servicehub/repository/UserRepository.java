package com.servicehub.repository;

import com.servicehub.entity.User;
import com.servicehub.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    List<User> findByRole(UserRole role);
    Optional<User> findByGoogleId(String googleId);

    // Admin: search by name or email
    @Query("SELECT u FROM User u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<User> searchByNameOrEmail(@Param("q") String query);

    // Admin: filter by role
    @Query("SELECT u FROM User u WHERE (:role IS NULL OR u.role = :role) ORDER BY u.createdAt DESC")
    List<User> findByRoleOptional(@Param("role") UserRole role);

    long countByRole(UserRole role);
}
