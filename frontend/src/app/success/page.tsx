"use client";

import Link from "next/link";

const FEATURES = [
  { icon: "📅", title: "Booking spotkań", desc: "Klienci mogą rezerwować terminy bezpośrednio z Twojego profilu" },
  { icon: "📊", title: "Analityki wyświetleń", desc: "Śledź kto odwiedza Twój profil i jak często" },
  { icon: "∞", title: "Nieograniczone usługi i linki", desc: "Dodawaj ile chcesz — bez limitów" },
];

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9FAFB] px-4">
      <div className="w-full max-w-lg text-center">
        {/* Animated checkmark */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#10B981]/10">
          <span className="animate-bounce text-4xl">✓</span>
        </div>

        <h1 className="text-3xl font-bold text-[#111827]">
          Witaj w Linkard Pro! 🎉
        </h1>
        <p className="mt-3 text-lg text-[#6B7280]">
          Twoje konto zostało ulepszone.
        </p>

        {/* Unlocked features */}
        <div className="mt-8 space-y-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm"
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <h3 className="font-semibold text-[#111827]">{f.title}</h3>
                  <p className="mt-1 text-sm text-[#6B7280]">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/dashboard"
          className="mt-8 inline-flex h-12 items-center rounded-xl bg-[#3B82F6] px-8 text-sm font-medium text-white hover:bg-[#2563EB]"
        >
          Przejdź do dashboardu
        </Link>

        <p className="mt-4 text-sm text-[#6B7280]">
          Potwierdzenie wysłane na Twój email.
        </p>
      </div>
    </div>
  );
}
