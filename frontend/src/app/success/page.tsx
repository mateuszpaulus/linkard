"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useTranslation } from "@/lib/i18n";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function SuccessPage() {
  const { t } = useTranslation();
  const { isSignedIn, getToken } = useAuth();
  const [visible, setVisible] = useState(false);
  const [plan, setPlan] = useState<"FREE" | "PRO" | null>(null);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;
    // Refresh subscription status after Stripe redirect
    getToken().then(async (token) => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/api/me/subscription`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPlan(data.isPro ? "PRO" : "FREE");
        }
      } catch {
        // subscription info is optional here
      }
    });
  }, [isSignedIn, getToken]);

  const features = [
    { icon: t("success.features.0.icon"), title: t("success.features.0.title"), desc: t("success.features.0.desc") },
    { icon: t("success.features.1.icon"), title: t("success.features.1.title"), desc: t("success.features.1.desc") },
    { icon: t("success.features.2.icon"), title: t("success.features.2.title"), desc: t("success.features.2.desc") },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9FAFB] px-4 dark:bg-[#0f0f0f]">
      <div
        className={`w-full max-w-lg text-center transition-all duration-700 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#10B981]/10">
          <span className="animate-bounce text-4xl">✓</span>
        </div>

        <h1 className="text-3xl font-bold text-[#111827] dark:text-white">
          {t("success.title")}
        </h1>
        {plan === "PRO" && (
          <div className="mt-3 inline-flex items-center rounded-full bg-[#10B981]/10 px-4 py-1.5 text-sm font-semibold text-[#10B981]">
            ✓ Pro plan active
          </div>
        )}
        <p className="mt-3 text-lg text-[#6B7280] dark:text-zinc-400">
          {t("success.subtitle")}
        </p>
        <p className="mt-1 text-sm text-[#6B7280] dark:text-zinc-500">
          {t("success.desc")}
        </p>

        <div className="mt-8 space-y-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <h3 className="font-semibold text-[#111827] dark:text-white">{f.title}</h3>
                  <p className="mt-1 text-sm text-[#6B7280] dark:text-zinc-400">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/dashboard"
          className="mt-8 inline-flex h-12 items-center rounded-xl bg-[#3B82F6] px-8 text-sm font-medium text-white hover:bg-[#2563EB]"
        >
          {t("success.cta")}
        </Link>

        <p className="mt-4 text-sm text-[#6B7280] dark:text-zinc-500">
          {t("success.confirmation")}
        </p>
      </div>
    </div>
  );
}
