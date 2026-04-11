package io.skedify.backend.controller;

import tools.jackson.databind.JsonNode;
import io.skedify.backend.entity.User;
import io.skedify.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks")
public class WebhookController {

    private static final Logger log = LoggerFactory.getLogger(WebhookController.class);

    private final UserRepository userRepository;

    public WebhookController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/clerk")
    @ResponseStatus(HttpStatus.OK)
    public void handleClerkWebhook(@RequestBody JsonNode payload) {
        String type = payload.path("type").asText();

        if (!"user.created".equals(type)) {
            log.debug("Ignoring Clerk webhook event: {}", type);
            return;
        }

        JsonNode data = payload.path("data");
        String clerkId = data.path("id").asText();
        String email = data.path("email_addresses")
                .path(0)
                .path("email_address")
                .asText();

        if (clerkId.isEmpty() || email.isEmpty()) {
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
}
