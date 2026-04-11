"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import en from "@/messages/en.json";
import pl from "@/messages/pl.json";

export type Locale = "en" | "pl";

const translations: Record<Locale, Record<string, unknown>> = { en, pl };

function resolve(obj: Record<string, unknown>, path: string): string {
  const val = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
  return typeof val === "string" ? val : path;
}

interface LocaleContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string>) => string;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("skedify-locale") as Locale | null;
    if (stored === "pl" || stored === "en") setLocaleState(stored);
    setMounted(true);
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    localStorage.setItem("skedify-locale", l);
  }

  function t(key: string, vars?: Record<string, string>): string {
    let str = resolve(translations[locale], key);
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, v);
      });
    }
    return str;
  }

  // Prevent hydration mismatch by not rendering children until mounted
  if (!mounted) {
    return (
      <LocaleContext.Provider value={{ locale: "en", setLocale, t }}>
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