# 🚀 ServiceHub – Scalable Multi-Role Service Marketplace Platform

ServiceHub is a production-style full-stack service marketplace platform designed with scalable architecture principles.  
It supports Customers, Service Providers, and Admins with secure JWT authentication, Razorpay payment integration, geolocation-based service discovery, and centralized platform governance.

---

## 🏗 System Design Overview

Frontend (React)  
↓  
Stateless REST APIs (Spring Boot)  
↓  
Service Layer (Business Logic Isolation)  
↓  
JPA / Hibernate (ORM)  
↓  
PostgreSQL (Relational Persistence)

Security Layer:
- JWT-based Stateless Authentication
- Role-Based Access Control (RBAC)
- BCrypt password hashing
- Endpoint-level authorization

Governance Layer:
- SystemConfig-based dynamic configuration
- MaintenanceFilter for platform-wide request control

Payment Layer:
- Razorpay order creation
- Signature verification
- Commission calculation
- Transaction persistence

---

## 🧩 Tech Stack

**Backend:** Spring Boot, Spring Security, JWT, JPA/Hibernate, PostgreSQL  
**Frontend:** React, Axios, Context API  
**Payments:** Razorpay (Secure Order + Signature Verification)  
**Maps & Geolocation:** Location-based service access using map integration  
**Architecture:** Layered, Modular, DTO-driven  

---

## 👥 Role-Based Architecture

### 🟢 Customer
- Secure authentication (JWT)
- Browse services by location
- Map-integrated service visibility
- Book services
- Razorpay-based payment
- Booking history tracking

### 🔵 Service Provider
- Manage listed services
- Accept / reject bookings
- Track service lifecycle
- View earnings from confirmed bookings

### 🔴 Admin
- Platform-wide analytics
- User management (suspend/delete)
- Booking monitoring
- Configure commission percentage
- Enable/disable email system
- Toggle maintenance mode (graceful service shutdown)

---

## 🔐 Security & Authorization

- Stateless JWT authentication
- Role-based endpoint protection
- CustomUserDetailsService implementation
- Secure password storage (BCrypt)
- Protected Admin APIs
- MaintenanceFilter to block restricted operations dynamically

---

## 💳 Payment & Monetization Model

1. Backend creates Razorpay order
2. Frontend completes payment securely
3. Backend verifies Razorpay signature
4. Booking marked as confirmed
5. Platform commission calculated
6. Transaction stored in PaymentTransaction entity

Commission percentage is dynamically configurable via SystemConfig, enabling platform-level monetization control.

---

## 🗺 Map Integration

- Geolocation-based service discovery
- Frontend map view for service visibility
- Location-aware booking flow
- Designed for scalability toward distance-based provider matching

---

## 📊 Admin Governance System

Centralized configuration via `SystemConfig`:

- Commission percentage control
- Email notification toggle
- Maintenance mode toggle

Maintenance mode allows:
- Authentication access
- Blocking of booking operations
- Graceful operational shutdown

This mirrors real-world production governance systems.

---

## 🔄 Booking Lifecycle

1. Service Selected
2. Booking Created
3. Booking Confirmed
4. Provider Accepts
5. Service Completed
6. Payment Initiated
7. Payment Verified

---

## 📐 Architectural Decisions

- Separation of concerns (Controller → Service → Repository)
- DTO-based request/response modeling
- Stateless security model
- Configurable platform behavior
- Extensible monetization layer
- Modular admin governance
- Designed for horizontal scaling

---

## 🚀 Local Setup

### Backend
mvn clean install
mvn spring-boot:run


### Frontend
npm install
npm run dev


Environment Variables Required:
- Database credentials
- Google OAuth2 client id
- Razorpay key & secret

---

## 🎯 Engineering Highlights

✔ Multi-role RBAC architecture  
✔ Stateless authentication design  
✔ Razorpay signature verification  
✔ Dynamic commission configuration  
✔ Maintenance-mode request interception  
✔ Location-aware service discovery  
✔ Production-style layered backend  

---

## 🔮 Scalability Roadmap

- Provider wallet & settlements
- Refund handling
- WebSocket-based real-time updates
- Cloud deployment
- Containerization
- CI/CD integration
- Distance-based provider matching algorithm

---

## 👨‍💻 Author

Ritesh Shinde  
Full Stack Developer  
Spring Boot | React | PostgreSQL | Secure Distributed Systems
