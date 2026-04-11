package io.skedify.backend.controller;

import io.skedify.backend.dto.*;
import io.skedify.backend.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class BookingController {

    private static final String LOCAL_TEST_CLERK_ID = "local_test_user";

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    private String clerkId(Jwt jwt) {
        return jwt != null ? jwt.getSubject() : LOCAL_TEST_CLERK_ID;
    }

    // ── Availability ──

    @GetMapping("/me/availability")
    public List<AvailabilitySlot> getMyAvailability(@AuthenticationPrincipal Jwt jwt) {
        return bookingService.getMyAvailability(clerkId(jwt));
    }

    @PutMapping("/me/availability")
    public List<AvailabilitySlot> saveAvailability(@AuthenticationPrincipal Jwt jwt,
                                                    @RequestBody List<AvailabilitySlot> slots) {
        return bookingService.saveAvailability(clerkId(jwt), slots);
    }

    @GetMapping("/p/{username}/availability")
    public List<AvailabilitySlot> getPublicAvailability(@PathVariable("username") String username) {
        return bookingService.getPublicAvailability(username);
    }

    // ── Bookings ──

    @PostMapping("/p/{username}/book")
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse createBooking(@PathVariable("username") String username,
                                         @Valid @RequestBody BookingRequest request) {
        return bookingService.createBooking(username, request);
    }

    @GetMapping("/p/{username}/booked-slots")
    public List<BookingResponse> getBookedSlots(@PathVariable("username") String username,
                                                 @RequestParam(name = "date") LocalDate date) {
        return bookingService.getBookedSlots(username, date);
    }

    @GetMapping("/me/bookings")
    public List<BookingResponse> getMyBookings(@AuthenticationPrincipal Jwt jwt) {
        return bookingService.getMyBookings(clerkId(jwt));
    }

    @PatchMapping("/me/bookings/{id}/confirm")
    public BookingResponse confirmBooking(@AuthenticationPrincipal Jwt jwt,
                                           @PathVariable("id") UUID id) {
        return bookingService.confirmBooking(clerkId(jwt), id);
    }

    @PatchMapping("/me/bookings/{id}/cancel")
    public BookingResponse cancelBooking(@AuthenticationPrincipal Jwt jwt,
                                          @PathVariable("id") UUID id) {
        return bookingService.cancelBooking(clerkId(jwt), id);
    }
}
