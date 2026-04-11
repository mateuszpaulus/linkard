"use client";

import { useState, useEffect } from "react";
import {
  getPublicAvailability,
  getBookedSlots,
  createBooking,
  type AvailabilitySlot,
  type BookingResponse,
} from "@/lib/api";
import { useTranslation } from "@/lib/i18n";

const DAY_NAMES_SHORT = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDayName(date: Date): string {
  const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return names[date.getDay()];
}

function formatDate(date: Date): string {
  const day = getDayName(date);
  const d = date.getDate();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${day}, ${months[date.getMonth()]} ${d}`;
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Convert Java DayOfWeek (0=Mon..6=Sun) to JS getDay() (0=Sun..6=Sat)
function javaDowToJsDay(javaDow: number): number {
  return javaDow === 6 ? 0 : javaDow + 1;
}

function generateTimeSlots(start: string, end: string): { start: string; end: string }[] {
  const slots: { start: string; end: string }[] = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let current = sh * 60 + sm;
  const endMin = eh * 60 + em;

  while (current + 30 <= endMin) {
    const h1 = String(Math.floor(current / 60)).padStart(2, "0");
    const m1 = String(current % 60).padStart(2, "0");
    const next = current + 30;
    const h2 = String(Math.floor(next / 60)).padStart(2, "0");
    const m2 = String(next % 60).padStart(2, "0");
    slots.push({ start: `${h1}:${m1}`, end: `${h2}:${m2}` });
    current = next;
  }
  return slots;
}

interface Props {
  username: string;
  displayName: string | null;
}

type Step = 1 | 2 | 3 | 4;

export default function BookingWidget({ username, displayName }: Props) {
  const { t } = useTranslation();
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>(1);

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [bookedSlots, setBookedSlots] = useState<BookingResponse[]>([]);

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    getPublicAvailability(username)
      .then(setAvailability)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [username]);

  useEffect(() => {
    if (!selectedDate) return;
    getBookedSlots(username, toDateStr(selectedDate))
      .then(setBookedSlots)
      .catch(() => setBookedSlots([]));
  }, [selectedDate, username]);

  if (loading) return null;
  if (availability.length === 0) return null;

  const activeDays = new Set(
    availability.filter((a) => a.isActive).map((a) => javaDowToJsDay(a.dayOfWeek))
  );

  function isDayAvailable(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;
    return activeDays.has(date.getDay());
  }

  function renderCalendar() {
    const firstDay = new Date(viewYear, viewMonth, 1);
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));

    const canGoPrev =
      viewYear > now.getFullYear() ||
      (viewYear === now.getFullYear() && viewMonth > now.getMonth());

    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => {
              if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
              else setViewMonth(viewMonth - 1);
            }}
            disabled={!canGoPrev}
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"
          >
            ←
          </button>
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button
            onClick={() => {
              if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
              else setViewMonth(viewMonth + 1);
            }}
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {DAY_NAMES_SHORT.map((d) => (
            <div key={d} className="py-1 text-center text-xs font-medium text-zinc-400">
              {d}
            </div>
          ))}
          {cells.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} />;
            const available = isDayAvailable(date);
            const isSelected = selectedDate && toDateStr(date) === toDateStr(selectedDate);
            return (
              <button
                key={toDateStr(date)}
                disabled={!available}
                onClick={() => { setSelectedDate(date); setSelectedSlot(null); setStep(2); }}
                className={`rounded-lg py-2 text-sm transition-colors ${
                  isSelected
                    ? "bg-[#3B82F6] font-semibold text-white"
                    : available
                    ? "text-zinc-900 hover:bg-[#3B82F6]/10 dark:text-white dark:hover:bg-[#3B82F6]/20"
                    : "text-zinc-300 dark:text-zinc-700"
                }`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function renderTimeSlots() {
    if (!selectedDate) return null;
    const jsDay = selectedDate.getDay();
    const javaDow = jsDay === 0 ? 6 : jsDay - 1;
    const slot = availability.find((a) => a.dayOfWeek === javaDow && a.isActive);
    if (!slot) return <p className="text-sm text-zinc-400">{t("booking.noSlots")}</p>;

    const timeSlots = generateTimeSlots(slot.startTime, slot.endTime);
    const bookedTimes = new Set(
      bookedSlots.filter((b) => b.status !== "CANCELLED").map((b) => b.startTime.slice(0, 5))
    );

    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {timeSlots.map((ts) => {
          const isBooked = bookedTimes.has(ts.start);
          const isSelected = selectedSlot && ts.start === selectedSlot.start;
          return (
            <button
              key={ts.start}
              disabled={isBooked}
              onClick={() => { setSelectedSlot(ts); setStep(3); }}
              className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                isSelected
                  ? "border-[#3B82F6] bg-[#3B82F6] text-white"
                  : isBooked
                  ? "border-zinc-100 bg-zinc-50 text-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-700"
                  : "border-zinc-200 bg-white text-zinc-900 hover:border-[#3B82F6] hover:bg-[#3B82F6]/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              }`}
            >
              {ts.start}
            </button>
          );
        })}
      </div>
    );
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.email.trim()) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
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
      setStep(4);
    } catch {
      setFormError(t("booking.error"));
    } finally {
      setSubmitting(false);
    }
  }

  const dateLabel = selectedDate ? formatDate(selectedDate) : "";
  const timeLabel = selectedSlot ? `${selectedSlot.start}–${selectedSlot.end}` : "";

  return (
    <section>
      <h2 className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-zinc-400">
        {t("booking.title")}
      </h2>
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {step === 1 && renderCalendar()}

        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} className="mb-4 flex items-center gap-1 text-sm text-[#3B82F6] hover:text-[#2563EB]">
              {t("booking.back")}
            </button>
            <p className="mb-4 text-sm font-semibold text-zinc-900 dark:text-white">{dateLabel}</p>
            {renderTimeSlots()}
          </div>
        )}

        {step === 3 && (
          <div>
            <button onClick={() => setStep(2)} className="mb-4 flex items-center gap-1 text-sm text-[#3B82F6] hover:text-[#2563EB]">
              {t("booking.back")}
            </button>
            <p className="mb-5 text-sm font-semibold text-zinc-900 dark:text-white">
              {dateLabel} · {timeLabel}
            </p>
            <div className="space-y-3">
              <input
                placeholder={t("booking.formName")}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-[#3B82F6] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              <input
                type="email"
                placeholder={t("booking.formEmail")}
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-[#3B82F6] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              <div>
                <textarea
                  placeholder={t("booking.formMessage")}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value.slice(0, 300) }))}
                  rows={3}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-[#3B82F6] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                <p className="mt-1 text-right text-xs text-zinc-400">{form.message.length}/300</p>
              </div>
              {formError && <p className="text-sm text-red-500">{formError}</p>}
              <button
                onClick={handleSubmit}
                disabled={submitting || !form.name.trim() || !form.email.trim()}
                className="w-full rounded-lg bg-[#3B82F6] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-50"
              >
                {submitting ? t("booking.submitting") : t("booking.submit")}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#10B981]/10 text-3xl text-[#10B981]">
              ✓
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{t("booking.success")}</h3>
            <p className="mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              {dateLabel} · {timeLabel}
            </p>
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              {t("booking.successDesc", { name: displayName ?? username })}
            </p>
            <button
              onClick={() => { setStep(1); setSelectedDate(null); setSelectedSlot(null); setForm({ name: "", email: "", message: "" }); }}
              className="mt-6 rounded-lg bg-[#3B82F6] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563EB]"
            >
              {t("booking.backToProfile")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
