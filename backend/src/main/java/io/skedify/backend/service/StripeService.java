package io.skedify.backend.service;

import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import io.skedify.backend.entity.User;
import io.skedify.backend.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Service
@Slf4j
public class StripeService {

    @Value("${stripe.secret-key:}")
    private String stripeSecretKey;

    @Value("${stripe.webhook-secret:}")
    private String webhookSecret;

    @Value("${stripe.price-id:}")
    private String priceId;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    private final UserRepository userRepository;
    private final EmailService emailService;

    public StripeService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @PostConstruct
    void init() {
        if (!stripeSecretKey.isBlank()) {
            Stripe.apiKey = stripeSecretKey;
        }
    }

    public boolean isConfigured() {
        return !stripeSecretKey.isBlank() && !priceId.isBlank();
    }

    @Transactional
    public String createCheckoutSession(String clerkId, String userEmail) {
        if (!isConfigured()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Stripe not configured");
        }

        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        try {
            String customerId = user.getStripeCustomerId();
            if (customerId == null) {
                CustomerCreateParams customerParams = CustomerCreateParams.builder()
                        .setEmail(userEmail)
                        .putMetadata("clerkId", clerkId)
                        .build();
                Customer customer = Customer.create(customerParams);
                customerId = customer.getId();
                user.setStripeCustomerId(customerId);
                userRepository.save(user);
            }

            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                    .setCustomer(customerId)
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setPrice(priceId)
                            .setQuantity(1L)
                            .build())
                    .setSuccessUrl(frontendUrl + "/success?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(frontendUrl + "/pricing")
                    .putMetadata("clerkId", clerkId)
                    .build();

            Session session = Session.create(params);
            return session.getUrl();

        } catch (StripeException e) {
            log.error("Stripe error: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Stripe error: " + e.getMessage());
        }
    }

    @Transactional
    public void handleWebhook(String payload, String sigHeader) {
        if (webhookSecret.isBlank()) {
            log.warn("Stripe webhook secret not configured");
            return;
        }

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Stripe signature");
        }

        log.info("Stripe event: {}", event.getType());

        switch (event.getType()) {
            case "checkout.session.completed" -> {
                var dataObj = event.getDataObjectDeserializer().getObject();
                if (dataObj.isPresent()) {
                    Session session = (Session) dataObj.get();
                    String clerkId = session.getMetadata().get("clerkId");
                    String subscriptionId = session.getSubscription();
                    upgradeUserToPro(clerkId, subscriptionId);
                }
            }
            case "customer.subscription.deleted" -> {
                var dataObj = event.getDataObjectDeserializer().getObject();
                if (dataObj.isPresent()) {
                    com.stripe.model.Subscription sub = (com.stripe.model.Subscription) dataObj.get();
                    downgradeUserToFree(sub.getId());
                }
            }
            case "invoice.payment_failed" -> {
                var dataObj = event.getDataObjectDeserializer().getObject();
                if (dataObj.isPresent()) {
                    com.stripe.model.Invoice invoice = (com.stripe.model.Invoice) dataObj.get();
                    handlePaymentFailed(invoice.getCustomerEmail());
                }
            }
        }
    }

    private void upgradeUserToPro(String clerkId, String subscriptionId) {
        userRepository.findByClerkId(clerkId).ifPresent(user -> {
            user.setSubscriptionStatus(User.SubscriptionStatus.PRO);
            if (subscriptionId != null) user.setStripeSubscriptionId(subscriptionId);
            userRepository.save(user);
            log.info("User {} upgraded to PRO", clerkId);
        });
    }

    private void downgradeUserToFree(String subscriptionId) {
        userRepository.findByStripeSubscriptionId(subscriptionId).ifPresent(user -> {
            user.setSubscriptionStatus(User.SubscriptionStatus.FREE);
            userRepository.save(user);
            log.info("User {} downgraded to FREE", user.getClerkId());
        });
    }

    private void handlePaymentFailed(String customerEmail) {
        if (customerEmail != null) {
            emailService.sendPaymentFailedEmail(customerEmail);
        }
    }

    public Map<String, Object> getSubscriptionInfo(String clerkId) {
        return userRepository.findByClerkId(clerkId)
                .map(u -> {
                    String plan = u.getSubscriptionStatus() != null
                            ? u.getSubscriptionStatus().name() : "FREE";
                    boolean isPro = "PRO".equals(plan);
                    return Map.<String, Object>of(
                            "plan", plan,
                            "status", plan,
                            "isPro", isPro,
                            "renewalDate", (Object) null
                    );
                })
                .orElse(Map.of("plan", "FREE", "status", "FREE", "isPro", false, "renewalDate", (Object) null));
    }

    public boolean isPro(String clerkId) {
        return userRepository.findByClerkId(clerkId)
                .map(u -> u.getSubscriptionStatus() == User.SubscriptionStatus.PRO)
                .orElse(false);
    }
}
