"use client";

import Link from "next/link";
import {
  Lock,
  Eye,
  Briefcase,
  Link2,
  Calendar,
  MessageSquare,
  CalendarCheck,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useDashboardCtx } from "../DashboardContext";

function StatCard({
  label,
  value,
  sub,
  Icon,
  color,
}: {
  label: string;
  value: number | string;
  sub?: string;
  Icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className={`absolute -right-3 -top-3 flex h-14 w-14 items-center justify-center rounded-2xl ${color}`}>
        <Icon className="h-6 w-6" strokeWidth={2} />
      </div>
      <p className="text-4xl font-extrabold text-[#111827] dark:text-white">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="mt-2 text-sm font-medium text-[#111827] dark:text-zinc-200">{label}</p>
      {sub && <p className="mt-1 text-xs text-[#6B7280] dark:text-zinc-500">{sub}</p>}
    </div>
  );
}

function FunnelBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-[#6B7280] dark:text-zinc-400">{label}</span>
        <span className="font-semibold text-[#111827] dark:text-white">{value.toLocaleString()}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function StatsTab() {
  const { t } = useTranslation();
  const { isPro, stats } = useDashboardCtx();

  if (!isPro) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 text-[#3B82F6] dark:from-blue-900/30 dark:to-violet-900/30 dark:text-blue-400">
          <Lock className="h-7 w-7" strokeWidth={2.25} />
        </div>
        <h2 className="text-lg font-bold text-[#111827] dark:text-white">
          {t("dashboard.stats.proLock")}
        </h2>
        <Link
          href="/pricing"
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] px-6 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
        >
          {t("common.upgrade")} →
        </Link>
      </div>
    );
  }

  const views = stats?.viewCount ?? 0;
  const contacts = stats?.contactCount ?? 0;
  const bookings = stats?.bookingCount ?? 0;
  const conversions = contacts + bookings;
  const conversionRate = views > 0 ? Math.round((conversions / views) * 1000) / 10 : 0;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label={t("dashboard.stats.views")}
          value={views}
          sub={t("dashboard.stats.viewsSub")}
          Icon={Eye}
          color="bg-blue-100 text-[#3B82F6] dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatCard
          label={t("dashboard.stats.contacts")}
          value={contacts}
          Icon={MessageSquare}
          color="bg-pink-100 text-[#EC4899] dark:bg-pink-900/30 dark:text-pink-400"
        />
        <StatCard
          label={t("dashboard.stats.bookings")}
          value={bookings}
          Icon={CalendarCheck}
          color="bg-emerald-100 text-[#10B981] dark:bg-emerald-900/30 dark:text-emerald-400"
        />
        <StatCard
          label={t("dashboard.stats.services")}
          value={stats?.servicesCount ?? 0}
          Icon={Briefcase}
          color="bg-violet-100 text-[#7C3AED] dark:bg-violet-900/30 dark:text-violet-400"
        />
        <StatCard
          label={t("dashboard.stats.links")}
          value={stats?.linksCount ?? 0}
          Icon={Link2}
          color="bg-indigo-100 text-[#6366F1] dark:bg-indigo-900/30 dark:text-indigo-400"
        />
        <StatCard
          label={t("dashboard.stats.pendingBookings")}
          value={stats?.pendingBookings ?? 0}
          Icon={Calendar}
          color="bg-amber-100 text-[#F59E0B] dark:bg-amber-900/30 dark:text-amber-400"
        />
      </div>

      {/* Funnel */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#3B82F6]" strokeWidth={2} />
          <h3 className="text-sm font-semibold text-[#111827] dark:text-white">
            {t("dashboard.stats.funnelTitle")}
          </h3>
        </div>
        <div className="space-y-3">
          <FunnelBar label={t("dashboard.stats.views")} value={views} max={views} color="bg-[#3B82F6]" />
          <FunnelBar label={t("dashboard.stats.contacts")} value={contacts} max={views} color="bg-[#EC4899]" />
          <FunnelBar label={t("dashboard.stats.bookings")} value={bookings} max={views} color="bg-[#10B981]" />
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-zinc-800">
          <div>
            <p className="text-sm font-medium text-[#111827] dark:text-zinc-200">
              {t("dashboard.stats.conversion")}
            </p>
            <p className="text-xs text-[#6B7280] dark:text-zinc-500">
              {t("dashboard.stats.conversionSub")}
            </p>
          </div>
          <p className="text-3xl font-extrabold text-[#10B981]">{conversionRate}%</p>
        </div>
      </div>
    </div>
  );
}