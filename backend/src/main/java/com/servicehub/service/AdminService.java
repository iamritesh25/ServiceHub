package com.servicehub.service;

import com.servicehub.dto.*;
import com.servicehub.entity.*;
import com.servicehub.exception.ResourceNotFoundException;
import com.servicehub.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final SystemConfigRepository systemConfigRepository;

    // ── User Management ──────────────────────────────────────

    public List<AdminUserDTO> getAllUsers(String role, String search) {
        List<User> users;

        if (search != null && !search.isBlank()) {
            users = userRepository.searchByNameOrEmail(search);
        } else if (role != null && !role.isBlank()) {
            try {
                UserRole userRole = UserRole.valueOf(role.toUpperCase());
                users = userRepository.findByRole(userRole);
            } catch (IllegalArgumentException e) {
                users = userRepository.findAll();
            }
        } else {
            users = userRepository.findAll();
        }

        return users.stream()
                .filter(u -> u.getRole() != UserRole.ADMIN)
                .filter(u -> !Boolean.TRUE.equals(u.getIsDeleted()))
                .map(AdminUserDTO::from)
                .collect(Collectors.toList());
    }

    public AdminUserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        return AdminUserDTO.from(user);
    }

    public List<AdminBookingDTO> getBookingsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        List<Booking> bookings;
        if (user.getRole() == UserRole.CUSTOMER) {
            bookings = bookingRepository.findByCustomer(user);
        } else {
            bookings = bookingRepository.findByProvider(user);
        }
        return bookings.stream().map(AdminBookingDTO::from).collect(Collectors.toList());
    }

    public AdminUserDTO suspendUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        if (user.getRole() == UserRole.ADMIN) {
            throw new RuntimeException("Cannot suspend admin users");
        }
        user.setStatus("SUSPENDED");
        return AdminUserDTO.from(userRepository.save(user));
    }

    public AdminUserDTO activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        user.setStatus("ACTIVE");
        return AdminUserDTO.from(userRepository.save(user));
    }

    /**
     * Soft delete — sets isDeleted=true and status=DELETED. User cannot log in.
     */
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        if (user.getRole() == UserRole.ADMIN) {
            throw new RuntimeException("Cannot delete admin users");
        }
        user.setIsDeleted(true);
        user.setDeletedAt(LocalDateTime.now());
        user.setStatus("DELETED");
        userRepository.save(user);
    }

    // ── Booking Management ────────────────────────────────────

    public List<AdminBookingDTO> getAllBookings(String status, String providerEmail, String customerEmail) {
        return bookingRepository.adminFilterBookings(
                (status != null && !status.isBlank()) ? status.toUpperCase() : null,
                (providerEmail != null && !providerEmail.isBlank()) ? providerEmail : null,
                (customerEmail != null && !customerEmail.isBlank()) ? customerEmail : null
        ).stream().map(AdminBookingDTO::from).collect(Collectors.toList());
    }

    public AdminBookingDTO forceCancelBooking(Long bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if ("CANCELLED".equals(booking.getStatus())) {
            throw new RuntimeException("Booking is already cancelled");
        }

        booking.setStatus("CANCELLED");
        booking.setCancellationReason(reason != null ? reason : "Admin action");
        booking.setCancelledBy("ADMIN");
        booking.setCancelledAt(LocalDateTime.now());
        return AdminBookingDTO.from(bookingRepository.save(booking));
    }

    public AdminBookingDTO markBookingCompleted(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if ("COMPLETED".equals(booking.getStatus())) {
            throw new RuntimeException("Booking is already completed");
        }

        booking.setStatus("COMPLETED");
        return AdminBookingDTO.from(bookingRepository.save(booking));
    }

    public List<PaymentTransaction> getAllTransactions() {
        return paymentTransactionRepository.findAll();
    }

    public Map<String, Object> mockRefund(Long transactionId) {
        PaymentTransaction tx = paymentTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + transactionId));

        Map<String, Object> result = new HashMap<>();
        result.put("transactionId", tx.getId());
        result.put("razorpayOrderId", tx.getRazorpayOrderId());
        result.put("amount", tx.getAmount());
        result.put("commissionAmount", tx.getCommissionAmount());
        result.put("providerPayout", tx.getProviderPayout());
        result.put("currency", tx.getCurrency());
        result.put("refundStatus", "MOCK_REFUND_INITIATED");
        result.put("message", "Test-mode mock refund. In production, integrate Razorpay Refund API.");
        result.put("timestamp", LocalDateTime.now());
        return result;
    }

    // ── Analytics ────────────────────────────────────────────

    public AdminAnalyticsDTO getAnalytics() {
        AdminAnalyticsDTO dto = new AdminAnalyticsDTO();

        long providers  = userRepository.countByRole(UserRole.PROVIDER);
        long customers  = userRepository.countByRole(UserRole.CUSTOMER);
        long totalUsers = providers + customers;
        long totalBook  = bookingRepository.countActive();
        long cancelled  = bookingRepository.countByStatus("CANCELLED");
        Double rev      = bookingRepository.totalRevenue();

        // Commission earned from paid transactions
        Double commissionEarned = paymentTransactionRepository.totalCommissionEarned();

        dto.setTotalUsers(totalUsers);
        dto.setTotalProviders(providers);
        dto.setTotalCustomers(customers);
        dto.setTotalBookings(totalBook);
        dto.setTotalRevenue(rev != null ? rev : 0.0);
        dto.setCommissionEarned(commissionEarned != null ? commissionEarned : 0.0);
        dto.setCancelRate(totalBook > 0 ? (double) cancelled / totalBook * 100 : 0.0);

        List<Object[]> topSvc = bookingRepository.topServices();
        if (!topSvc.isEmpty()) {
            dto.setMostPopularService((String) topSvc.get(0)[0]);
        }

        LocalDateTime since = LocalDateTime.now().minusMonths(12);
        List<Object[]> monthlyData = bookingRepository.revenueAndBookingsByMonth(since);
        List<Map<String, Object>> revenueByMonth = new ArrayList<>();
        List<Map<String, Object>> bookingTrends  = new ArrayList<>();

        for (Object[] row : monthlyData) {
            Map<String, Object> rm = new HashMap<>();
            rm.put("month", row[0]);
            rm.put("revenue", row[1] != null ? ((Number) row[1]).doubleValue() : 0.0);
            revenueByMonth.add(rm);

            Map<String, Object> bm = new HashMap<>();
            bm.put("month", row[0]);
            bm.put("bookings", row[2] != null ? ((Number) row[2]).longValue() : 0L);
            bookingTrends.add(bm);
        }

        dto.setRevenueByMonth(revenueByMonth);
        dto.setBookingTrends(bookingTrends);

        return dto;
    }

    // ── System Config ─────────────────────────────────────────

    public Map<String, String> getSystemConfig() {
        List<SystemConfig> configs = systemConfigRepository.findAll();
        Map<String, String> result = new HashMap<>();
        for (SystemConfig cfg : configs) {
            result.put(cfg.getConfigKey(), cfg.getConfigValue());
        }
        result.putIfAbsent("commission_percent", "10.0");
        result.putIfAbsent("email_notifications", "true");
        result.putIfAbsent("maintenance_mode", "false");
        return result;
    }

    public Map<String, String> updateSystemConfig(Map<String, String> updates) {
        for (Map.Entry<String, String> entry : updates.entrySet()) {
            SystemConfig cfg = systemConfigRepository.findByConfigKey(entry.getKey())
                    .orElse(new SystemConfig());
            cfg.setConfigKey(entry.getKey());
            cfg.setConfigValue(entry.getValue());
            systemConfigRepository.save(cfg);
        }
        return getSystemConfig();
    }

    public List<Map<String, Object>> getSystemLogs() {
        List<Map<String, Object>> logs = new ArrayList<>();
        List<Booking> recent = bookingRepository.findAllActive().stream()
                .limit(50)
                .collect(Collectors.toList());

        for (Booking b : recent) {
            Map<String, Object> log = new HashMap<>();
            log.put("type", "BOOKING_EVENT");
            log.put("bookingId", b.getId());
            log.put("status", b.getStatus());
            log.put("customer", b.getCustomer() != null ? b.getCustomer().getEmail() : null);
            log.put("provider", b.getProvider() != null ? b.getProvider().getEmail() : null);
            log.put("timestamp", b.getCreatedAt());
            logs.add(log);
        }
        return logs;
    }
}
