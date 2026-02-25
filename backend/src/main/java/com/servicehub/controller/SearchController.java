package com.servicehub.controller;

import com.servicehub.dto.ProviderProfileDTO;
import com.servicehub.entity.ServiceType;
import com.servicehub.service.ProviderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/providers")
public class SearchController {

    @Autowired
    private ProviderService providerService;

    // Search providers by service type and location
    @GetMapping
    public ResponseEntity<List<ProviderProfileDTO>> searchProviders(
            @RequestParam(required = false) ServiceType serviceType,
            @RequestParam(required = false) String location) {

        List<ProviderProfileDTO> response;

        if (serviceType != null && location != null) {
            response = providerService.searchByServiceTypeAndLocation(serviceType, location);
        } else if (serviceType != null) {
            response = providerService.searchByServiceType(serviceType);
        } else if (location != null) {
            response = providerService.searchByLocation(location);
        } else {
            response = providerService.getAllProviders();
        }

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
