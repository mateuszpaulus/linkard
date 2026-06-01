"use client";

import { formatMonthYear, toDateStr } from "@/lib/date";
import { useTranslation } from "@/lib/i18n";

interface Props {
  viewYear: number;
  viewMonth: number;
  selectedDate: Date | null;
  isDayAvailable: (date: Date) => boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (date: Date) => void;
  canGoPrev: boolean;
}

export function BookingCalendar({
  viewYear,
  viewMonth,
  selectedDate,
  isDayAvailable,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  canGoPrev,
}: Props) {
  const { t, locale } = useTranslation();

  const firstDay = new Date(viewYear, viewMonth, 1);
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onPrevMonth}
          disabled={!canGoPrev}
          className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"
        >
          ←
        </button>
        <span className="text-sm font-semibold text-zinc-900 dark:text-white">
          {formatMonthYear(viewYear, viewMonth, locale)}
        </span>
        <button
          onClick={onNextMonth}
          className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="py-1 text-center text-xs font-medium text-zinc-400">
            {t(`date.daysShort.${i}`)}
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
              onClick={() => onSelectDate(date)}
              className={`rounded-lg py-2 text-sm transition-colors ${
                isSelected
                  ? "bg-[var(--accent)] font-semibold text-white"
                  : available
                  ? "text-zinc-900 hover:bg-[var(--accent)]/10 dark:text-white dark:hover:bg-[var(--accent)]/20"
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
