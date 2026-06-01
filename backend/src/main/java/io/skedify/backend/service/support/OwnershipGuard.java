package io.skedify.backend.service.support;

import io.skedify.backend.entity.Profile;
import io.skedify.backend.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class OwnershipGuard {

    private OwnershipGuard() {
    }

    public static void requireOwner(Profile profile, String clerkId) {
        if (!profile.getUser().getClerkId().equals(clerkId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }

    public static boolean isPro(Profile profile) {
        return profile.getUser().getSubscriptionStatus() == User.SubscriptionStatus.PRO;
    }

    public static void requireUnderFreeLimit(Profile profile, long activeCount, int limit, String message) {
        if (!isPro(profile) && activeCount >= limit) {
            throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED, message);
        }
    }
}
