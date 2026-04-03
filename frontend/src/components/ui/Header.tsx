"use client";

import Link from "next/link";
import { useAuth, useUser, SignOutButton } from "@clerk/nextjs";
import { useState } from "react";
import { Avatar } from "./Avatar";

export function Header() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-8">
          <Link href="/" className="text-xl font-bold text-[#3B82F6]">
            Linkard
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-4 md:flex">
            {isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="inline-flex h-11 items-center rounded-xl bg-[#3B82F6] px-5 text-sm font-medium text-white hover:bg-[#2563EB]"
                >
                  Dashboard
                </Link>
                <SignOutButton>
                  <button className="inline-flex h-11 items-center rounded-xl border border-gray-300 px-5 text-sm font-medium text-[#6B7280] hover:bg-gray-50">
                    Wyloguj
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
                  className="inline-flex h-11 items-center rounded-xl border border-gray-300 px-5 text-sm font-medium text-[#111827] hover:bg-gray-50"
                >
                  Zaloguj się
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex h-11 items-center rounded-xl bg-[#3B82F6] px-5 text-sm font-medium text-white hover:bg-[#2563EB]"
                >
                  Zacznij za darmo
                </Link>
              </>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-[#6B7280] hover:bg-gray-100 md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-white p-6 shadow-xl">
            <div className="mb-8 flex items-center justify-between">
              <span className="text-lg font-bold text-[#3B82F6]">Linkard</span>
              <button onClick={() => setMobileOpen(false)} className="text-[#6B7280]">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col gap-3">
              {isSignedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex h-12 items-center rounded-xl bg-[#3B82F6] px-4 text-sm font-medium text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/explore"
                    className="flex h-12 items-center rounded-xl border border-gray-200 px-4 text-sm font-medium text-[#111827]"
                    onClick={() => setMobileOpen(false)}
                  >
                    Odkryj profile
                  </Link>
                  <Link
                    href="/pricing"
                    className="flex h-12 items-center rounded-xl border border-gray-200 px-4 text-sm font-medium text-[#111827]"
                    onClick={() => setMobileOpen(false)}
                  >
                    Cennik
                  </Link>
                  <SignOutButton>
                    <button className="flex h-12 items-center rounded-xl border border-gray-200 px-4 text-sm font-medium text-[#EF4444]">
                      Wyloguj
                    </button>
                  </SignOutButton>
                </>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="flex h-12 items-center rounded-xl border border-gray-200 px-4 text-sm font-medium text-[#111827]"
                    onClick={() => setMobileOpen(false)}
                  >
                    Zaloguj się
                  </Link>
                  <Link
                    href="/sign-up"
                    className="flex h-12 items-center rounded-xl bg-[#3B82F6] px-4 text-sm font-medium text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    Zarejestruj się
                  </Link>
                  <Link
                    href="/explore"
                    className="flex h-12 items-center rounded-xl border border-gray-200 px-4 text-sm font-medium text-[#111827]"
                    onClick={() => setMobileOpen(false)}
                  >
                    Odkryj profile
                  </Link>
                  <Link
                    href="/pricing"
                    className="flex h-12 items-center rounded-xl border border-gray-200 px-4 text-sm font-medium text-[#111827]"
                    onClick={() => setMobileOpen(false)}
                  >
                    Cennik
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
