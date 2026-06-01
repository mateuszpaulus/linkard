import "server-only";
import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  tFor,
  type Locale,
} from "@/lib/i18n-shared";

export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getServerT() {
  const locale = await getServerLocale();
  return {
    locale,
    t: (key: string, vars?: Record<string, string>) => tFor(locale, key, vars),
  };
}
