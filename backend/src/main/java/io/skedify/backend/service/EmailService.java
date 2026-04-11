package io.skedify.backend.service;

import io.skedify.backend.entity.Booking;
import io.skedify.backend.entity.Profile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Value("${resend.api-key:}")
    private String resendApiKey;

    @Value("${resend.from-email:noreply@skedify.io}")
    private String fromEmail;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendEmail(String to, String subject, String htmlBody) {
        if (resendApiKey == null || resendApiKey.isBlank()) {
            log.warn("Resend API key not configured — skipping email to {}", to);
            return;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + resendApiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new HashMap<>();
            body.put("from", fromEmail);
            body.put("to", List.of(to));
            body.put("subject", subject);
            body.put("html", htmlBody);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            restTemplate.postForObject("https://api.resend.com/emails", request, Map.class);
            log.info("Email sent to {}: {}", to, subject);
        } catch (Exception e) {
            log.error("Email send failed to {}: {}", to, e.getMessage());
        }
    }

    /**
     * Contact form — notifies profile owner.
     * Called from ProfileService.sendContact()
     */
    public void sendContactEmail(String ownerEmail, String ownerDisplayName,
                                  String clientName, String clientEmail, String message) {
        sendEmail(
                ownerEmail,
                "New message from " + clientName,
                "<h2>Someone wrote through your Skedify profile!</h2>" +
                "<p><b>To:</b> " + ownerDisplayName + "</p>" +
                "<p><b>From:</b> " + clientName + " (<a href='mailto:" + clientEmail + "'>" + clientEmail + "</a>)</p>" +
                "<p><b>Message:</b></p>" +
                "<blockquote style='border-left:4px solid #3B82F6;padding-left:12px;color:#374151'>" + message + "</blockquote>" +
                "<p><a href='https://skedify-io.vercel.app/dashboard'>Go to Dashboard →</a></p>"
        );
    }

    /**
     * New booking — notifies profile owner.
     * Called from BookingService.createBooking()
     */
    public void sendNewBookingNotification(Profile profile, Booking booking) {
        String ownerEmail = profile.getUser().getEmail();
        if (ownerEmail == null || ownerEmail.isBlank()) return;

        String ownerName = profile.getDisplayName() != null ? profile.getDisplayName() : profile.getUsername();
        sendEmail(
                ownerEmail,
                "New booking from " + booking.getClientName(),
                "<h2>You have a new booking!</h2>" +
                "<p><b>Client:</b> " + booking.getClientName() +
                " (<a href='mailto:" + booking.getClientEmail() + "'>" + booking.getClientEmail() + "</a>)</p>" +
                "<p><b>Date:</b> " + booking.getDate() + " · " + booking.getStartTime() + " – " + booking.getEndTime() + "</p>" +
                (booking.getClientMessage() != null && !booking.getClientMessage().isBlank()
                        ? "<p><b>Message:</b> " + booking.getClientMessage() + "</p>"
                        : "") +
                "<p><a href='https://skedify-io.vercel.app/dashboard'>Manage booking →</a></p>"
        );
    }

    /**
     * Booking confirmed — notifies client.
     * Called from BookingService.confirmBooking()
     */
    public void sendBookingConfirmation(Profile profile, Booking booking) {
        String ownerName = profile.getDisplayName() != null ? profile.getDisplayName() : profile.getUsername();
        sendEmail(
                booking.getClientEmail(),
                "Meeting confirmed! ✓",
                "<h2>Your meeting has been confirmed!</h2>" +
                "<p><b>With:</b> " + ownerName + "</p>" +
                "<p><b>Date:</b> " + booking.getDate() + " · " + booking.getStartTime() + " – " + booking.getEndTime() + "</p>" +
                "<p>See you then!</p>"
        );
    }

    /**
     * Payment failed — notifies customer.
     * Called from StripeService.handlePaymentFailed()
     */
    public void sendPaymentFailedEmail(String customerEmail) {
        sendEmail(
                customerEmail,
                "Payment failed — Skedify Pro",
                "<h2>Your Skedify Pro payment failed.</h2>" +
                "<p>Please update your payment method to keep Pro access.</p>" +
                "<p><a href='https://skedify-io.vercel.app/pricing'>Manage subscription →</a></p>"
        );
    }
}
