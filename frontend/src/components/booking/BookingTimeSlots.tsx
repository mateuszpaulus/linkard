"use client";

import type { TimeSlot } from "@/lib/booking";

interface Props {
  slots: TimeSlot[];
  bookedTimes: Set<string>;
  selectedSlot: TimeSlot | null;
  onSelect: (slot: TimeSlot) => void;
}

export function BookingTimeSlots({ slots, bookedTimes, selectedSlot, onSelect }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((ts) => {
        const isBooked = bookedTimes.has(ts.start);
        const isSelected = selectedSlot?.start === ts.start;
        return (
          <button
            key={ts.start}
            disabled={isBooked}
            onClick={() => onSelect(ts)}
            className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
              isSelected
                ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                : isBooked
                ? "border-zinc-100 bg-zinc-50 text-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-700"
                : "border-zinc-200 bg-white text-zinc-900 hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            }`}
          >
            {ts.start}
          </button>
        );
      })}
    </div>
  );
}
