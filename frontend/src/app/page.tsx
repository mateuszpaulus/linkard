"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";

const STEPS = [
  { icon: "👤", title: "Zarejestruj się", desc: "Załóż konto w 30 sekund przez email lub Google" },
  { icon: "✏️", title: "Wypełnij profil", desc: "Dodaj bio, usługi, ceny i linki społecznościowe" },
  { icon: "🔗", title: "Udostępnij link", desc: "Jeden link do wszystkiego: linkard.io/twojenazwisko" },
];

const AUDIENCES = [
  { icon: "💻", title: "Developerzy i IT", desc: "Pokaż portfolio, stack technologiczny i usługi potencjalnym klientom" },
  { icon: "🎨", title: "Kreatywni", desc: "Graficy, fotografowie, videografowie — Twoje portfolio zawsze pod ręką" },
  { icon: "🎯", title: "Konsultanci i coachowie", desc: "Jeden link do oferty, bookingu i kontaktu z klientem" },
];

const FEATURES_LIST = [
  { text: "Publiczny profil z własnym URL", pro: false },
  { text: "Lista usług z cenami", pro: false },
  { text: "Linki społecznościowe", pro: false },
  { text: "Formularz kontaktowy", pro: false },
  { text: "System bookingu spotkań", pro: true },
  { text: "Własna domena", pro: true },
  { text: "Analityki wyświetleń", pro: true },
  { text: "Nieograniczone usługi", pro: true },
];

const MOCK_SERVICES = [
  { title: "Konsultacja 1h", price: "300 PLN" },
  { title: "Code Review", price: "500 PLN" },
  { title: "Workshop", price: "2 000 PLN" },
];

export default function Home() {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* ── Hero ── */}
      <section className="flex min-h-[calc(100vh-64px)] items-center px-4 py-16 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center rounded-full bg-[#3B82F6]/10 px-4 py-1.5 text-sm font-medium text-[#3B82F6]">
              ✨ Link-in-bio dla profesjonalistów
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-[#111827] md:text-6xl">
              Twój profesjonalny profil w 5 minut
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#6B7280]">
              Jedna strona. Wszystkie Twoje usługi. Jeden link do udostępnienia.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-[#3B82F6] px-8 text-sm font-medium text-white hover:bg-[#2563EB]"
                >
                  Dashboard →
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-up"
                    className="inline-flex h-12 items-center justify-center rounded-xl bg-[#3B82F6] px-8 text-sm font-medium text-white hover:bg-[#2563EB]"
                  >
                    Stwórz profil za darmo →
                  </Link>
                  <Link
                    href="/explore"
                    className="inline-flex h-12 items-center justify-center rounded-xl border border-gray-300 px-8 text-sm font-medium text-[#111827] hover:bg-gray-50"
                  >
                    Zobacz przykład
                  </Link>
                </>
              )}
            </div>
            <p className="mt-6 text-sm text-[#6B7280]">
              Dołącz do 1000+ specjalistów
            </p>
          </div>

          {/* Mockup */}
          <div className="flex justify-center">
            <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
              <div className="mb-4 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#3B82F6] text-2xl font-bold text-white">
                  JK
                </div>
              </div>
              <h3 className="text-center text-xl font-bold text-[#111827]">Jan Kowalski</h3>
              <p className="mt-1 text-center text-sm text-[#6B7280]">@jankowalski</p>
              <p className="mt-3 text-center text-sm text-[#6B7280]">
                Full-stack developer pomagający startupom budować produkty.
              </p>
              <div className="mt-6 space-y-2">
                {MOCK_SERVICES.map((s) => (
                  <div key={s.title} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
                    <span className="text-sm font-medium text-[#111827]">{s.title}</span>
                    <span className="text-sm font-semibold text-[#10B981]">{s.price}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-center gap-2">
                {["LinkedIn", "GitHub", "Twitter"].map((l) => (
                  <span key={l} className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-[#6B7280]">
                    {l}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex justify-center">
                <span className="inline-flex h-10 items-center rounded-xl bg-[#3B82F6] px-6 text-sm font-medium text-white">
                  Skontaktuj się
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Jak to działa ── */}
      <section className="bg-[#F9FAFB] px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-2xl font-bold text-[#111827] md:text-3xl">
            Proste jak 1-2-3
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                  {step.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[#111827]">{step.title}</h3>
                <p className="text-sm text-[#6B7280]">{step.desc}</p>
                {i < 2 && (
                  <div className="absolute right-0 top-8 hidden translate-x-1/2 text-2xl text-gray-300 md:block">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dla kogo ── */}
      <section className="bg-white px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-2xl font-bold text-[#111827] md:text-3xl">
            Stworzony dla specjalistów
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {AUDIENCES.map((a) => (
              <div key={a.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 text-3xl">{a.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-[#111827]">{a.title}</h3>
                <p className="text-sm leading-relaxed text-[#6B7280]">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Co dostajesz ── */}
      <section className="bg-[#F9FAFB] px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-2xl font-bold text-[#111827] md:text-3xl">
            Wszystko czego potrzebujesz
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES_LIST.map((f) => (
              <div key={f.text} className="flex items-center gap-3 rounded-xl bg-white px-5 py-4 shadow-sm">
                <span className="text-[#10B981]">✓</span>
                <span className="text-sm text-[#111827]">{f.text}</span>
                {f.pro && (
                  <span className="rounded-full bg-[#3B82F6]/10 px-2 py-0.5 text-xs font-medium text-[#3B82F6]">
                    Pro
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gradient-to-r from-[#3B82F6] to-[#2563EB] px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Gotowy żeby zacząć?
          </h2>
          <p className="mt-4 text-lg text-blue-200">
            Dołącz za darmo. Upgrade gdy jesteś gotowy.
          </p>
          <Link
            href={isSignedIn ? "/dashboard" : "/sign-up"}
            className="mt-8 inline-flex h-12 items-center rounded-xl bg-white px-8 text-sm font-medium text-[#3B82F6] hover:bg-gray-50"
          >
            {isSignedIn ? "Przejdź do dashboardu" : "Stwórz profil za darmo"}
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
