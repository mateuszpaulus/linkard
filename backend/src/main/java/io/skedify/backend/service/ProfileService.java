package io.skedify.backend.service;

import io.skedify.backend.dto.PageResponse;
import io.skedify.backend.dto.ProfileRequest;
import io.skedify.backend.dto.ProfileResponse;
import io.skedify.backend.dto.ProfileSummaryResponse;
import io.skedify.backend.dto.StatsResponse;
import io.skedify.backend.entity.Booking;
import io.skedify.backend.entity.Link;
import io.skedify.backend.entity.Offering;
import io.skedify.backend.entity.Profile;
import io.skedify.backend.entity.User;
import io.skedify.backend.repository.BookingRepository;
import io.skedify.backend.repository.ProfileRepository;
import io.skedify.backend.repository.UserRepository;
import io.skedify.backend.service.mapper.ProfileMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProfileService {

    private static final int MAX_PAGE_SIZE = 24;

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final ProfileMapper mapper;
    private final EmailService emailService;
    private final ProfileEventService profileEventService;
    private final io.skedify.backend.repository.ProfileEventRepository profileEventRepository;

    @Value("${app.base-url:https://skedify-io.vercel.app}")
    private String baseUrl;

    public ProfileService(ProfileRepository profileRepository,
                          UserRepository userRepository,
                          BookingRepository bookingRepository,
                          ProfileMapper mapper,
                          EmailService emailService,
                          ProfileEventService profileEventService,
                          io.skedify.backend.repository.ProfileEventRepository profileEventRepository) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.mapper = mapper;
        this.emailService = emailService;
        this.profileEventService = profileEventService;
        this.profileEventRepository = profileEventRepository;
    }

    @Transactional
    public ProfileResponse getPublicProfile(String username) {
        Profile profile = profileRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
        profile.setViewCount((profile.getViewCount() == null ? 0L : profile.getViewCount()) + 1);
        profileEventService.record(profile, io.skedify.backend.entity.ProfileEvent.Type.VIEW);
        return mapper.toResponse(profile, false);
    }

    @Transactional(readOnly = true)
    public ProfileResponse getMyProfile(String clerkId) {
        return profileRepository.findByUserClerkId(clerkId)
                .map(p -> mapper.toResponse(p, true))
                .orElse(emptyProfileResponse());
    }

    @Transactional(readOnly = true)
    public StatsResponse getMyStats(String clerkId) {
        long pendingBookings = bookingRepository.countByProfile_User_ClerkIdAndStatus(
                clerkId, Booking.Status.PENDING);

        return profileRepository.findByUserClerkId(clerkId).map(profile -> {
            long services = profile.getOfferings().stream()
                    .filter(Offering::isActive).count();
            long links = profile.getLinks().stream().filter(Link::isActive).count();
            long contactCount = profileEventRepository.countByProfileIdAndEventType(
                    profile.getId(), io.skedify.backend.entity.ProfileEvent.Type.CONTACT);
            long bookingCount = profileEventRepository.countByProfileIdAndEventType(
                    profile.getId(), io.skedify.backend.entity.ProfileEvent.Type.BOOK);
            String profileUrl = baseUrl + "/" + profile.getUsername();
            return new StatsResponse(
                    profile.getViewCount() == null ? 0L : profile.getViewCount(),
                    (int) services,
                    (int) links,
                    profileUrl,
                    pendingBookings,
                    contactCount,
                    bookingCount
            );
        }).orElse(new StatsResponse(0L, 0, 0, null, 0L, 0L, 0L));
    }

    @Transactional(readOnly = true)
    public PageResponse<ProfileSummaryResponse> getPublicProfiles(int page, int size, String search) {
        int safeSize = Math.min(size, MAX_PAGE_SIZE);
        String q = (search != null && !search.isBlank()) ? search.trim() : null;
        return PageResponse.from(profileRepository.searchProfiles(q, PageRequest.of(page, safeSize))
                .map(mapper::toSummaryResponse));
    }

    @Transactional
    public ProfileResponse createOrUpdateProfile(String clerkId, String email, ProfileRequest request) {
        User user = ensureUserExists(clerkId, email);

        Profile profile = profileRepository.findByUserClerkId(clerkId).orElseGet(() -> {
            Profile newProfile = new Profile();
            newProfile.setUser(user);
            return newProfile;
        });

        if (request.username() != null) {
            if (!request.username().equals(profile.getUsername())
                    && profileRepository.existsByUsername(request.username())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already taken");
            }
            profile.setUsername(request.username());
        }
        if (request.displayName() != null) profile.setDisplayName(request.displayName());
        if (request.bio() != null) profile.setBio(request.bio());
        if (request.avatarUrl() != null) profile.setAvatarUrl(request.avatarUrl());
        if (request.location() != null) profile.setLocation(request.location());
        if (request.websiteUrl() != null) profile.setWebsiteUrl(request.websiteUrl());
        if (request.themeColor() != null) {
            profile.setThemeColor(request.themeColor().isBlank() ? null : request.themeColor());
        }

        return mapper.toResponse(profileRepository.save(profile), true);
    }

    private User ensureUserExists(String clerkId, String email) {
        return userRepository.findByClerkId(clerkId).orElseGet(() -> {
            User newUser = new User();
            newUser.setClerkId(clerkId);
            newUser.setEmail(email != null ? email : clerkId + "@placeholder.local");
            return userRepository.save(newUser);
        });
    }

    private ProfileResponse emptyProfileResponse() {
        return new ProfileResponse(null, null, null, null, null, null, null, null, List.of(), List.of(), "FREE");
    }

    public void sendTestEmail(String clerkId) {
        if (!emailService.isConfigured()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Email service not configured");
        }
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No email on account");
        }
        String name = profileRepository.findByUserClerkId(clerkId)
                .map(p -> p.getDisplayName() != null ? p.getDisplayName() : p.getUsername())
                .orElse("there");
        emailService.sendEmail(
                user.getEmail(),
                "Skedify test email ✓",
                "<h2>Hello, " + name + "!</h2>" +
                "<p>This is a test email from Skedify to verify that delivery is working.</p>" +
                "<p>If you received this, your Resend configuration is correct.</p>" +
                "<p style='color:#9CA3AF;font-size:12px;margin-top:24px'>Sent at " + java.time.Instant.now() + "</p>"
        );
    }
}
