package io.skedify.backend.service.mapper;

import io.skedify.backend.dto.LinkResponse;
import io.skedify.backend.dto.ProfileResponse;
import io.skedify.backend.dto.ProfileSummaryResponse;
import io.skedify.backend.dto.ServiceResponse;
import io.skedify.backend.entity.Link;
import io.skedify.backend.entity.Offering;
import io.skedify.backend.entity.Profile;
import io.skedify.backend.entity.User;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ProfileMapper {

    public ProfileResponse toResponse(Profile profile, boolean includePlan) {
        List<ServiceResponse> services = profile.getOfferings().stream()
                .filter(Offering::isActive)
                .map(this::toServiceResponse)
                .toList();
        List<LinkResponse> links = profile.getLinks().stream()
                .filter(Link::isActive)
                .map(this::toLinkResponse)
                .toList();
        String resolvedPlan = resolvePlan(profile);
        boolean isPro = "PRO".equals(resolvedPlan);
        String themeColor = isPro ? profile.getThemeColor() : null;
        return new ProfileResponse(
                profile.getId(),
                profile.getUsername(),
                profile.getDisplayName(),
                profile.getBio(),
                profile.getAvatarUrl(),
                profile.getLocation(),
                profile.getWebsiteUrl(),
                themeColor,
                services,
                links,
                includePlan ? resolvedPlan : null
        );
    }

    public ProfileSummaryResponse toSummaryResponse(Profile profile) {
        int servicesCount = (int) profile.getOfferings().stream()
                .filter(Offering::isActive).count();
        return new ProfileSummaryResponse(
                profile.getId(),
                profile.getUsername(),
                profile.getDisplayName(),
                profile.getBio(),
                profile.getAvatarUrl(),
                servicesCount
        );
    }

    public ServiceResponse toServiceResponse(Offering offering) {
        return new ServiceResponse(offering.getId(), offering.getTitle(), offering.getDescription(),
                offering.getPrice(), offering.getCurrency(), offering.getPriceLabel(), offering.getDisplayOrder());
    }

    public LinkResponse toLinkResponse(Link l) {
        return new LinkResponse(l.getId(), l.getLabel(), l.getUrl(), l.getIconName(), l.getDisplayOrder());
    }

    private String resolvePlan(Profile profile) {
        User user = profile.getUser();
        if (user == null || user.getSubscriptionStatus() == null) return "FREE";
        return user.getSubscriptionStatus().name();
    }
}
