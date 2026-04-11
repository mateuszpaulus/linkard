"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import type { StatsResponse } from "@/types";

interface Props {
  isPro: boolean;
  stats: StatsResponse | null;
}

function StatCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: string;
  color: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className={`absolute -right-4 -top-4 flex h-16 w-16 items-center justify-center rounded-2xl ${color} text-2xl opacity-80`}>
        {icon}
      </div>
      <p className="text-4xl font-extrabold text-[#111827] dark:text-white">
        {value.toLocaleString()}
      </p>
      <p className="mt-2 text-sm font-medium text-[#111827] dark:text-zinc-200">{label}</p>
      {sub && <p className="mt-1 text-xs text-[#6B7280] dark:text-zinc-500">{sub}</p>}
    </div>
  );
}

export function StatsTab({ isPro, stats }: Props) {
  const { t } = useTranslation();

  if (!isPro) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 text-3xl dark:from-blue-900/30 dark:to-violet-900/30">
          🔒
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

  return (
    <div className="animate-fade-in grid gap-4 sm:grid-cols-2">
      <StatCard
        label={t("dashboard.stats.views")}
        value={stats?.viewCount ?? 0}
        sub={t("dashboard.stats.viewsSub")}
        icon="👁"
        color="bg-blue-100 dark:bg-blue-900/30"
      />
      <StatCard
        label={t("dashboard.stats.services")}
        value={stats?.servicesCount ?? 0}
        icon="🛠️"
        color="bg-green-100 dark:bg-green-900/30"
      />
      <StatCard
        label={t("dashboard.stats.links")}
        value={stats?.linksCount ?? 0}
        icon="🔗"
        color="bg-violet-100 dark:bg-violet-900/30"
      />
      <StatCard
        label={t("dashboard.stats.pendingBookings")}
        value={stats?.pendingBookings ?? 0}
        icon="📅"
        color="bg-amber-100 dark:bg-amber-900/30"
      />
    </div>
  );
}