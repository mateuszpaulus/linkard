"use client";

import { useTranslation, type Locale } from "@/lib/i18n";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useTranslation();

  const other: Locale = locale === "en" ? "pl" : "en";

  return (
    <button
      onClick={() => setLocale(other)}
      aria-label={`Switch to ${other.toUpperCase()}`}
      className={`inline-flex h-9 items-center rounded-lg px-2.5 text-xs font-semibold text-[#6B7280] transition-colors hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800 ${className ?? ""}`}
    >
      {other.toUpperCase()}
    </button>
  );
}