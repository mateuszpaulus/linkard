"use client";

import { useState } from "react";
import Link from "next/link";
import { Spinner } from "@/components/ui/Spinner";
import { useTranslation } from "@/lib/i18n";
import type { AvailabilitySlot, BookingResponse } from "@/lib/api";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface Props {
  isPro: boolean;
  availability: AvailabilitySlot[];
  setAvailability: (slots: AvailabilitySlot[]) => void;
  bookings: BookingResponse[];
  onSaveAvailability: (slots: AvailabilitySlot[]) => Promise<AvailabilitySlot[]>;
  onConfirm: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
  onToast: (msg: { message: string; type: "success" | "error" }) => void;
}

export function BookingTab({
  isPro,
  availability,
  setAvailability,
  bookings,
  onSaveAvailability,
  onConfirm,
  onCancel,
  onToast,
}: Props) {
  const { t } = useTranslation();
  const [bookingTab, setBookingTab] = useState<"upcoming" | "history">("upcoming");
  const [saving, setSaving] = useState(false);

  if (!isPro) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 text-3xl dark:from-blue-900/30 dark:to-violet-900/30">
          🔒
        </div>
        <h2 className="text-lg font-bold text-[#111827] dark:text-white">
          {t("dashboard.booking.proLock")}
        </h2>
        <p className="mt-2 text-sm text-[#6B7280] dark:text-zinc-400">
          {t("dashboard.booking.proLockSub")}
        </p>
        <Link
          href="/pricing"
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] px-6 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
        >
          {t("common.upgrade")} →
        </Link>
      </div>
    );
  }

  async function handleSaveAvailability() {
    setSaving(true);
    try {
      await onSaveAvailability(availability);
      onToast({ message: t("dashboard.booking.availSaved"), type: "success" });
    } catch {
      onToast({ message: t("dashboard.booking.availError"), type: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirm(id: string) {
    try {
      await onConfirm(id);
      onToast({ message: t("dashboard.booking.confirmOk"), type: "success" });
    } catch {
      onToast({ message: t("dashboard.booking.actionError"), type: "error" });
    }
  }

  async function handleCancel(id: string) {
    if (!window.confirm(t("dashboard.booking.cancelConfirm"))) return;
    try {
      await onCancel(id);
      onToast({ message: t("dashboard.booking.cancelOk"), type: "success" });
    } catch {
      onToast({ message: t("dashboard.booking.actionError"), type: "error" });
    }
  }

  const today = new Date().toISOString().split("T")[0];
  const filtered = bookings.filter((b) =>
    bookingTab === "upcoming" ? b.date >= today : b.date < today
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Availability */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold text-[#111827] dark:text-white">
          {t("dashboard.booking.availTitle")}
        </h2>
        <div className="space-y-3">
          {availability.map((slot, idx) => (
            <div
              key={slot.dayOfWeek}
              className={`flex flex-wrap items-center gap-3 rounded-xl border p-4 transition-colors sm:flex-nowrap ${
                slot.isActive
                  ? "border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800"
                  : "border-gray-100 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900/50"
              }`}
            >
              <button
                type="button"
                aria-label={`Toggle ${DAY_NAMES[slot.dayOfWeek]}`}
                onClick={() => {
                  const updated = [...availability];
                  updated[idx] = { ...slot, isActive: !slot.isActive };
                  setAvailability(updated);
                }}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  slot.isActive ? "bg-[#3B82F6]" : "bg-gray-300 dark:bg-zinc-600"
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    slot.isActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span
                className={`w-28 text-sm font-medium ${
                  slot.isActive
                    ? "text-[#111827] dark:text-white"
                    : "text-gray-400 dark:text-zinc-600"
                }`}
              >
                {DAY_NAMES[slot.dayOfWeek]}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={slot.startTime}
                  disabled={!slot.isActive}
                  onChange={(e) => {
                    const updated = [...availability];
                    updated[idx] = { ...slot, startTime: e.target.value };
                    setAvailability(updated);
                  }}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                <span className="text-sm text-gray-400">—</span>
                <input
                  type="time"
                  value={slot.endTime}
                  disabled={!slot.isActive}
                  onChange={(e) => {
                    const updated = [...availability];
                    updated[idx] = { ...slot, endTime: e.target.value };
                    setAvailability(updated);
                  }}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handleSaveAvailability}
          disabled={saving}
          className="mt-6 flex h-11 items-center justify-center rounded-xl bg-[#3B82F6] px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#2563EB] hover:shadow-md disabled:opacity-50"
        >
          {saving ? <Spinner className="h-5 w-5 text-white" /> : t("dashboard.booking.saveAvail")}
        </button>
      </div>

      {/* Bookings list */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold text-[#111827] dark:text-white">
          {t("dashboard.booking.bookingsTitle")}
        </h2>
        <div className="mb-4 inline-flex rounded-xl bg-gray-100 p-1 dark:bg-zinc-800">
          {(["upcoming", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setBookingTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                bookingTab === tab
                  ? "bg-white text-[#3B82F6] shadow-sm dark:bg-zinc-900"
                  : "text-[#6B7280] hover:text-[#111827] dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              {tab === "upcoming" ? t("dashboard.booking.upcoming") : t("dashboard.booking.history")}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-10 text-center">
            <div className="text-5xl">📅</div>
            <p className="mt-3 text-sm text-[#6B7280] dark:text-zinc-400">
              {bookingTab === "upcoming"
                ? t("dashboard.booking.emptyUpcoming")
                : t("dashboard.booking.emptyHistory")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((b) => (
              <div
                key={b.id}
                className="rounded-xl border border-gray-200 p-4 transition-shadow hover:shadow-md dark:border-zinc-700"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#111827] dark:text-white">
                      📅 {b.date} · {b.startTime.slice(0, 5)}–{b.endTime.slice(0, 5)}
                    </p>
                    <p className="mt-1 text-sm text-[#6B7280] dark:text-zinc-400">
                      👤 {b.clientName} · ✉️ {b.clientEmail}
                    </p>
                    {b.clientMessage && (
                      <p className="mt-2 rounded-lg bg-gray-50 p-2 text-sm italic text-[#6B7280] dark:bg-zinc-800 dark:text-zinc-400">
                        &quot;{b.clientMessage}&quot;
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      b.status === "PENDING"
                        ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                        : b.status === "CONFIRMED"
                        ? "bg-[#10B981]/10 text-[#10B981]"
                        : "bg-[#EF4444]/10 text-[#EF4444]"
                    }`}
                  >
                    {b.status === "PENDING"
                      ? t("dashboard.booking.pending")
                      : b.status === "CONFIRMED"
                      ? t("dashboard.booking.confirmed")
                      : t("dashboard.booking.cancelled")}
                  </span>
                </div>
                {b.status === "PENDING" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleConfirm(b.id)}
                      className="inline-flex h-9 items-center rounded-lg bg-[#10B981] px-3 text-xs font-semibold text-white transition-colors hover:bg-green-600"
                    >
                      ✓ {t("dashboard.booking.confirmBtn")}
                    </button>
                    <button
                      onClick={() => handleCancel(b.id)}
                      className="inline-flex h-9 items-center rounded-lg bg-[#EF4444] px-3 text-xs font-semibold text-white transition-colors hover:bg-red-600"
                    >
                      ✗ {t("dashboard.booking.cancelBtn")}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}