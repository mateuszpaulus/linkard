"use client";

import { useState, useEffect } from "react";
import { getAvailableDays, getAvailableSlots, createBooking } from "@/lib/api";
import { Spinner } from "@/components/ui/Spinner";
import type { BookingSlot } from "@/types";

interface Props {
  username: string;
}

const DAY_NAMES = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];
const MONTH_NAMES = [
  "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
  "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień",
];

type Step = "calendar" | "slots" | "form" | "done";

export function BookingCalendar({ username }: Props) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [loadingDays, setLoadingDays] = useState(true);

  const [step, setStep] = useState<Step>("calendar");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;

  useEffect(() => {
    loadAvailableDays();
  }, [currentMonth, currentYear]);

  async function loadAvailableDays() {
    setLoadingDays(true);
    try {
      const days = await getAvailableDays(username, monthStr);
      setAvailableDays(days);
    } catch {
      setAvailableDays([]);
    } finally {
      setLoadingDays(false);
    }
  }

  async function handleSelectDate(date: string) {
    setSelectedDate(date);
    setStep("slots");
    setLoadingSlots(true);
    try {
      const s = await getAvailableSlots(username, date);
      setSlots(s);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  function handleSelectSlot(time: string) {
    setSelectedSlot(time);
    setStep("form");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) return;
    setSubmitting(true);
    setError("");
    try {
      await createBooking(username, {
        date: selectedDate,
        time: selectedSlot,
        name: form.name,
        email: form.email,
        message: form.message || undefined,
      });
      setStep("done");
    } catch {
      setError("Nie udało się zarezerwować. Spróbuj ponownie.");
    } finally {
      setSubmitting(false);
    }
  }

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  function renderCalendar() {
    const firstDay = new Date(currentYear, currentMonth, 1);
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const cells: React.ReactNode[] = [];
    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`empty-${i}`} />);
    }

    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const isPast = dateStr < todayStr;
      const isAvailable = availableDays.includes(dateStr);
      const canSelect = !isPast && isAvailable;

      cells.push(
        <button
          key={d}
          disabled={!canSelect}
          onClick={() => canSelect && handleSelectDate(dateStr)}
          className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
            canSelect
              ? "text-[#111827] hover:bg-[#3B82F6] hover:text-white"
              : "cursor-default text-gray-300"
          }`}
        >
          {d}
        </button>
      );
    }

    return cells;
  }

  if (step === "done") {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#10B981]/10 text-3xl text-[#10B981]">
          ✓
        </div>
        <h3 className="text-xl font-semibold text-[#111827]">Rezerwacja wysłana!</h3>
        <p className="mt-2 text-sm text-[#6B7280]">
          {selectedDate} o {selectedSlot}
        </p>
        <p className="mt-1 text-sm text-[#6B7280]">
          Właściciel otrzyma powiadomienie email.
        </p>
        <button
          onClick={() => {
            setStep("calendar");
            setSelectedDate(null);
            setSelectedSlot(null);
            setForm({ name: "", email: "", message: "" });
          }}
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-[#3B82F6] px-6 text-sm font-medium text-white hover:bg-[#2563EB]"
        >
          Wróć do profilu
        </button>
      </div>
    );
  }

  if (step === "form") {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <button
          onClick={() => setStep("slots")}
          className="mb-4 text-sm font-medium text-[#3B82F6] hover:text-[#2563EB]"
        >
          ← Wróć
        </button>
        <p className="mb-4 text-sm font-medium text-[#111827]">
          {selectedDate} o {selectedSlot}
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-[#EF4444]/10 px-4 py-2.5 text-sm text-[#EF4444]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#111827]">Imię i nazwisko *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#111827]">Email *</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#111827]">Wiadomość (opcjonalnie)</label>
            <textarea
              maxLength={300}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              rows={3}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
            />
            <p className="mt-1 text-right text-xs text-[#6B7280]">{form.message.length}/300</p>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-[#3B82F6] text-sm font-medium text-white hover:bg-[#2563EB] disabled:opacity-50"
          >
            {submitting ? <Spinner className="h-5 w-5 text-white" /> : "Zarezerwuj"}
          </button>
        </form>
      </div>
    );
  }

  if (step === "slots") {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <button
          onClick={() => setStep("calendar")}
          className="mb-4 text-sm font-medium text-[#3B82F6] hover:text-[#2563EB]"
        >
          ← Wróć
        </button>
        <p className="mb-4 text-sm font-medium text-[#111827]">{selectedDate}</p>

        {loadingSlots ? (
          <div className="flex justify-center py-8">
            <Spinner className="h-6 w-6 text-[#3B82F6]" />
          </div>
        ) : slots.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#6B7280]">Brak dostępnych godzin.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((s) => (
              <button
                key={s.time}
                disabled={!s.available}
                onClick={() => s.available && handleSelectSlot(s.time)}
                className={`flex h-11 items-center justify-center rounded-xl border text-sm font-medium transition-colors ${
                  s.available
                    ? "border-gray-300 text-[#111827] hover:border-[#3B82F6] hover:bg-[#3B82F6] hover:text-white"
                    : "border-gray-200 bg-gray-100 text-gray-400"
                }`}
              >
                {s.time}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Calendar step
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-[#111827]">📅 Umów spotkanie</h2>

      <div className="mb-4 flex items-center justify-between">
        <button onClick={prevMonth} className="text-[#6B7280] hover:text-[#111827]">
          ←
        </button>
        <span className="text-sm font-semibold text-[#111827]">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </span>
        <button onClick={nextMonth} className="text-[#6B7280] hover:text-[#111827]">
          →
        </button>
      </div>

      {loadingDays ? (
        <div className="flex justify-center py-8">
          <Spinner className="h-6 w-6 text-[#3B82F6]" />
        </div>
      ) : (
        <>
          <div className="mb-2 grid grid-cols-7 gap-1">
            {DAY_NAMES.map((d) => (
              <div key={d} className="flex h-8 items-center justify-center text-xs font-medium text-[#6B7280]">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>
        </>
      )}
    </div>
  );
}
