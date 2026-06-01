import type { Locale } from "@/lib/i18n";

const BCP47: Record<Locale, string> = {
  en: "en-US",
  pl: "pl-PL",
};

export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatFullDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(BCP47[locale], {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatMonthYear(year: number, monthIdx: number, locale: Locale): string {
  const s = new Intl.DateTimeFormat(BCP47[locale], {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthIdx, 1));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Java DayOfWeek (0=Mon..6=Sun). Returns capitalized weekday name for the locale.
const MONDAY_REF = Date.UTC(2024, 0, 1); // 2024-01-01 is a Monday
export function formatWeekday(javaDow: number, locale: Locale): string {
  const d = new Date(MONDAY_REF + javaDow * 86_400_000);
  const s = new Intl.DateTimeFormat(BCP47[locale], { weekday: "long" }).format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Java DayOfWeek: 0=Mon..6=Sun. JS Date.getDay(): 0=Sun..6=Sat.
export function javaDowToJsDay(javaDow: number): number {
  return javaDow === 6 ? 0 : javaDow + 1;
}

export function jsDayToJavaDow(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}
