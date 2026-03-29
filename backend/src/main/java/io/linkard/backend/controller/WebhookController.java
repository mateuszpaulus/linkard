package io.linkard.backend.controller;

import tools.jackson.databind.JsonNode;
import io.linkard.backend.entity.User;
import io.linkard.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
@Slf4j
public class WebhookController {

    private final UserRepository userRepository;

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
