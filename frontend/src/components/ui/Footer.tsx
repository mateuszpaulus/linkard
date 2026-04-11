"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-gray-200 bg-white px-4 py-8 dark:border-zinc-800 dark:bg-zinc-900 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <span className="text-lg font-bold text-[#3B82F6]">Skedify</span>
        <div className="flex gap-6 text-sm text-[#6B7280] dark:text-zinc-400">
          <Link href="/pricing" className="hover:text-[#111827] dark:hover:text-white">
            {t("nav.pricing")}
          </Link>
          <Link href="/sign-in" className="hover:text-[#111827] dark:hover:text-white">
            {t("nav.signIn")}
          </Link>
          <Link href="/sign-up" className="hover:text-[#111827] dark:hover:text-white">
            {t("nav.signUp")}
          </Link>
        </div>
        <p className="text-sm text-[#6B7280] dark:text-zinc-400">
          © 2026 Skedify · Made with ❤️
        </p>
      </div>
    </footer>
  );
}
