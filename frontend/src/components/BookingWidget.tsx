"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  getPublicAvailability,
  getBookedSlots,
  createBooking,
  type AvailabilitySlot,
  type BookingResponse,
} from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { formatFullDate, javaDowToJsDay, jsDayToJavaDow, toDateStr } from "@/lib/date";
import { generateTimeSlots, type TimeSlot } from "@/lib/booking";
import { BookingCalendar } from "./booking/BookingCalendar";
import { BookingTimeSlots } from "./booking/BookingTimeSlots";
import { BookingForm, type BookingFormState } from "./booking/BookingForm";
import { BookingSuccess } from "./booking/BookingSuccess";

interface Props {
  username: string;
  displayName: string | null;
}

type Step = 1 | 2 | 3;

const EMPTY_FORM: BookingFormState = { name: "", email: "", message: "" };
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseStep(value: string | null): Step {
  const n = value ? parseInt(value, 10) : 1;
  return n === 2 || n === 3 ? n : 1;
}

function parseDate(value: string | null): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

export default function BookingWidget({ username, displayName }: Props) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const dateParam = searchParams.get("date");
  const slotParam = searchParams.get("slot");
  const stepFromUrl = parseStep(searchParams.get("step"));

  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookedSlots, setBookedSlots] = useState<BookingResponse[]>([]);

  const selectedDate = parseDate(dateParam);

  const [view, setView] = useState(() => {
    const d = selectedDate ?? new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const [form, setForm] = useState<BookingFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    getPublicAvailability(username)
      .then(setAvailability)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [username]);

  useEffect(() => {
    if (!dateParam) {
      setBookedSlots([]);
      return;
    }
    getBookedSlots(username, dateParam)
      .then(setBookedSlots)
      .catch(() => setBookedSlots([]));
  }, [dateParam, username]);

  if (loading) return null;

  const activeAvailability = availability.filter((a) => a.isActive);
  if (activeAvailability.length === 0) return null;

  const activeDays = new Set(activeAvailability.map((a) => javaDowToJsDay(a.dayOfWeek)));

  function isDayAvailable(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;
    return activeDays.has(date.getDay());
  }

  function updateUrl(updates: Record<string, string | null>, mode: "push" | "replace" = "push") {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v == null) next.delete(k);
      else next.set(k, v);
    });
    const qs = next.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    if (mode === "replace") router.replace(url, { scroll: false });
    else router.push(url, { scroll: false });
  }

  function pickDate(date: Date) {
    updateUrl({ step: "2", date: toDateStr(date), slot: null });
  }

  function pickSlot(slot: TimeSlot) {
    updateUrl({ step: "3", slot: slot.start });
  }

  function backToStep1() {
    updateUrl({ step: null, date: null, slot: null });
  }

  function backToStep2() {
    updateUrl({ step: "2", slot: null });
  }

  function goPrevMonth() {
    setView((v) =>
      v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 }
    );
  }

  function goNextMonth() {
    setView((v) =>
      v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 }
    );
  }

  function reset() {
    setBooked(false);
    setForm(EMPTY_FORM);
    setFormError("");
    updateUrl({ step: null, date: null, slot: null }, "replace");
  }

  const daySlot = selectedDate
    ? activeAvailability.find((a) => a.dayOfWeek === jsDayToJavaDow(selectedDate.getDay()))
    : null;
  const timeSlots = daySlot ? generateTimeSlots(daySlot.startTime, daySlot.endTime) : [];
  const selectedSlot = slotParam ? timeSlots.find((ts) => ts.start === slotParam) ?? null : null;
  const bookedTimes = new Set(
    bookedSlots.filter((b) => b.status !== "CANCELLED").map((b) => b.startTime.slice(0, 5))
  );

  async function handleSubmit() {
    if (!form.name.trim() || !form.email.trim()) return;
    if (!EMAIL_REGEX.test(form.email)) {
      setFormError(t("booking.emailError"));
      return;
    }
    if (!selectedDate || !selectedSlot) return;

    setSubmitting(true);
    setFormError("");
    try {
      await createBooking(username, {
        clientName: form.name,
        clientEmail: form.email,
        clientMessage: form.message || undefined,
        date: toDateStr(selectedDate),
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
      });
      setBooked(true);
    } catch {
      setFormError(t("booking.error"));
    } finally {
      setSubmitting(false);
    }
  }

  // Coerce step to a value the URL actually supports.
  let step: Step = stepFromUrl;
  if (selectedDate && !isDayAvailable(selectedDate)) step = 1;
  if (step >= 2 && !selectedDate) step = 1;
  if (step >= 3 && !selectedSlot) step = 2;

  const now = new Date();
  const canGoPrev =
    view.year > now.getFullYear() ||
    (view.year === now.getFullYear() && view.month > now.getMonth());

  const dateLabel = selectedDate ? formatFullDate(selectedDate, locale) : "";
  const timeLabel = selectedSlot ? `${selectedSlot.start}–${selectedSlot.end}` : "";

  return (
    <>
      {booked ? (
          <BookingSuccess
            dateLabel={dateLabel}
            timeLabel={timeLabel}
            hostName={displayName ?? username}
            onReset={reset}
          />
        ) : step === 1 ? (
          <BookingCalendar
            viewYear={view.year}
            viewMonth={view.month}
            selectedDate={selectedDate}
            isDayAvailable={isDayAvailable}
            onPrevMonth={goPrevMonth}
            onNextMonth={goNextMonth}
            onSelectDate={pickDate}
            canGoPrev={canGoPrev}
          />
        ) : step === 2 ? (
          <div>
            <button
              onClick={backToStep1}
              className="mb-4 flex items-center gap-1 text-sm text-[var(--accent)] hover:text-[#2563EB]"
            >
              {t("booking.back")}
            </button>
            <p className="mb-4 text-sm font-semibold text-zinc-900 dark:text-white">{dateLabel}</p>
            {daySlot ? (
              <BookingTimeSlots
                slots={timeSlots}
                bookedTimes={bookedTimes}
                selectedSlot={selectedSlot}
                onSelect={pickSlot}
              />
            ) : (
              <p className="text-sm text-zinc-400">{t("booking.noSlots")}</p>
            )}
          </div>
        ) : (
          <div>
            <button
              onClick={backToStep2}
              className="mb-4 flex items-center gap-1 text-sm text-[var(--accent)] hover:text-[#2563EB]"
            >
              {t("booking.back")}
            </button>
            <p className="mb-5 text-sm font-semibold text-zinc-900 dark:text-white">
              {dateLabel} · {timeLabel}
            </p>
            <BookingForm
              form={form}
              setForm={setForm}
              submitting={submitting}
              error={formError}
              onSubmit={handleSubmit}
            />
          </div>
        )}
    </>
  );
}
