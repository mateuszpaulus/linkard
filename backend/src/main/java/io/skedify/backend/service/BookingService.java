package io.skedify.backend.service;

import io.skedify.backend.dto.*;
import io.skedify.backend.entity.*;
import io.skedify.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class BookingService {

    private final ProfileRepository profileRepository;
    private final AvailabilityRepository availabilityRepository;
    private final BookingRepository bookingRepository;
    private final EmailService emailService;

    public BookingService(ProfileRepository profileRepository, AvailabilityRepository availabilityRepository,
                          BookingRepository bookingRepository, EmailService emailService) {
        this.profileRepository = profileRepository;
        this.availabilityRepository = availabilityRepository;
        this.bookingRepository = bookingRepository;
        this.emailService = emailService;
    }

    private void requirePro(String clerkId) {
        profileRepository.findByUserClerkId(clerkId).ifPresent(profile -> {
            if (profile.getUser().getSubscriptionStatus() != User.SubscriptionStatus.PRO) {
                throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED,
                        "Booking feature requires Pro plan.");
            }
        });
    }

    public List<AvailabilitySlot> getMyAvailability(String clerkId) {
        requirePro(clerkId);
        return profileRepository.findByUserClerkId(clerkId)
                .map(p -> availabilityRepository.findByProfileIdOrderByDayOfWeekAsc(p.getId())
                        .stream().map(this::toSlot).toList())
                .orElse(List.of());
    }

    public List<AvailabilitySlot> getPublicAvailability(String username) {
        Profile profile = profileRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
        return availabilityRepository.findByProfileIdOrderByDayOfWeekAsc(profile.getId())
                .stream().filter(Availability::isActive).map(this::toSlot).toList();
    }

    @Transactional
    public List<AvailabilitySlot> saveAvailability(String clerkId, List<AvailabilitySlot> slots) {
        requirePro(clerkId);
        Profile profile = profileRepository.findByUserClerkId(clerkId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        availabilityRepository.deleteByProfileId(profile.getId());
        availabilityRepository.flush();

        List<Availability> entities = slots.stream().map(slot -> {
            Availability a = new Availability();
            a.setProfile(profile);
            a.setDayOfWeek(slot.dayOfWeek());
            a.setStartTime(slot.startTime());
            a.setEndTime(slot.endTime());
            a.setActive(slot.isActive());
            return a;
        }).toList();

        return availabilityRepository.saveAll(entities).stream().map(this::toSlot).toList();
    }

    @Transactional
    public BookingResponse createBooking(String username, BookingRequest request) {
        Profile profile = profileRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        validateSlotAvailable(profile, request);

        Booking booking = new Booking();
        booking.setProfile(profile);
        booking.setClientName(request.clientName());
        booking.setClientEmail(request.clientEmail());
        booking.setClientMessage(request.clientMessage());
        booking.setDate(request.date());
        booking.setStartTime(request.startTime());
        booking.setEndTime(request.endTime());
        booking.setStatus(Booking.Status.PENDING);

        Booking saved = bookingRepository.save(booking);

        emailService.sendNewBookingNotification(profile, saved);

        return toBookingResponse(saved);
    }

    public List<BookingResponse> getMyBookings(String clerkId) {
        return profileRepository.findByUserClerkId(clerkId)
                .map(p -> bookingRepository.findByProfileIdOrderByDateAscStartTimeAsc(p.getId())
                        .stream().map(this::toBookingResponse).toList())
                .orElse(List.of());
    }

    public List<BookingResponse> getBookedSlots(String username, java.time.LocalDate date) {
        Profile profile = profileRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
        return bookingRepository.findByProfileIdAndDateAndStatusNot(profile.getId(), date, Booking.Status.CANCELLED)
                .stream().map(this::toBookingResponse).toList();
    }

    @Transactional
    public BookingResponse confirmBooking(String clerkId, UUID bookingId) {
        Booking booking = getOwnedBooking(clerkId, bookingId);
        booking.setStatus(Booking.Status.CONFIRMED);
        Booking saved = bookingRepository.save(booking);

        emailService.sendBookingConfirmation(booking.getProfile(), saved);

        return toBookingResponse(saved);
    }

    @Transactional
    public BookingResponse cancelBooking(String clerkId, UUID bookingId) {
        Booking booking = getOwnedBooking(clerkId, bookingId);
        booking.setStatus(Booking.Status.CANCELLED);
        return toBookingResponse(bookingRepository.save(booking));
    }

    private void validateSlotAvailable(Profile profile, BookingRequest request) {
        int dayOfWeek = request.date().getDayOfWeek().getValue() - 1;

        Availability availability = availabilityRepository
                .findByProfileIdOrderByDayOfWeekAsc(profile.getId())
                .stream()
                .filter(a -> a.isActive() && a.getDayOfWeek() == dayOfWeek)
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatusCode.valueOf(422), "No availability on this day"));

        if (request.startTime().isBefore(availability.getStartTime()) ||
                request.endTime().isAfter(availability.getEndTime()) ||
                !request.startTime().isBefore(request.endTime())) {
            throw new ResponseStatusException(
                    HttpStatusCode.valueOf(422), "Requested time is outside available hours");
        }

        boolean conflict = bookingRepository
                .findByProfileIdAndDateAndStatusNot(profile.getId(), request.date(), Booking.Status.CANCELLED)
                .stream()
                .anyMatch(b -> request.startTime().isBefore(b.getEndTime()) &&
                        request.endTime().isAfter(b.getStartTime()));

        if (conflict) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This time slot is already booked");
        }
    }

    private Booking getOwnedBooking(String clerkId, UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        if (!booking.getProfile().getUser().getClerkId().equals(clerkId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        return booking;
    }

    private AvailabilitySlot toSlot(Availability a) {
        return new AvailabilitySlot(a.getDayOfWeek(), a.getStartTime(), a.getEndTime(), a.isActive());
    }

    private BookingResponse toBookingResponse(Booking b) {
        return new BookingResponse(
                b.getId(),
                b.getClientName(),
                b.getClientEmail(),
                b.getClientMessage(),
                b.getDate(),
                b.getStartTime(),
                b.getEndTime(),
                b.getStatus().name(),
                b.getCreatedAt()
        );
    }
}
