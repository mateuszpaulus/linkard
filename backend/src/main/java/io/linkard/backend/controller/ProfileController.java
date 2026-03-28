package io.linkard.backend.controller;

import io.linkard.backend.dto.*;
import io.linkard.backend.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProfileController {

    private static final String LOCAL_TEST_CLERK_ID = "local_test_user";
    private static final String LOCAL_TEST_EMAIL = "test@local.dev";

    private final ProfileService profileService;

    private String clerkId(Jwt jwt) {
        return jwt != null ? jwt.getSubject() : LOCAL_TEST_CLERK_ID;
    }

    private String email(Jwt jwt) {
        return jwt != null ? jwt.getClaimAsString("email") : LOCAL_TEST_EMAIL;
    }

    @GetMapping("/p/{username}")
    public ProfileResponse getPublicProfile(@PathVariable String username) {
        return profileService.getPublicProfile(username);
    }

    @GetMapping("/me/profile")
    public ProfileResponse getMyProfile(@AuthenticationPrincipal Jwt jwt) {
        return profileService.getMyProfile(clerkId(jwt));
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

    @DeleteMapping("/me/services/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteService(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
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

    @DeleteMapping("/me/links/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLink(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        profileService.deleteLink(clerkId(jwt), id);
    }
}
