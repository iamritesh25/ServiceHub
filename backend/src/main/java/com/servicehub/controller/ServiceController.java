package com.servicehub.controller;

import com.servicehub.dto.CreateServiceDTO;
import com.servicehub.entity.Service;
import com.servicehub.service.ServiceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    private final ServiceService serviceService;

    public ServiceController(ServiceService serviceService) {
        this.serviceService = serviceService;
    }

    @PostMapping
    public Service createService(@RequestBody CreateServiceDTO dto,
                                 Authentication authentication) {
        return serviceService.createService(dto, authentication);
    }

    @GetMapping("/my")
    public List<Service> getMyServices(Authentication authentication) {
        return serviceService.getMyServices(authentication);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Service>> searchServices(@RequestParam String keyword) {
        return ResponseEntity.ok(serviceService.searchServices(keyword));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteService(@PathVariable Long id,
                                           Authentication authentication) {
        serviceService.deleteService(id, authentication);
        return ResponseEntity.ok("Service deleted successfully");
    }
}