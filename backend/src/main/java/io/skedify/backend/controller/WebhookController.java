package io.skedify.backend.controller;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import io.skedify.backend.entity.User;
import io.skedify.backend.repository.UserRepository;
import io.skedify.backend.service.StripeService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/webhooks")
@Slf4j
public class WebhookController {

    @Value("${clerk.webhook-secret:}")
    private String clerkWebhookSecret;

    private final UserRepository userRepository;
    private final StripeService stripeService;
    private final ObjectMapper objectMapper;

    public WebhookController(UserRepository userRepository, StripeService stripeService,
                             ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.stripeService = stripeService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/clerk")
    @ResponseStatus(HttpStatus.OK)
    public void handleClerkWebhook(HttpServletRequest request) throws IOException {
        String rawBody = request.getReader().lines().collect(Collectors.joining());

        verifyClerkSignature(request, rawBody);

        JsonNode payload = objectMapper.readTree(rawBody);
        String type = payload.path("type").stringValue();

        if (!"user.created".equals(type)) {
            log.debug("Ignoring Clerk webhook event: {}", type);
            return;
        }

        JsonNode data = payload.path("data");
        String clerkId = data.path("id").stringValue();
        String email = data.path("email_addresses")
                .path(0)
                .path("email_address").stringValue();

        if (clerkId == null || clerkId.isEmpty() || email == null || email.isEmpty()) {
            log.warn("Clerk webhook missing clerkId or email");
            return;
        }

        if (userRepository.existsByClerkId(clerkId)) {
            log.debug("User already exists for clerkId: {}", clerkId);
            return;
        }

        User user = new User();
        user.setClerkId(clerkId);
        user.setEmail(email);
        userRepository.save(user);

        log.info("Created user from Clerk webhook: clerkId={}", clerkId);
    }

    @PostMapping("/stripe")
    @ResponseStatus(HttpStatus.OK)
    public void handleStripeWebhook(HttpServletRequest request) throws IOException {
        String rawBody = request.getReader().lines().collect(Collectors.joining());
        String sigHeader = request.getHeader("Stripe-Signature");
        stripeService.handleWebhook(rawBody, sigHeader);
    }

    private void verifyClerkSignature(HttpServletRequest request, String rawBody) {
        if (clerkWebhookSecret.isBlank()) {
            log.warn("CLERK_WEBHOOK_SECRET not set — webhook signature verification skipped");
            return;
        }

        String msgId        = request.getHeader("svix-id");
        String msgTimestamp = request.getHeader("svix-timestamp");
        String msgSignature = request.getHeader("svix-signature");

        if (msgId == null || msgTimestamp == null || msgSignature == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing Svix signature headers");
        }

        try {
            long timestamp = Long.parseLong(msgTimestamp);
            long now = System.currentTimeMillis() / 1000;
            if (Math.abs(now - timestamp) > 300) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Webhook timestamp too old");
            }
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid svix-timestamp");
        }

        String toSign = msgId + "." + msgTimestamp + "." + rawBody;

        String secretPayload = clerkWebhookSecret.startsWith("whsec_")
                ? clerkWebhookSecret.substring("whsec_".length())
                : clerkWebhookSecret;
        byte[] secretBytes = Base64.getDecoder().decode(secretPayload);

        byte[] computed;
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secretBytes, "HmacSHA256"));
            computed = mac.doFinal(toSign.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Signature computation failed");
        }

        String computedBase64 = Base64.getEncoder().encodeToString(computed);

        boolean valid = false;
        for (String sig : msgSignature.split(" ")) {
            if (sig.startsWith("v1,") && sig.substring(3).equals(computedBase64)) {
                valid = true;
                break;
            }
        }

        if (!valid) {
            log.warn("Invalid Clerk webhook signature");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid webhook signature");
        }
    }
}
