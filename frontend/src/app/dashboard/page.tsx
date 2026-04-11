"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Toast } from "@/components/ui/Toast";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n";
import { useDashboard } from "./hooks/useDashboard";
import { ProfileTab } from "./components/ProfileTab";
import { ServicesTab } from "./components/ServicesTab";
import { LinksTab } from "./components/LinksTab";
import { BookingTab } from "./components/BookingTab";
import { StatsTab } from "./components/StatsTab";
import { PlanTab } from "./components/PlanTab";

type Tab = "profile" | "services" | "links" | "booking" | "stats" | "plan";

export default function DashboardPage() {
  const { user } = useUser();
  const { t } = useTranslation();
  const d = useDashboard();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const NAV_ITEMS: { id: Tab; label: string; icon: string; proOnly?: boolean }[] = [
    { id: "profile", label: t("dashboard.tabs.profile"), icon: "👤" },
    { id: "services", label: t("dashboard.tabs.services"), icon: "🛠️" },
    { id: "links", label: t("dashboard.tabs.links"), icon: "🔗" },
    { id: "booking", label: t("dashboard.tabs.booking"), icon: "📅", proOnly: true },
    { id: "stats", label: t("dashboard.tabs.stats"), icon: "📊", proOnly: true },
    { id: "plan", label: t("dashboard.tabs.plan"), icon: "💳" },
  ];

  if (d.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB] dark:bg-[#0b0b0f]">
        <Spinner className="h-8 w-8 text-[#3B82F6]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0b0b0f]">
      {d.toast && (
        <Toast
          message={d.toast.message}
          type={d.toast.type}
          onClose={() => d.setToast(null)}
        />
      )}

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
            <Avatar
              src={d.profile?.avatarUrl ?? null}
              name={d.profile?.displayName ?? null}
              username={d.profile?.username ?? "U"}
              size={40}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#111827] dark:text-white">
                {d.profile?.displayName || user?.firstName || t("dashboard.profile.user")}
              </p>
              <Badge plan={d.plan} />
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
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
                {item.proOnly && !d.isPro && <span className="ml-auto text-xs">🔒</span>}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-gray-200 px-3 py-4 dark:border-zinc-800 space-y-1">
          <div className="flex items-center gap-2 px-4 py-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
          <SignOutButton>
            <button className="flex h-11 w-full items-center gap-3 rounded-xl px-4 text-sm font-medium text-[#EF4444] transition-colors hover:bg-red-50 dark:hover:bg-red-950/20">
              ⇠ {t("nav.signOut")}
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
              <Badge plan={d.plan} />
              <SignOutButton>
                <button className="text-sm font-medium text-[#EF4444]">{t("nav.signOut")}</button>
              </SignOutButton>
            </div>
          </div>
        </header>

        <div id="main-content" className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-8">
          {/* ── Tab content ── */}
          {activeTab === "profile" && (
            <ProfileTab
              profile={d.profile}
              onSave={d.saveProfile}
              onToast={d.setToast}
            />
          )}
          {activeTab === "services" && (
            <ServicesTab
              services={d.services}
              isPro={d.isPro}
              onCreateOrUpdate={d.createOrUpdateService}
              onRemove={d.removeService}
              onToast={d.setToast}
            />
          )}
          {activeTab === "links" && (
            <LinksTab
              links={d.links}
              isPro={d.isPro}
              onCreateOrUpdate={d.createOrUpdateLink}
              onRemove={d.removeLink}
              onToast={d.setToast}
            />
          )}
          {activeTab === "booking" && (
            <BookingTab
              isPro={d.isPro}
              availability={d.availability}
              setAvailability={d.setAvailability}
              bookings={d.bookings}
              onSaveAvailability={d.saveAvailability}
              onConfirm={d.confirm}
              onCancel={d.cancel}
              onToast={d.setToast}
            />
          )}
          {activeTab === "stats" && <StatsTab isPro={d.isPro} stats={d.stats} />}
          {activeTab === "plan" && (
            <PlanTab
              isPro={d.isPro}
              servicesCount={d.services.length}
              linksCount={d.links.length}
              onUpgrade={d.upgrade}
              onManage={d.managePortal}
              onToast={d.setToast}
            />
          )}
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
                className={`flex min-h-[56px] min-w-[52px] flex-col items-center justify-center gap-0.5 px-2 text-[10px] font-medium transition-colors ${
                  active
                    ? "text-[#3B82F6]"
                    : "text-[#6B7280] dark:text-zinc-400"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
                {active && (
                  <span className="absolute top-0 h-0.5 w-8 rounded-full bg-[#3B82F6]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}