"use client";

import { useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { useTranslation } from "@/lib/i18n";

interface Props {
  isPro: boolean;
  servicesCount: number;
  linksCount: number;
  onUpgrade: () => Promise<void>;
  onManage: () => Promise<void>;
  onToast: (msg: { message: string; type: "success" | "error" }) => void;
}

function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.min(100, (value / max) * 100);
  const isWarn = value >= max * 0.8;
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-[#6B7280] dark:text-zinc-400">{label}</span>
        <span
          className={
            isWarn ? "font-semibold text-[#F59E0B]" : "font-medium text-[#111827] dark:text-white"
          }
        >
          {value}/{max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isWarn
              ? "bg-[#F59E0B]"
              : "bg-gradient-to-r from-[#3B82F6] to-[#7C3AED]"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function PlanTab({ isPro, servicesCount, linksCount, onUpgrade, onManage, onToast }: Props) {
  const { t } = useTranslation();
  const [upgrading, setUpgrading] = useState(false);

  async function handleUpgrade() {
    setUpgrading(true);
    try {
      await onUpgrade();
    } catch {
      onToast({ message: t("dashboard.plan.upgradeError"), type: "error" });
      setUpgrading(false);
    }
  }

  async function handleManage() {
    try {
      await onManage();
    } catch {
      onToast({ message: t("dashboard.plan.manageError"), type: "error" });
    }
  }

  if (isPro) {
    return (
      <div className="animate-fade-in">
        <div className="rounded-2xl border-2 border-[#10B981]/40 bg-gradient-to-br from-green-50 to-white p-8 shadow-sm dark:border-[#10B981]/30 dark:from-green-950/20 dark:to-zinc-900">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#10B981] text-2xl text-white shadow-md">
              ⭐
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#111827] dark:text-white">
                {t("dashboard.plan.proTitle")}
              </h2>
              <span className="inline-block rounded-full bg-[#10B981]/10 px-3 py-0.5 text-xs font-semibold text-[#10B981]">
                ✓ {t("dashboard.plan.activeLabel")}
              </span>
            </div>
          </div>
          <ul className="mt-6 space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  ✓
                </span>
                <span className="text-[#111827] dark:text-zinc-200">
                  {t(`dashboard.plan.proFeatures.${i}`)}
                </span>
              </li>
            ))}
          </ul>
          <button
            onClick={handleManage}
            className="mt-8 inline-flex h-11 items-center rounded-xl border border-gray-300 bg-white px-6 text-sm font-semibold text-[#111827] transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {t("dashboard.plan.manage")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="text-xl font-bold text-[#111827] dark:text-white">
          {t("dashboard.plan.freeTitle")}
        </h2>
        <p className="mt-1 text-sm text-[#6B7280] dark:text-zinc-400">
          Currently active
        </p>

        <div className="mt-6 space-y-4">
          <ProgressBar value={servicesCount} max={3} label="Services" />
          <ProgressBar value={linksCount} max={3} label="Links" />
        </div>

        <ul className="mt-6 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-400 dark:bg-zinc-800 dark:text-zinc-500">
                •
              </span>
              <span className="text-[#6B7280] dark:text-zinc-400">
                {t(`dashboard.plan.freeFeatures.${i}`)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Upgrade CTA */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#3B82F6] via-[#2563EB] to-[#7C3AED] p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
            ⭐ {t("dashboard.plan.proTitle")}
          </div>
          <h3 className="mt-4 text-2xl font-bold">Unlock everything</h3>
          <p className="mt-2 text-sm text-blue-100">
            Get unlimited services, links, booking system and analytics.
          </p>
          <button
            onClick={handleUpgrade}
            disabled={upgrading}
            className="mt-6 inline-flex h-12 items-center rounded-xl bg-white px-7 text-sm font-bold text-[#3B82F6] shadow-md transition-all hover:scale-105 hover:shadow-xl disabled:opacity-70"
          >
            {upgrading ? (
              <Spinner className="h-5 w-5 text-[#3B82F6]" />
            ) : (
              <>
                {t("dashboard.plan.upgradeBtn")} →
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}