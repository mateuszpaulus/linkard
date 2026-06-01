package io.skedify.backend.controller;

import io.skedify.backend.auth.CurrentUser;
import io.skedify.backend.auth.CurrentUserPrincipal;
import io.skedify.backend.service.StripeService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class SubscriptionController {

    private final StripeService stripeService;

    public SubscriptionController(StripeService stripeService) {
        this.stripeService = stripeService;
    }

    @PostMapping("/me/create-checkout-session")
    public Map<String, String> createCheckoutSession(@CurrentUser CurrentUserPrincipal user) {
        String url = stripeService.createCheckoutSession(user.clerkId(), user.email());
        return Map.of("url", url);
    }

    @GetMapping("/me/subscription")
    public Map<String, Object> getSubscription(@CurrentUser CurrentUserPrincipal user) {
        return stripeService.getSubscriptionInfo(user.clerkId());
    }
}
