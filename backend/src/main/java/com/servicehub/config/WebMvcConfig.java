package com.servicehub.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads/profile-images}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Resolve to absolute path so it works on both Windows and Linux
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();

        // Map /uploads/profile-images/** → the absolute uploads folder
        registry.addResourceHandler("/uploads/profile-images/**")
                .addResourceLocations("file:" + uploadPath + "/");
    }
}