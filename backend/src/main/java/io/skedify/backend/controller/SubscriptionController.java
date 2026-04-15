package io.skedify.backend.controller;

import io.skedify.backend.service.StripeService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class SubscriptionController {

    private static final String LOCAL_TEST_CLERK_ID = "local_test_user";

    private final StripeService stripeService;

    public SubscriptionController(StripeService stripeService) {
        this.stripeService = stripeService;
    }

    private String clerkId(Jwt jwt) {
        return jwt != null ? jwt.getSubject() : LOCAL_TEST_CLERK_ID;
    }

    private String email(Jwt jwt) {
        return jwt != null ? jwt.getClaimAsString("email") : "test@local.dev";
    }

    @PostMapping("/me/create-checkout-session")
    public Map<String, String> createCheckoutSession(@AuthenticationPrincipal Jwt jwt) {
        String url = stripeService.createCheckoutSession(clerkId(jwt), email(jwt));
        return Map.of("url", url);
    }

    @GetMapping("/me/subscription")
    public Map<String, Object> getSubscription(@AuthenticationPrincipal Jwt jwt) {
        return stripeService.getSubscriptionInfo(clerkId(jwt));
    }
}
