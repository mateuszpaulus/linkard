package io.skedify.backend.service;

import io.skedify.backend.entity.Booking;
import io.skedify.backend.entity.Profile;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class EmailService {

    @Value("${resend.api-key:}")
    private String resendApiKey;

    @Value("${resend.from-email:noreply@skedify.io}")
    private String fromEmail;

    private final RestTemplate restTemplate;

    public EmailService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public boolean isConfigured() {
        return resendApiKey != null && !resendApiKey.isBlank();
    }

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

    public void sendContactEmail(String ownerEmail, String ownerDisplayName,
                                  String clientName, String clientEmail, String message) {
        sendEmail(
                ownerEmail,
                "New message from " + clientName,
                "<h2>Someone wrote through your Skedify profile!</h2>" +
                "<p><b>To:</b> " + escape(ownerDisplayName) + "</p>" +
                "<p><b>From:</b> " + escape(clientName) + " (<a href='mailto:" + escapeAttr(clientEmail) + "'>" + escape(clientEmail) + "</a>)</p>" +
                "<p><b>Message:</b></p>" +
                "<blockquote style='border-left:4px solid #3B82F6;padding-left:12px;color:#374151'>" + escape(message) + "</blockquote>" +
                "<p><a href='https://skedify-io.vercel.app/dashboard'>Go to Dashboard →</a></p>"
        );
    }

    public void sendNewBookingNotification(Profile profile, Booking booking) {
        String ownerEmail = profile.getUser().getEmail();
        if (ownerEmail == null || ownerEmail.isBlank()) return;

        String clientMessage = booking.getClientMessage();
        String messageBlock = (clientMessage != null && !clientMessage.isBlank())
                ? "<p><b>Message:</b> " + escape(clientMessage) + "</p>"
                : "";

        sendEmail(
                ownerEmail,
                "New booking from " + booking.getClientName(),
                "<h2>You have a new booking!</h2>" +
                "<p><b>Client:</b> " + escape(booking.getClientName()) +
                " (<a href='mailto:" + escapeAttr(booking.getClientEmail()) + "'>" + escape(booking.getClientEmail()) + "</a>)</p>" +
                "<p><b>Date:</b> " + booking.getDate() + " · " + booking.getStartTime() + " – " + booking.getEndTime() + "</p>" +
                messageBlock +
                "<p><a href='https://skedify-io.vercel.app/dashboard'>Manage booking →</a></p>"
        );
    }

    public void sendBookingConfirmation(Profile profile, Booking booking) {
        String ownerName = profile.getDisplayName() != null ? profile.getDisplayName() : profile.getUsername();
        sendEmail(
                booking.getClientEmail(),
                "Meeting confirmed! ✓",
                "<h2>Your meeting has been confirmed!</h2>" +
                "<p><b>With:</b> " + escape(ownerName) + "</p>" +
                "<p><b>Date:</b> " + booking.getDate() + " · " + booking.getStartTime() + " – " + booking.getEndTime() + "</p>" +
                "<p>See you then!</p>"
        );
    }

    public void sendPaymentFailedEmail(String customerEmail) {
        sendEmail(
                customerEmail,
                "Payment failed — Skedify Pro",
                "<h2>Your Skedify Pro payment failed.</h2>" +
                "<p>Please update your payment method to keep Pro access.</p>" +
                "<p><a href='https://skedify-io.vercel.app/pricing'>Manage subscription →</a></p>"
        );
    }

    private static String escape(String input) {
        if (input == null) return "";
        StringBuilder sb = new StringBuilder(input.length());
        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            switch (c) {
                case '&' -> sb.append("&amp;");
                case '<' -> sb.append("&lt;");
                case '>' -> sb.append("&gt;");
                case '"' -> sb.append("&quot;");
                case '\'' -> sb.append("&#39;");
                default -> sb.append(c);
            }
        }
        return sb.toString();
    }

    private static String escapeAttr(String input) {
        return escape(input);
    }
}
