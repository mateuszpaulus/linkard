import en from "@/messages/en.json";
import pl from "@/messages/pl.json";

export type Locale = "en" | "pl";

export const LOCALE_COOKIE = "skedify-locale";
export const DEFAULT_LOCALE: Locale = "en";

export const translations: Record<Locale, Record<string, unknown>> = { en, pl };

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "pl";
}

function resolve(obj: Record<string, unknown>, path: string): string {
  const val = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
  return typeof val === "string" ? val : path;
}

export function tFor(locale: Locale, key: string, vars?: Record<string, string>): string {
  let str = resolve(translations[locale], key);
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(`{${k}}`, v);
    });
  }
  return str;
}
