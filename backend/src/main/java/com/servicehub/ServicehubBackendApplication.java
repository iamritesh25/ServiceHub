package com.servicehub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ServicehubBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServicehubBackendApplication.class, args);
    }
}
