package io.skedify.backend.controller;

import io.skedify.backend.auth.CurrentUser;
import io.skedify.backend.auth.CurrentUserPrincipal;
import io.skedify.backend.dto.*;
import io.skedify.backend.service.ContactService;
import io.skedify.backend.service.LinkService;
import io.skedify.backend.service.ProfileService;
import io.skedify.backend.service.OfferingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class ProfileController {

    private final ProfileService profileService;
    private final OfferingService offeringService;
    private final LinkService linkService;
    private final ContactService contactService;

    public ProfileController(ProfileService profileService,
                             OfferingService offeringService,
                             LinkService linkService,
                             ContactService contactService) {
        this.profileService = profileService;
        this.offeringService = offeringService;
        this.linkService = linkService;
        this.contactService = contactService;
    }

    @GetMapping("/p/{username}")
    public ProfileResponse getPublicProfile(@PathVariable("username") String username) {
        return profileService.getPublicProfile(username);
    }

    @PostMapping("/p/{username}/contact")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void contact(@PathVariable("username") String username,
                        @Valid @RequestBody ContactRequest request) {
        contactService.sendContact(username, request);
    }

    @GetMapping("/profiles")
    public PageResponse<ProfileSummaryResponse> listProfiles(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "12") int size,
            @RequestParam(name = "search", required = false) String search) {
        return profileService.getPublicProfiles(page, size, search);
    }

    @GetMapping("/me/profile")
    public ProfileResponse getMyProfile(@CurrentUser CurrentUserPrincipal user) {
        return profileService.getMyProfile(user.clerkId());
    }

    @PostMapping("/me/profile")
    @ResponseStatus(HttpStatus.CREATED)
    public ProfileResponse createProfile(@CurrentUser CurrentUserPrincipal user,
                                         @Valid @RequestBody ProfileRequest request) {
        return profileService.createOrUpdateProfile(user.clerkId(), user.email(), request);
    }

    @PatchMapping("/me/profile")
    public ProfileResponse updateProfile(@CurrentUser CurrentUserPrincipal user,
                                         @Valid @RequestBody ProfileRequest request) {
        return profileService.createOrUpdateProfile(user.clerkId(), user.email(), request);
    }

    @GetMapping("/me/stats")
    public StatsResponse getMyStats(@CurrentUser CurrentUserPrincipal user) {
        return profileService.getMyStats(user.clerkId());
    }

    @GetMapping("/me/services")
    public List<ServiceResponse> getMyServices(@CurrentUser CurrentUserPrincipal user) {
        return offeringService.getMyOfferings(user.clerkId());
    }

    @PostMapping("/me/services")
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceResponse addService(@CurrentUser CurrentUserPrincipal user,
                                      @Valid @RequestBody ServiceRequest request) {
        return offeringService.addOffering(user.clerkId(), request);
    }

    @PatchMapping("/me/services/{id}")
    public ServiceResponse updateService(@CurrentUser CurrentUserPrincipal user,
                                         @PathVariable("id") UUID id,
                                         @RequestBody ServiceRequest request) {
        return offeringService.updateOffering(user.clerkId(), id, request);
    }

    @DeleteMapping("/me/services/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteService(@CurrentUser CurrentUserPrincipal user, @PathVariable("id") UUID id) {
        offeringService.deleteOffering(user.clerkId(), id);
    }

    @PostMapping("/me/services/reorder")
    public List<ServiceResponse> reorderServices(@CurrentUser CurrentUserPrincipal user,
                                                  @Valid @RequestBody ReorderRequest request) {
        return offeringService.reorderOfferings(user.clerkId(), request.ids());
    }

    @GetMapping("/me/links")
    public List<LinkResponse> getMyLinks(@CurrentUser CurrentUserPrincipal user) {
        return linkService.getMyLinks(user.clerkId());
    }

    @PostMapping("/me/links")
    @ResponseStatus(HttpStatus.CREATED)
    public LinkResponse addLink(@CurrentUser CurrentUserPrincipal user,
                                @Valid @RequestBody LinkRequest request) {
        return linkService.addLink(user.clerkId(), request);
    }

    @PatchMapping("/me/links/{id}")
    public LinkResponse updateLink(@CurrentUser CurrentUserPrincipal user,
                                   @PathVariable("id") UUID id,
                                   @RequestBody LinkRequest request) {
        return linkService.updateLink(user.clerkId(), id, request);
    }

    @DeleteMapping("/me/links/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLink(@CurrentUser CurrentUserPrincipal user, @PathVariable("id") UUID id) {
        linkService.deleteLink(user.clerkId(), id);
    }

    @PostMapping("/me/links/reorder")
    public List<LinkResponse> reorderLinks(@CurrentUser CurrentUserPrincipal user,
                                           @Valid @RequestBody ReorderRequest request) {
        return linkService.reorderLinks(user.clerkId(), request.ids());
    }

    @PostMapping("/me/email/test")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void sendTestEmail(@CurrentUser CurrentUserPrincipal user) {
        profileService.sendTestEmail(user.clerkId());
    }
}
