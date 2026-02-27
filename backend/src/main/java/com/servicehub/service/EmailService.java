package com.servicehub.service;

import com.servicehub.entity.Booking;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // ─────────────────────────────────────────────────────────────────
    //  A) Customer books → email to PROVIDER
    // ─────────────────────────────────────────────────────────────────
    @Async
    public void sendProviderBookingRequestNotification(Booking booking) {
        try {
            String location = booking.getBookingLocation() != null
                    ? booking.getBookingLocation()
                    : (booking.getCustomer().getLocation() != null
                            ? booking.getCustomer().getLocation()
                            : "Not specified");

            String html = buildProviderRequestHtml(
                    booking.getProvider().getName(),
                    booking.getId(),
                    booking.getService().getName(),
                    booking.getService().getPrice(),
                    booking.getCustomer().getName(),
                    booking.getCustomer().getPhone(),
                    location
            );

            sendHtml(
                    booking.getProvider().getEmail(),
                    "📩 New Booking Request — ServiceHub #" + booking.getId(),
                    html
            );
            log.info("Booking request email sent to provider: {}", booking.getProvider().getEmail());
        } catch (Exception e) {
            log.error("Failed to send booking request email to provider: {}", e.getMessage(), e);
        }
    }

    // ─────────────────────────────────────────────────────────────────
    //  B) Provider accepts → email to CUSTOMER
    // ─────────────────────────────────────────────────────────────────
    @Async
    public void sendCustomerBookingAcceptedNotification(Booking booking) {
        try {
            String location = booking.getBookingLocation() != null
                    ? booking.getBookingLocation()
                    : (booking.getCustomer().getLocation() != null
                            ? booking.getCustomer().getLocation()
                            : "Not specified");

            String html = buildCustomerAcceptedHtml(
                    booking.getCustomer().getName(),
                    booking.getId(),
                    booking.getService().getName(),
                    booking.getService().getPrice(),
                    location,
                    booking.getProvider().getName(),
                    booking.getProvider().getPhone(),
                    booking.getProvider().getEmail()
            );

            sendHtml(
                    booking.getCustomer().getEmail(),
                    "✅ Booking Accepted — ServiceHub #" + booking.getId(),
                    html
            );
            log.info("Booking accepted email sent to customer: {}", booking.getCustomer().getEmail());
        } catch (Exception e) {
            log.error("Failed to send booking accepted email to customer: {}", e.getMessage(), e);
        }
    }

    // ─────────────────────────────────────────────────────────────────
    //  Payment confirmation → CUSTOMER
    // ─────────────────────────────────────────────────────────────────
    @Async
    public void sendCustomerPaymentConfirmation(Booking booking) {
        try {
            String html = buildPaymentConfirmationHtml(
                    booking.getCustomer().getName(),
                    booking.getId(),
                    booking.getService().getName(),
                    booking.getProvider().getName(),
                    booking.getService().getPrice()
            );

            sendHtml(
                    booking.getCustomer().getEmail(),
                    "💳 Payment Confirmed — ServiceHub #" + booking.getId(),
                    html
            );
            log.info("Payment confirmation email sent to customer: {}", booking.getCustomer().getEmail());
        } catch (Exception e) {
            log.error("Failed to send payment confirmation email: {}", e.getMessage(), e);
        }
    }

    // ─────────────────────────────────────────────────────────────────
    //  Payment notification → PROVIDER
    // ─────────────────────────────────────────────────────────────────
    @Async
    public void sendProviderPaymentNotification(Booking booking) {
        try {
            String html = buildProviderPaymentHtml(
                    booking.getProvider().getName(),
                    booking.getId(),
                    booking.getService().getName(),
                    booking.getCustomer().getName(),
                    booking.getService().getPrice()
            );

            sendHtml(
                    booking.getProvider().getEmail(),
                    "💰 Payment Received — ServiceHub #" + booking.getId(),
                    html
            );
            log.info("Payment notification email sent to provider: {}", booking.getProvider().getEmail());
        } catch (Exception e) {
            log.error("Failed to send payment notification email: {}", e.getMessage(), e);
        }
    }

    // ─────────────────────────────────────────────────────────────────
    //  C) Booking cancelled → email to CUSTOMER + PROVIDER
    // ─────────────────────────────────────────────────────────────────
    @Async
    public void sendCancellationNotifications(Booking booking) {
        try {
            String cancelledBy = "CUSTOMER".equals(booking.getCancelledBy()) ? "Customer" : "Provider";
            String reason = booking.getCancellationReason() != null ? booking.getCancellationReason() : "Not specified";

            // Email to customer
            String customerHtml = buildCancellationHtml(
                    booking.getCustomer().getName(),
                    booking.getId(),
                    booking.getService().getName(),
                    booking.getProvider().getName(),
                    booking.getService().getPrice(),
                    reason,
                    cancelledBy,
                    "customer"
            );
            sendHtml(
                    booking.getCustomer().getEmail(),
                    "❌ Booking Cancelled — ServiceHub #" + booking.getId(),
                    customerHtml
            );
            log.info("Cancellation email sent to customer: {}", booking.getCustomer().getEmail());

            // Email to provider
            String providerHtml = buildCancellationHtml(
                    booking.getProvider().getName(),
                    booking.getId(),
                    booking.getService().getName(),
                    booking.getCustomer().getName(),
                    booking.getService().getPrice(),
                    reason,
                    cancelledBy,
                    "provider"
            );
            sendHtml(
                    booking.getProvider().getEmail(),
                    "❌ Booking Cancelled — ServiceHub #" + booking.getId(),
                    providerHtml
            );
            log.info("Cancellation email sent to provider: {}", booking.getProvider().getEmail());
        } catch (Exception e) {
            log.error("Failed to send cancellation email: {}", e.getMessage(), e);
        }
    }

    // ─────────────────────────────────────────────────────────────────
    //  D) Service marked COMPLETED → email to CUSTOMER (Pay Now)
    // ─────────────────────────────────────────────────────────────────
    @Async
    public void sendServiceCompletedPayNow(Booking booking) {
        try {
            String html = buildServiceCompletedHtml(
                    booking.getCustomer().getName(),
                    booking.getId(),
                    booking.getService().getName(),
                    booking.getProvider().getName(),
                    booking.getService().getPrice()
            );
            sendHtml(
                    booking.getCustomer().getEmail(),
                    "✅ Service Completed — Pay Now | ServiceHub #" + booking.getId(),
                    html
            );
            log.info("Service completed pay-now email sent to customer: {}", booking.getCustomer().getEmail());
        } catch (Exception e) {
            log.error("Failed to send service completed email: {}", e.getMessage(), e);
        }
    }

    // ─────────────────────────────────────────────────────────────────
    //  Core HTML sender — uses MimeMessage for proper HTML rendering
    // ─────────────────────────────────────────────────────────────────
    private void sendHtml(String to, String subject, String htmlBody) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true); // true = isHtml
        mailSender.send(message);
    }

    // ─────────────────────────────────────────────────────────────────
    //  HTML Templates
    // ─────────────────────────────────────────────────────────────────

    private String wrapInLayout(String title, String bodyContent) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8">
                  <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; margin: 0; padding: 0; }
                    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
                    .header { background: linear-gradient(135deg, #1e3a8a, #2563eb); padding: 32px 40px; color: white; }
                    .header h1 { margin: 0; font-size: 22px; letter-spacing: 0.5px; }
                    .header p { margin: 6px 0 0 0; opacity: 0.85; font-size: 14px; }
                    .body { padding: 36px 40px; color: #1e293b; }
                    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
                    .info-table { width: 100%%; border-collapse: collapse; margin: 20px 0; }
                    .info-table td { padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
                    .info-table td:first-child { font-weight: 600; color: #475569; width: 40%%; }
                    .info-table td:last-child { color: #1e293b; }
                    .badge { display: inline-block; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 700; }
                    .badge-green { background: #dcfce7; color: #16a34a; }
                    .badge-blue { background: #dbeafe; color: #2563eb; }
                    .badge-yellow { background: #fef9c3; color: #92400e; }
                    .cta-btn { display: inline-block; margin-top: 24px; padding: 12px 28px; background: linear-gradient(90deg, #2563eb, #3b82f6); color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; }
                    .footer { background: #f8fafc; padding: 20px 40px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
                  </style>
                </head>
                <body>
                  <div class="wrapper">
                    <div class="header">
                      <h1>🔧 ServiceHub</h1>
                      <p>%s</p>
                    </div>
                    <div class="body">
                      %s
                    </div>
                    <div class="footer">
                      © 2025 ServiceHub. All rights reserved. | support@servicehub.com
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(title, bodyContent);
    }

    private String buildProviderRequestHtml(String providerName, Long bookingId, String serviceName,
            Double price, String customerName, String customerPhone, String location) {
        String body = """
                <p class="greeting">Hello, %s 👋</p>
                <p>You have received a <strong>new booking request</strong> on ServiceHub. Review the details below and accept or reject from your dashboard.</p>
                <table class="info-table">
                  <tr><td>Booking ID</td><td><strong>#%d</strong></td></tr>
                  <tr><td>Service</td><td>%s</td></tr>
                  <tr><td>Price</td><td>₹ %.2f</td></tr>
                  <tr><td>Customer</td><td>%s</td></tr>
                  <tr><td>Customer Phone</td><td>%s</td></tr>
                  <tr><td>Service Location</td><td>%s</td></tr>
                  <tr><td>Status</td><td><span class="badge badge-yellow">PENDING</span></td></tr>
                </table>
                <p>Please log in to your dashboard to take action.</p>
                <a href="http://localhost:5173/provider-dashboard" class="cta-btn">Open Dashboard →</a>
                """.formatted(providerName, bookingId, serviceName, price,
                customerName, customerPhone, location);
        return wrapInLayout("New Booking Request", body);
    }

    private String buildCustomerAcceptedHtml(String customerName, Long bookingId, String serviceName,
            Double price, String location, String providerName, String providerPhone, String providerEmail) {
        String body = """
                <p class="greeting">Great news, %s! 🎉</p>
                <p>Your booking has been <strong>accepted</strong> by the provider. You can now proceed with the payment.</p>
                <table class="info-table">
                  <tr><td>Booking ID</td><td><strong>#%d</strong></td></tr>
                  <tr><td>Service</td><td>%s</td></tr>
                  <tr><td>Price</td><td>₹ %.2f</td></tr>
                  <tr><td>Location</td><td>%s</td></tr>
                  <tr><td>Provider</td><td>%s</td></tr>
                  <tr><td>Provider Phone</td><td>%s</td></tr>
                  <tr><td>Provider Email</td><td>%s</td></tr>
                  <tr><td>Status</td><td><span class="badge badge-green">ACCEPTED ✅</span></td></tr>
                </table>
                <a href="http://localhost:5173/customer-dashboard" class="cta-btn">Pay Now →</a>
                """.formatted(customerName, bookingId, serviceName, price,
                location, providerName, providerPhone, providerEmail);
        return wrapInLayout("Booking Accepted", body);
    }

    private String buildPaymentConfirmationHtml(String customerName, Long bookingId,
            String serviceName, String providerName, Double price) {
        String body = """
                <p class="greeting">Hello, %s 🎉</p>
                <p>Your payment has been <strong>successfully processed</strong>. Here are your booking details:</p>
                <table class="info-table">
                  <tr><td>Booking ID</td><td><strong>#%d</strong></td></tr>
                  <tr><td>Service</td><td>%s</td></tr>
                  <tr><td>Provider</td><td>%s</td></tr>
                  <tr><td>Amount Paid</td><td><strong>₹ %.2f</strong></td></tr>
                  <tr><td>Payment Status</td><td><span class="badge badge-green">PAID ✅</span></td></tr>
                </table>
                <p>Thank you for using ServiceHub! We hope you enjoy the service.</p>
                <a href="http://localhost:5173/customer-dashboard" class="cta-btn">View Booking →</a>
                """.formatted(customerName, bookingId, serviceName, providerName, price);
        return wrapInLayout("Payment Confirmed", body);
    }

    private String buildProviderPaymentHtml(String providerName, Long bookingId,
            String serviceName, String customerName, Double price) {
        String body = """
                <p class="greeting">Hello, %s 💰</p>
                <p>A payment has been <strong>received</strong> for your service. Please proceed with completing the booking.</p>
                <table class="info-table">
                  <tr><td>Booking ID</td><td><strong>#%d</strong></td></tr>
                  <tr><td>Service</td><td>%s</td></tr>
                  <tr><td>Customer</td><td>%s</td></tr>
                  <tr><td>Amount</td><td><strong>₹ %.2f</strong></td></tr>
                  <tr><td>Payment Status</td><td><span class="badge badge-green">PAID ✅</span></td></tr>
                </table>
                <a href="http://localhost:5173/provider-dashboard" class="cta-btn">View Dashboard →</a>
                """.formatted(providerName, bookingId, serviceName, customerName, price);
        return wrapInLayout("Payment Received", body);
    }

    private String buildCancellationHtml(String recipientName, Long bookingId,
            String serviceName, String otherPartyName, Double price,
            String reason, String cancelledBy, String recipientRole) {

        String otherLabel = "customer".equals(recipientRole) ? "Provider" : "Customer";
        String body = """
                <p class="greeting">Hello, %s</p>
                <p>Your booking has been <strong>cancelled</strong>. Here are the details:</p>
                <table class="info-table">
                  <tr><td>Booking ID</td><td><strong>#%d</strong></td></tr>
                  <tr><td>Service</td><td>%s</td></tr>
                  <tr><td>%s</td><td>%s</td></tr>
                  <tr><td>Price</td><td>₹ %.2f</td></tr>
                  <tr><td>Cancelled By</td><td><strong>%s</strong></td></tr>
                  <tr><td>Reason</td><td>%s</td></tr>
                  <tr><td>Status</td><td><span class="badge badge-gray" style="background:#f1f5f9;color:#475569;">CANCELLED ❌</span></td></tr>
                </table>
                <p>If you have any questions, please contact our support team.</p>
                <a href="http://localhost:5173" class="cta-btn">Go to ServiceHub →</a>
                """.formatted(recipientName, bookingId, serviceName,
                otherLabel, otherPartyName, price, cancelledBy, reason);
        return wrapInLayout("Booking Cancelled", body);
    }

    private String buildServiceCompletedHtml(String customerName, Long bookingId,
            String serviceName, String providerName, Double price) {
        String body = """
                <p class="greeting">Hello, %s 🎊</p>
                <p>Your service has been marked as <strong>completed</strong> by the provider. Please proceed to pay for the service.</p>
                <table class="info-table">
                  <tr><td>Booking ID</td><td><strong>#%d</strong></td></tr>
                  <tr><td>Service</td><td>%s</td></tr>
                  <tr><td>Provider</td><td>%s</td></tr>
                  <tr><td>Amount Due</td><td><strong>₹ %.2f</strong></td></tr>
                  <tr><td>Status</td><td><span class="badge badge-blue">COMPLETED ✅</span></td></tr>
                </table>
                <p>Click below to go to your dashboard and complete the payment.</p>
                <a href="http://localhost:5173/customer-dashboard" class="cta-btn">Pay Now →</a>
                """.formatted(customerName, bookingId, serviceName, providerName, price);
        return wrapInLayout("Service Completed — Pay Now", body);
    }
}
