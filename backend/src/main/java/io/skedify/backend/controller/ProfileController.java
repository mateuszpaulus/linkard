package io.skedify.backend.controller;

import io.skedify.backend.dto.*;
import io.skedify.backend.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class ProfileController {

    private static final String LOCAL_TEST_CLERK_ID = "local_test_user";
    private static final String LOCAL_TEST_EMAIL = "test@local.dev";

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    private String clerkId(Jwt jwt) {
        return jwt != null ? jwt.getSubject() : LOCAL_TEST_CLERK_ID;
    }

    private String email(Jwt jwt) {
        return jwt != null ? jwt.getClaimAsString("email") : LOCAL_TEST_EMAIL;
    }

    // ── Public ──

    @GetMapping("/p/{username}")
    public ProfileResponse getPublicProfile(@PathVariable("username") String username) {
        return profileService.getPublicProfile(username);
    }

    @PostMapping("/p/{username}/contact")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void contact(@PathVariable("username") String username,
                        @Valid @RequestBody ContactRequest request) {
        profileService.sendContact(username, request);
    }

    @GetMapping("/profiles")
    public Page<ProfileSummaryResponse> listProfiles(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "12") int size,
            @RequestParam(name = "search", required = false) String search) {
        return profileService.getPublicProfiles(page, size, search);
    }

    // ── Authenticated ──

    @GetMapping("/me/profile")
    public ProfileResponse getMyProfile(@AuthenticationPrincipal Jwt jwt) {
        return profileService.getMyProfile(clerkId(jwt), email(jwt));
    }

    @PostMapping("/me/profile")
    @ResponseStatus(HttpStatus.CREATED)
    public ProfileResponse createProfile(@AuthenticationPrincipal Jwt jwt,
                                         @Valid @RequestBody ProfileRequest request) {
        return profileService.createOrUpdateProfile(clerkId(jwt), email(jwt), request);
    }

    @PatchMapping("/me/profile")
    public ProfileResponse updateProfile(@AuthenticationPrincipal Jwt jwt,
                                         @RequestBody ProfileRequest request) {
        return profileService.createOrUpdateProfile(clerkId(jwt), email(jwt), request);
    }

    @GetMapping("/me/stats")
    public StatsResponse getMyStats(@AuthenticationPrincipal Jwt jwt) {
        return profileService.getMyStats(clerkId(jwt));
    }

    @GetMapping("/me/services")
    public List<ServiceResponse> getMyServices(@AuthenticationPrincipal Jwt jwt) {
        return profileService.getMyServices(clerkId(jwt));
    }

    @PostMapping("/me/services")
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceResponse addService(@AuthenticationPrincipal Jwt jwt,
                                      @Valid @RequestBody ServiceRequest request) {
        return profileService.addService(clerkId(jwt), request);
    }

    @PatchMapping("/me/services/{id}")
    public ServiceResponse updateService(@AuthenticationPrincipal Jwt jwt,
                                         @PathVariable("id") UUID id,
                                         @RequestBody ServiceRequest request) {
        return profileService.updateService(clerkId(jwt), id, request);
    }

    @DeleteMapping("/me/services/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteService(@AuthenticationPrincipal Jwt jwt, @PathVariable("id") UUID id) {
        profileService.deleteService(clerkId(jwt), id);
    }

    @GetMapping("/me/links")
    public List<LinkResponse> getMyLinks(@AuthenticationPrincipal Jwt jwt) {
        return profileService.getMyLinks(clerkId(jwt));
    }

    @PostMapping("/me/links")
    @ResponseStatus(HttpStatus.CREATED)
    public LinkResponse addLink(@AuthenticationPrincipal Jwt jwt,
                                @Valid @RequestBody LinkRequest request) {
        return profileService.addLink(clerkId(jwt), request);
    }

    @PatchMapping("/me/links/{id}")
    public LinkResponse updateLink(@AuthenticationPrincipal Jwt jwt,
                                   @PathVariable("id") UUID id,
                                   @RequestBody LinkRequest request) {
        return profileService.updateLink(clerkId(jwt), id, request);
    }

    @DeleteMapping("/me/links/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLink(@AuthenticationPrincipal Jwt jwt, @PathVariable("id") UUID id) {
        profileService.deleteLink(clerkId(jwt), id);
    }
}
