"use client";

import { useEffect, useState } from "react";
import { Calendar, MessageSquare } from "lucide-react";
import { getPublicAvailability } from "@/lib/api";
import BookingWidget from "@/components/BookingWidget";
import { ContactForm } from "./ContactForm";
import { useTranslation } from "@/lib/i18n";

interface Props {
  username: string;
  displayName: string | null;
}

type Tab = "book" | "message";

export function GetInTouch({ username, displayName }: Props) {
  const { t } = useTranslation();
  const [hasBooking, setHasBooking] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("book");

  useEffect(() => {
    getPublicAvailability(username)
      .then((slots) => {
        const has = slots.some((s) => s.isActive);
        setHasBooking(has);
        if (!has) setTab("message");
      })
      .catch(() => setHasBooking(false));
  }, [username]);

  if (hasBooking === null) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="p-12 text-center text-sm text-zinc-400">{t("common.loading")}</div>
      </div>
    );
  }

  if (!hasBooking) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-5 text-lg font-semibold text-[#111827] dark:text-white">
          {t("contact.writeToMe")}
        </h2>
        <ContactForm username={username} />
      </div>
    );
  }

  const tabClass = (active: boolean) =>
    `flex flex-1 items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold transition-colors ${
      active
        ? "border-b-2 border-[var(--accent)] text-[var(--accent)]"
        : "border-b-2 border-transparent text-[#6B7280] hover:text-[#111827] dark:text-zinc-400 dark:hover:text-white"
    }`;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex border-b border-gray-200 dark:border-zinc-800">
        <button onClick={() => setTab("book")} className={tabClass(tab === "book")}>
          <Calendar className="h-4 w-4" strokeWidth={2} />
          {t("profile.getInTouch.book")}
        </button>
        <button onClick={() => setTab("message")} className={tabClass(tab === "message")}>
          <MessageSquare className="h-4 w-4" strokeWidth={2} />
          {t("profile.getInTouch.message")}
        </button>
      </div>
      <div className="p-6">
        {tab === "book" ? (
          <BookingWidget username={username} displayName={displayName} />
        ) : (
          <ContactForm username={username} />
        )}
      </div>
    </div>
  );
}
