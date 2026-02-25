package com.servicehub.service;

import com.servicehub.entity.Booking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Send payment confirmation email to customer.
     */
    public void sendCustomerPaymentConfirmation(Booking booking) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(booking.getCustomer().getEmail());
            message.setSubject("✅ Payment Confirmed — ServiceHub Booking #" + booking.getId());
            message.setText(buildCustomerEmailBody(booking));
            mailSender.send(message);
        } catch (Exception e) {
            // Log but don't crash the payment flow
            System.err.println("Failed to send customer email: " + e.getMessage());
        }
    }

    /**
     * Send payment received notification to provider.
     */
    public void sendProviderPaymentNotification(Booking booking) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(booking.getProvider().getEmail());
            message.setSubject("💰 Payment Received — ServiceHub Booking #" + booking.getId());
            message.setText(buildProviderEmailBody(booking));
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send provider email: " + e.getMessage());
        }
    }

    private String buildCustomerEmailBody(Booking booking) {
        return """
                Dear %s,

                Your payment has been successfully processed. Here are your booking details:

                ─────────────────────────────
                  Booking ID     : #%d
                  Service        : %s
                  Provider       : %s
                  Amount Paid    : ₹ %.2f
                  Payment Status : PAID ✅
                ─────────────────────────────

                Thank you for using ServiceHub!

                Regards,
                The ServiceHub Team
                """.formatted(
                booking.getCustomer().getName(),
                booking.getId(),
                booking.getService().getName(),
                booking.getProvider().getName(),
                booking.getService().getPrice()
        );
    }

    private String buildProviderEmailBody(Booking booking) {
        return """
                Dear %s,

                Great news! A payment has been received for your service. Details below:

                ─────────────────────────────
                  Booking ID     : #%d
                  Service        : %s
                  Customer       : %s
                  Amount         : ₹ %.2f
                  Payment Status : PAID ✅
                ─────────────────────────────

                The customer has completed their payment. Please proceed with the service.

                Regards,
                The ServiceHub Team
                """.formatted(
                booking.getProvider().getName(),
                booking.getId(),
                booking.getService().getName(),
                booking.getCustomer().getName(),
                booking.getService().getPrice()
        );
    }
}
