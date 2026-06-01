"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser, SignOutButton } from "@clerk/nextjs";
import {
  User,
  Briefcase,
  Link2,
  Calendar,
  BarChart3,
  CreditCard,
  LogOut,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { DevTokenButton } from "@/components/ui/DevTokenButton";
import { useTranslation } from "@/lib/i18n";
import { DashboardProvider, useDashboardCtx } from "./DashboardContext";
import { ProfileTab } from "./components/ProfileTab";
import { ServicesTab } from "./components/ServicesTab";
import { LinksTab } from "./components/LinksTab";
import { BookingTab } from "./components/BookingTab";
import { StatsTab } from "./components/StatsTab";
import { PlanTab } from "./components/PlanTab";

type Tab = "profile" | "services" | "links" | "booking" | "stats" | "plan";

function TabContentSkeleton() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-7 w-40 rounded" />
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="space-y-3">
          <div className="skeleton h-4 w-1/3 rounded" />
          <div className="skeleton h-10 w-full rounded-lg" />
          <div className="skeleton h-4 w-1/4 rounded" />
          <div className="skeleton h-10 w-full rounded-lg" />
          <div className="skeleton h-4 w-1/4 rounded" />
          <div className="skeleton h-24 w-full rounded-lg" />
        </div>
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <div className="skeleton h-5 w-32 rounded" />
          <div className="skeleton h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}

function DashboardContent() {
  const { user } = useUser();
  const { t } = useTranslation();
  const d = useDashboardCtx();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const pendingCount = d.bookings.filter((b) => b.status === "PENDING").length;

  const NAV_ITEMS: {
    id: Tab;
    label: string;
    Icon: LucideIcon;
    proOnly?: boolean;
    badge?: number;
  }[] = [
    { id: "profile", label: t("dashboard.tabs.profile"), Icon: User },
    { id: "services", label: t("dashboard.tabs.services"), Icon: Briefcase },
    { id: "links", label: t("dashboard.tabs.links"), Icon: Link2 },
    {
      id: "booking",
      label: t("dashboard.tabs.booking"),
      Icon: Calendar,
      proOnly: true,
      badge: pendingCount,
    },
    { id: "stats", label: t("dashboard.tabs.stats"), Icon: BarChart3, proOnly: true },
    { id: "plan", label: t("dashboard.tabs.plan"), Icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0b0b0f]">

      {/* ── Sidebar (desktop) ── */}
      <aside className="fixed left-0 top-0 hidden h-screen w-60 flex-col border-r border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:flex">
        <div className="border-b border-gray-200 px-6 py-5 dark:border-zinc-800">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#7C3AED] text-white shadow-sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </span>
            <span className="text-[#111827] dark:text-white">Skedify</span>
          </Link>
        </div>
        <div className="border-b border-gray-200 px-6 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            {d.loading ? (
              <div className="skeleton h-10 w-10 rounded-full" />
            ) : (
              <Avatar
                src={d.profile?.avatarUrl ?? null}
                name={d.profile?.displayName ?? null}
                username={d.profile?.username ?? "U"}
                size={40}
              />
            )}
            <div className="min-w-0 flex-1 space-y-1.5">
              {d.loading ? (
                <>
                  <div className="skeleton h-3.5 w-24 rounded" />
                  <div className="skeleton h-4 w-12 rounded-full" />
                </>
              ) : (
                <>
                  <p className="truncate text-sm font-semibold text-[#111827] dark:text-white">
                    {d.profile?.displayName || user?.firstName || t("dashboard.profile.user")}
                  </p>
                  <Badge plan={d.plan} />
                </>
              )}
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`mb-1 flex h-11 w-full items-center gap-3 rounded-xl px-4 text-sm font-medium transition-all ${
                  active
                    ? "bg-[#3B82F6] text-white shadow-sm"
                    : "text-[#6B7280] hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                <item.Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                <span>{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span
                    className={`ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-[#EF4444] text-white"
                    }`}
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
                {item.proOnly && !d.isPro && !item.badge && (
                  <Lock className="ml-auto h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                )}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-gray-200 px-3 py-4 dark:border-zinc-800 space-y-1">
          <div className="flex items-center gap-2 px-4 py-2">
            <ThemeToggle />
            <LanguageSwitcher />
            <DevTokenButton />
          </div>
          <SignOutButton>
            <button className="flex h-11 w-full items-center gap-3 rounded-xl px-4 text-sm font-medium text-[#EF4444] transition-colors hover:bg-red-50 dark:hover:bg-red-950/20">
              <LogOut className="h-4 w-4 shrink-0" strokeWidth={2} />
              {t("nav.signOut")}
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* ── Content ── */}
      <main className="pb-24 lg:ml-60 lg:pb-8">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 px-4 py-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90 lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#7C3AED] text-white">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </span>
              <span className="text-[#111827] dark:text-white">Skedify</span>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
              <DevTokenButton />
              <Badge plan={d.plan} />
              <SignOutButton>
                <button className="text-sm font-medium text-[#EF4444]">{t("nav.signOut")}</button>
              </SignOutButton>
            </div>
          </div>
        </header>

        <div id="main-content" className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-8">
          {d.loading ? <TabContentSkeleton /> : null}
          {!d.loading && activeTab === "profile" && <ProfileTab />}
          {!d.loading && activeTab === "services" && <ServicesTab />}
          {!d.loading && activeTab === "links" && <LinksTab />}
          {!d.loading && activeTab === "booking" && <BookingTab />}
          {!d.loading && activeTab === "stats" && <StatsTab />}
          {!d.loading && activeTab === "plan" && <PlanTab />}
        </div>
      </main>

      {/* ── Bottom nav (mobile) ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/90 backdrop-blur-md pb-safe dark:border-zinc-800 dark:bg-zinc-900/90 lg:hidden">
        <div className="no-scrollbar flex items-center justify-around overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                aria-label={item.label}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex min-h-[56px] min-w-[52px] flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-medium transition-colors ${
                  active
                    ? "text-[#3B82F6]"
                    : "text-[#6B7280] dark:text-zinc-400"
                }`}
              >
                {active && (
                  <span className="absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-full bg-[#3B82F6]" />
                )}
                <span className="relative inline-flex">
                  <item.Icon className="h-5 w-5" strokeWidth={2} />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -right-2 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[9px] font-bold text-white">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </span>
                <span className="max-w-[68px] truncate leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}