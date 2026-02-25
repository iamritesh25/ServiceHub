package com.servicehub.dto;

public class UpdateCustomerProfileDTO {

    private String name;
    private String phone;      // ✅ changed
    private String location;

    public String getName() {
        return name;
    }

    public String getPhone() {     // ✅ changed
        return phone;
    }

    public String getLocation() {
        return location;
    }
}