"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { Spinner } from "@/components/ui/Spinner";
import { createCheckoutSession } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function PricingPage() {
  const { t } = useTranslation();
  const { isSignedIn, getToken } = useAuth();
  const [plan, setPlan] = useState<"FREE" | "PRO" | null>(null);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [yearly, setYearly] = useState(false);

  useEffect(() => {
    if (!isSignedIn) return;
    getToken().then((token) => {
      if (!token) return;
      fetch(`${API_URL}/api/me/subscription`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => setPlan(data.isPro ? "PRO" : "FREE"))
        .catch(() => setPlan("FREE"));
    });
  }, [isSignedIn, getToken]);

  async function handleUpgrade() {
    if (!isSignedIn) {
      window.location.href = "/sign-up";
      return;
    }
    const token = await getToken();
    if (!token) return;
    setLoading(true);
    try {
      const { url } = await createCheckoutSession(token);
      window.location.href = url;
    } catch {
      alert(t("pricing.upgradeError"));
    } finally {
      setLoading(false);
    }
  }

  const freeFeatures = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({
    label: t(`pricing.freeFeatures.${i}.label`),
    included: i < 4,
  }));

  const proFeatures = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({
    label: t(`pricing.proFeatures.${i}.label`),
    included: true,
  }));

  const faqs = [0, 1, 2, 3].map((i) => ({
    q: t(`pricing.faq.${i}.q`),
    a: t(`pricing.faq.${i}.a`),
  }));

  const proPrice = yearly ? 7 : 9;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/40 to-white dark:from-blue-950/10 dark:to-[#0b0b0f]">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-16 md:py-20 lg:px-8">
        {/* Hero */}
        <div className="mb-12 animate-fade-in-up text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            💎 {t("pricing.subtitle")}
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[#111827] dark:text-white md:text-5xl">
            {t("pricing.title")}
          </h1>

          {/* Monthly/Yearly toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-gray-100 p-1 dark:bg-zinc-800">
            <button
              onClick={() => setYearly(false)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                !yearly
                  ? "bg-white text-[#111827] shadow-sm dark:bg-zinc-900 dark:text-white"
                  : "text-[#6B7280] dark:text-zinc-400"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all ${
                yearly
                  ? "bg-white text-[#111827] shadow-sm dark:bg-zinc-900 dark:text-white"
                  : "text-[#6B7280] dark:text-zinc-400"
              }`}
            >
              Yearly
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-600 dark:bg-green-900/30 dark:text-green-400">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid gap-6 md:grid-cols-2 md:items-start">
          {/* FREE */}
          <div className="animate-fade-in-up animate-fade-in-up-delay-1 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-xl font-bold text-[#111827] dark:text-white">
              {t("pricing.freeTitle")}
            </h2>
            <div className="mt-4 flex items-baseline">
              <span className="text-5xl font-extrabold text-[#111827] dark:text-white">$0</span>
              <span className="ml-2 text-[#6B7280] dark:text-zinc-400">
                {t("pricing.freePeriod")}
              </span>
            </div>
            <p className="mt-3 text-sm text-[#6B7280] dark:text-zinc-400">
              {t("pricing.freeTagline")}
            </p>
            <hr className="my-6 border-gray-100 dark:border-zinc-800" />
            <ul className="space-y-3">
              {freeFeatures.map((f) => (
                <li key={f.label} className="flex items-start gap-3 text-sm">
                  {f.included ? (
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-600 dark:bg-green-900/30 dark:text-green-400">
                      ✓
                    </span>
                  ) : (
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-400 line-through dark:bg-zinc-800 dark:text-zinc-600">
                      ✗
                    </span>
                  )}
                  <span
                    className={
                      f.included
                        ? "text-[#111827] dark:text-zinc-200"
                        : "text-gray-400 line-through dark:text-zinc-600"
                    }
                  >
                    {f.label}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              {!isSignedIn ? (
                <Link
                  href="/sign-up"
                  className="flex h-12 items-center justify-center rounded-xl border border-gray-300 text-sm font-semibold text-[#111827] transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {t("pricing.startFree")}
                </Link>
              ) : plan === "FREE" ? (
                <button
                  disabled
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-gray-100 text-sm font-semibold text-[#6B7280] dark:bg-zinc-800 dark:text-zinc-400"
                >
                  ✓ {t("pricing.yourPlan")}
                </button>
              ) : (
                <button
                  disabled
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-gray-100 text-sm font-semibold text-[#6B7280] dark:bg-zinc-800 dark:text-zinc-400"
                >
                  {t("pricing.yourPlanPro")}
                </button>
              )}
            </div>
          </div>

          {/* PRO */}
          <div className="relative animate-fade-in-up animate-fade-in-up-delay-2 md:scale-105">
            {/* Gradient border wrap */}
            <div className="rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#7C3AED] p-[2px] shadow-xl shadow-blue-500/20">
              <div className="rounded-2xl bg-white p-8 dark:bg-zinc-900">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] px-4 py-1 text-xs font-semibold text-white shadow-md">
                    ⭐ {t("pricing.popular")}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#111827] dark:text-white">
                  {t("pricing.proTitle")}
                </h2>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-extrabold text-[#111827] dark:text-white">
                    ${proPrice}
                  </span>
                  <span className="ml-2 text-[#6B7280] dark:text-zinc-400">
                    {t("pricing.proPeriod")}
                  </span>
                </div>
                <p className="mt-3 text-sm text-[#6B7280] dark:text-zinc-400">
                  {t("pricing.proTagline")}
                </p>
                <hr className="my-6 border-gray-100 dark:border-zinc-800" />
                <ul className="space-y-3">
                  {proFeatures.map((f) => (
                    <li key={f.label} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-600 dark:bg-green-900/30 dark:text-green-400">
                        ✓
                      </span>
                      <span className="text-[#111827] dark:text-zinc-200">{f.label}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  {!isSignedIn ? (
                    <Link
                      href="/sign-up"
                      className="flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg"
                    >
                      {t("pricing.startFree")} →
                    </Link>
                  ) : plan === "PRO" ? (
                    <button
                      disabled
                      className="flex h-12 w-full items-center justify-center rounded-xl bg-[#10B981]/10 text-sm font-semibold text-[#10B981]"
                    >
                      ✓ {t("pricing.yourPlanPro")}
                    </button>
                  ) : (
                    <button
                      onClick={handleUpgrade}
                      disabled={loading}
                      className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-50"
                    >
                      {loading ? <Spinner className="h-5 w-5 text-white" /> : `${t("pricing.upgradePro")} →`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-[#6B7280] dark:text-zinc-400">
          {t("pricing.stripePowered")}
        </p>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="mb-8 text-center text-3xl font-bold tracking-tight text-[#111827] dark:text-white">
            {t("pricing.faqTitle")}
          </h2>
          <div className="mx-auto max-w-2xl space-y-3">
            {faqs.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-sm font-semibold text-[#111827] transition-colors hover:bg-gray-50 dark:text-zinc-200 dark:hover:bg-zinc-800/50"
                  >
                    <span>{item.q}</span>
                    <span
                      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-[#6B7280] transition-transform dark:bg-zinc-800 dark:text-zinc-400 ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-gray-100 px-6 py-4 text-sm leading-relaxed text-[#6B7280] dark:border-zinc-800 dark:text-zinc-400">
                        {item.a}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}