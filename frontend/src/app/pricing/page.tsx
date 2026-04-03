"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { Spinner } from "@/components/ui/Spinner";
import { createCheckoutSession, getMyProfile } from "@/lib/api";
import { useEffect } from "react";

const FREE_FEATURES = [
  { text: "Profil z bio i zdjęciem", included: true },
  { text: "Do 3 usług z cenami", included: true },
  { text: "Do 3 linków społecznościowych", included: true },
  { text: "Publiczny URL linkard.io/username", included: true },
  { text: "Formularz kontaktowy", included: true },
  { text: "Booking spotkań", included: false },
  { text: "Własna domena", included: false },
  { text: "Analityki wyświetleń", included: false },
  { text: "Nieograniczone usługi i linki", included: false },
];

const PRO_FEATURES = [
  { text: "Wszystko z planu Free", included: true },
  { text: "Nieograniczone usługi i linki", included: true },
  { text: "Booking spotkań z kalendarzem", included: true },
  { text: "Analityki wyświetleń profilu", included: true },
  { text: "Własna domena (wkrótce)", included: true },
  { text: "Priorytetowe wsparcie email", included: true },
];

const FAQ = [
  {
    q: "Czy mogę anulować w dowolnym momencie?",
    a: "Tak, możesz anulować subskrypcję w dowolnym momencie. Twoje konto Pro będzie aktywne do końca okresu rozliczeniowego.",
  },
  {
    q: "Czy moje dane są bezpieczne?",
    a: "Tak, wszystkie dane są szyfrowane. Płatności obsługuje Stripe — nie przechowujemy danych kart.",
  },
  {
    q: "Czy potrzebuję karty kredytowej na Free?",
    a: "Nie, plan Free jest całkowicie darmowy i nie wymaga żadnych danych płatniczych.",
  },
  {
    q: "Co się stanie gdy przejdę na Free z Pro?",
    a: "Twoje dane zostają — po prostu stracisz dostęp do funkcji Pro. Usługi i linki ponad limit będą ukryte.",
  },
];

export default function PricingPage() {
  const { isSignedIn, getToken } = useAuth();
  const [plan, setPlan] = useState<"FREE" | "PRO" | null>(null);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);



  async function loadPlan() {
    const token = await getToken();
    if (!token) return;
    try {
      const profile = await getMyProfile(token);
      setPlan(profile.plan ?? "FREE");
    } catch {
      setPlan("FREE");
    }
  }

  useEffect(() => {
    if (isSignedIn) {
      loadPlan();
    }
  }, [isSignedIn]);

  async function handleUpgrade() {
    const token = await getToken();
    if (!token) return;
    setLoading(true);
    try {
      const { url } = await createCheckoutSession(token);
      window.location.href = url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-[#111827] md:text-4xl">
            Prosty, uczciwy cennik
          </h1>
          <p className="mt-3 text-lg text-[#6B7280]">
            Zacznij za darmo. Upgrade gdy jesteś gotowy.
          </p>
        </div>

        {/* Plans */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* FREE */}
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#111827]">Free</h2>
            <div className="mt-4">
              <span className="text-4xl font-bold text-[#111827]">$0</span>
              <span className="text-[#6B7280]"> /miesiąc</span>
            </div>
            <p className="mt-2 text-sm text-[#6B7280]">Idealne na start</p>
            <hr className="my-6 border-gray-200" />
            <ul className="space-y-3">
              {FREE_FEATURES.map((f) => (
                <li key={f.text} className="flex items-start gap-2 text-sm">
                  {f.included ? (
                    <span className="mt-0.5 text-[#10B981]">✓</span>
                  ) : (
                    <span className="mt-0.5 text-gray-300">✗</span>
                  )}
                  <span className={f.included ? "text-[#111827]" : "text-gray-400"}>
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              {!isSignedIn ? (
                <Link
                  href="/sign-up"
                  className="flex h-11 items-center justify-center rounded-xl border border-gray-300 text-sm font-medium text-[#111827] hover:bg-gray-50"
                >
                  Zacznij za darmo
                </Link>
              ) : plan === "FREE" ? (
                <button
                  disabled
                  className="flex h-11 w-full items-center justify-center rounded-xl bg-gray-100 text-sm font-medium text-[#6B7280]"
                >
                  Twój obecny plan
                </button>
              ) : (
                <button
                  disabled
                  className="flex h-11 w-full items-center justify-center rounded-xl bg-gray-100 text-sm font-medium text-[#6B7280]"
                >
                  Twój plan to Pro
                </button>
              )}
            </div>
          </div>

          {/* PRO */}
          <div className="relative rounded-xl border-2 border-[#3B82F6] bg-white p-8 shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-[#3B82F6] px-4 py-1 text-xs font-semibold text-white">
                ⭐ Najpopularniejszy
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#111827]">Pro</h2>
            <div className="mt-4">
              <span className="text-4xl font-bold text-[#111827]">$9</span>
              <span className="text-[#6B7280]"> /miesiąc</span>
            </div>
            <p className="mt-2 text-sm text-[#6B7280]">Dla poważnych profesjonalistów</p>
            <hr className="my-6 border-gray-200" />
            <ul className="space-y-3">
              {PRO_FEATURES.map((f) => (
                <li key={f.text} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 text-[#10B981]">✓</span>
                  <span className="text-[#111827]">{f.text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              {!isSignedIn ? (
                <Link
                  href="/sign-up"
                  className="flex h-11 items-center justify-center rounded-xl bg-[#3B82F6] text-sm font-medium text-white hover:bg-[#2563EB]"
                >
                  Zacznij za darmo
                </Link>
              ) : plan === "PRO" ? (
                <button
                  disabled
                  className="flex h-11 w-full items-center justify-center rounded-xl bg-[#10B981]/10 text-sm font-medium text-[#10B981]"
                >
                  Twój obecny plan ✓
                </button>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center rounded-xl bg-[#3B82F6] text-sm font-medium text-white hover:bg-[#2563EB] disabled:opacity-50"
                >
                  {loading ? <Spinner className="h-5 w-5 text-white" /> : "Przejdź na Pro"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-[#111827]">
            Najczęściej zadawane pytania
          </h2>
          <div className="mx-auto max-w-2xl space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-medium text-[#111827]"
                >
                  {item.q}
                  <span className="ml-4 text-[#6B7280]">
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="border-t border-gray-100 px-6 py-4 text-sm text-[#6B7280]">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
