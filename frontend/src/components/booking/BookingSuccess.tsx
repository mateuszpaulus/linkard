"use client";

import { useTranslation } from "@/lib/i18n";

interface Props {
  dateLabel: string;
  timeLabel: string;
  hostName: string;
  onReset: () => void;
}

export function BookingSuccess({ dateLabel, timeLabel, hostName, onReset }: Props) {
  const { t } = useTranslation();
  return (
    <div className="py-6 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#10B981]/10 text-3xl text-[#10B981]">
        ✓
      </div>
      <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{t("booking.success")}</h3>
      <p className="mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
        {dateLabel} · {timeLabel}
      </p>
      <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
        {t("booking.successDesc", { name: hostName })}
      </p>
      <button
        onClick={onReset}
        className="mt-6 rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563EB]"
      >
        {t("booking.backToProfile")}
      </button>
    </div>
  );
}
