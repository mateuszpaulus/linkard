"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  tFor,
  type Locale,
} from "@/lib/i18n-shared";

export type { Locale };

interface LocaleContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string>) => string;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key) => key,
});

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  // 1 year, root path, lax — readable from server components.
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; samesite=lax`;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const fromCookie = readCookie(LOCALE_COOKIE);
    const fromStorage = localStorage.getItem(LOCALE_COOKIE);
    const stored = fromCookie ?? fromStorage;
    if (isLocale(stored)) {
      setLocaleState(stored);
      // Migrate legacy localStorage-only state to cookie so SSR stays in sync.
      if (!fromCookie) writeCookie(LOCALE_COOKIE, stored);
    }
    setMounted(true);
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    localStorage.setItem(LOCALE_COOKIE, l);
    writeCookie(LOCALE_COOKIE, l);
  }

  function t(key: string, vars?: Record<string, string>): string {
    return tFor(locale, key, vars);
  }

  if (!mounted) {
    return (
      <LocaleContext.Provider value={{ locale: DEFAULT_LOCALE, setLocale, t }}>
        {children}
      </LocaleContext.Provider>
    );
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LocaleContext);
}
