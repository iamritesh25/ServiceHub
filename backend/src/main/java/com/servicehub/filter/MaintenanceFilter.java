package com.servicehub.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.servicehub.repository.SystemConfigRepository;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class MaintenanceFilter implements Filter {

    private final SystemConfigRepository systemConfigRepository;
    private final ObjectMapper objectMapper;

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request  = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        String path = request.getServletPath();

        // Always allow auth and admin routes
        if (isExempt(path)) {
            chain.doFilter(req, res);
            return;
        }

        boolean maintenanceOn = systemConfigRepository.findByConfigKey("maintenance_mode")
                .map(cfg -> "true".equalsIgnoreCase(cfg.getConfigValue()))
                .orElse(false);

        if (maintenanceOn) {
            log.info("Maintenance mode ACTIVE — blocking: {}", path);
            response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
            response.setContentType("application/json");
            response.getWriter().write(
                objectMapper.writeValueAsString(Map.of(
                    "error",   "Service Unavailable",
                    "message", "Platform is under maintenance. Please try again later.",
                    "status",  503
                ))
            );
            return;
        }

        chain.doFilter(req, res);
    }

    private boolean isExempt(String path) {
        return path.startsWith("/api/auth/")
            || path.startsWith("/api/admin/")
            || path.startsWith("/uploads/")
            || path.startsWith("/v3/api-docs")
            || path.startsWith("/swagger-ui");
    }
}
