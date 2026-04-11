"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, useUser, SignOutButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Avatar } from "./Avatar";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "@/lib/i18n";

function NavLink({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "text-[#3B82F6]"
          : "text-[#6B7280] hover:text-[#111827] dark:text-zinc-400 dark:hover:text-white"
      }`}
    >
      {label}
      {active && (
        <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-[#3B82F6]" />
      )}
    </Link>
  );
}

export function Header() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md transition-shadow ${
          scrolled
            ? "border-gray-200 bg-white/90 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90"
            : "border-transparent bg-white/70 dark:bg-zinc-900/70"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-8">
          <Link href="/" className="group flex items-center gap-2 text-xl font-bold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#7C3AED] text-white shadow-sm transition-transform group-hover:scale-105">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </span>
            <span className="text-[#111827] dark:text-white">Skedify</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink href="/explore" label={t("nav.explore")} />
            <NavLink href="/pricing" label={t("nav.pricing")} />
            <div className="mx-2 h-6 w-px bg-gray-200 dark:bg-zinc-700" />
            <ThemeToggle />
            <LanguageSwitcher />
            {isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="ml-2 inline-flex h-10 items-center rounded-xl bg-[#3B82F6] px-5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#2563EB] hover:shadow-md"
                >
                  {t("nav.dashboard")}
                </Link>
                <SignOutButton>
                  <button
                    aria-label={t("nav.signOut")}
                    className="ml-1 inline-flex h-10 items-center rounded-xl border border-gray-200 px-4 text-sm font-medium text-[#6B7280] transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    {t("nav.signOut")}
                  </button>
                </SignOutButton>
                {user?.imageUrl && (
                  <Avatar
                    src={user.imageUrl}
                    username={user.firstName ?? "U"}
                    name={user.firstName}
                    size={36}
                  />
                )}
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="ml-2 inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium text-[#111827] transition-colors hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {t("nav.signIn")}
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex h-10 items-center rounded-xl bg-[#3B82F6] px-5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#2563EB] hover:shadow-md"
                >
                  {t("nav.getStarted")}
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <LanguageSwitcher />
            <button
              aria-label="Open menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-[#6B7280] hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              onClick={() => setMobileOpen(true)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 animate-fade-in bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-72 animate-slide-in-right bg-white p-6 shadow-2xl dark:bg-zinc-900">
            <div className="mb-8 flex items-center justify-between">
              <span className="flex items-center gap-2 text-lg font-bold">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#7C3AED] text-white">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </span>
                <span className="text-[#111827] dark:text-white">Skedify</span>
              </span>
              <button
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[#6B7280] hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col gap-2">
              {isSignedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex h-12 items-center rounded-xl bg-[#3B82F6] px-4 text-sm font-medium text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t("nav.dashboard")}
                  </Link>
                  <Link
                    href="/explore"
                    className="flex h-12 items-center rounded-xl border border-gray-200 px-4 text-sm font-medium text-[#111827] dark:border-zinc-700 dark:text-zinc-200"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t("nav.explore")}
                  </Link>
                  <Link
                    href="/pricing"
                    className="flex h-12 items-center rounded-xl border border-gray-200 px-4 text-sm font-medium text-[#111827] dark:border-zinc-700 dark:text-zinc-200"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t("nav.pricing")}
                  </Link>
                  <SignOutButton>
                    <button className="flex h-12 items-center rounded-xl border border-gray-200 px-4 text-sm font-medium text-[#EF4444] dark:border-zinc-700">
                      {t("nav.signOut")}
                    </button>
                  </SignOutButton>
                </>
              ) : (
                <>
                  <Link
                    href="/sign-up"
                    className="flex h-12 items-center rounded-xl bg-[#3B82F6] px-4 text-sm font-medium text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t("nav.signUp")}
                  </Link>
                  <Link
                    href="/sign-in"
                    className="flex h-12 items-center rounded-xl border border-gray-200 px-4 text-sm font-medium text-[#111827] dark:border-zinc-700 dark:text-zinc-200"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t("nav.signIn")}
                  </Link>
                  <Link
                    href="/explore"
                    className="flex h-12 items-center rounded-xl border border-gray-200 px-4 text-sm font-medium text-[#111827] dark:border-zinc-700 dark:text-zinc-200"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t("nav.explore")}
                  </Link>
                  <Link
                    href="/pricing"
                    className="flex h-12 items-center rounded-xl border border-gray-200 px-4 text-sm font-medium text-[#111827] dark:border-zinc-700 dark:text-zinc-200"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t("nav.pricing")}
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}