package io.skedify.backend.controller;

import io.skedify.backend.auth.CurrentUser;
import io.skedify.backend.auth.CurrentUserPrincipal;
import io.skedify.backend.dto.*;
import io.skedify.backend.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping("/me/availability")
    public List<AvailabilitySlot> getMyAvailability(@CurrentUser CurrentUserPrincipal user) {
        return bookingService.getMyAvailability(user.clerkId());
    }

    @PutMapping("/me/availability")
    public List<AvailabilitySlot> saveAvailability(@CurrentUser CurrentUserPrincipal user,
                                                    @RequestBody List<AvailabilitySlot> slots) {
        return bookingService.saveAvailability(user.clerkId(), slots);
    }

    @GetMapping("/p/{username}/availability")
    public List<AvailabilitySlot> getPublicAvailability(@PathVariable("username") String username) {
        return bookingService.getPublicAvailability(username);
    }

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
    public List<BookingResponse> getMyBookings(@CurrentUser CurrentUserPrincipal user) {
        return bookingService.getMyBookings(user.clerkId());
    }

    @PatchMapping("/me/bookings/{id}/confirm")
    public BookingResponse confirmBooking(@CurrentUser CurrentUserPrincipal user,
                                           @PathVariable("id") UUID id) {
        return bookingService.confirmBooking(user.clerkId(), id);
    }

    @PatchMapping("/me/bookings/{id}/cancel")
    public BookingResponse cancelBooking(@CurrentUser CurrentUserPrincipal user,
                                          @PathVariable("id") UUID id) {
        return bookingService.cancelBooking(user.clerkId(), id);
    }
}
