"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";

const STEPS = [
  { icon: "👤", title: "Sign up", desc: "Create an account in 30 seconds via email or Google" },
  { icon: "✏️", title: "Fill your profile", desc: "Add bio, services, prices and social links" },
  { icon: "🔗", title: "Share your link", desc: "One link for everything: skedify.io/yourname" },
];

const AUDIENCES = [
  { icon: "💻", title: "Developers & IT", desc: "Showcase your portfolio, tech stack and services to potential clients" },
  { icon: "🎨", title: "Creatives", desc: "Designers, photographers, videographers — your portfolio always at hand" },
  { icon: "🎯", title: "Consultants & coaches", desc: "One link for your offer, booking and client contact" },
];

const FEATURES_LIST = [
  { text: "Public profile with custom URL", pro: false },
  { text: "Service list with prices", pro: false },
  { text: "Social links", pro: false },
  { text: "Contact form", pro: false },
  { text: "Meeting booking system", pro: true },
  { text: "Custom domain", pro: true },
  { text: "View analytics", pro: true },
  { text: "Unlimited services", pro: true },
];

const MOCK_SERVICES = [
  { title: "1h Consultation", price: "$150" },
  { title: "Code Review", price: "$250" },
  { title: "Workshop", price: "$800" },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Skedify",
  description: "Link-in-bio platform for professionals",
  url: "https://skedify-io.vercel.app",
  applicationCategory: "BusinessApplication",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function Home() {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0b0f]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <Header />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white px-4 py-16 md:py-24 dark:from-blue-950/20 dark:via-[#0b0b0f] dark:to-[#0b0b0f] lg:px-8">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute left-1/2 top-0 -z-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-200/40 to-violet-200/30 blur-3xl dark:from-blue-500/10 dark:to-violet-500/10" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700 ring-1 ring-blue-200/50 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800/50">
              ✨ Link-in-bio for professionals
            </span>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-[#111827] dark:text-white md:text-7xl">
              Your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                professional
              </span>{" "}
              profile in 5 minutes
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#6B7280] dark:text-zinc-400">
              One page. All your services. One link to share with the world.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="group inline-flex h-12 items-center justify-center rounded-xl bg-[#3B82F6] px-7 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-[#2563EB] hover:shadow-xl hover:shadow-blue-500/30"
                >
                  Go to dashboard
                  <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-up"
                    className="group inline-flex h-12 items-center justify-center rounded-xl bg-[#3B82F6] px-7 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-[#2563EB] hover:shadow-xl hover:shadow-blue-500/30"
                  >
                    Create free profile
                    <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                  <Link
                    href="/explore"
                    className="inline-flex h-12 items-center justify-center rounded-xl border border-gray-300 bg-white/50 px-7 text-sm font-semibold text-[#111827] backdrop-blur transition-all hover:bg-white hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-200 dark:hover:bg-zinc-900"
                  >
                    See examples <span className="ml-2">↗</span>
                  </Link>
                </>
              )}
            </div>
            <div className="mt-6 flex items-center gap-3 text-sm text-[#6B7280] dark:text-zinc-500">
              <div className="flex -space-x-2">
                {["JD", "AM", "SK", "LW"].map((i, idx) => (
                  <div
                    key={i}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white dark:border-zinc-900"
                    style={{
                      backgroundColor: ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B"][idx],
                    }}
                  >
                    {i}
                  </div>
                ))}
              </div>
              <span>Join 1000+ professionals</span>
            </div>
          </div>

          {/* Mockup */}
          <div className="flex justify-center animate-fade-in-up animate-fade-in-up-delay-2">
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 blur-2xl" />
              <div className="relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
                <div className="mb-4 flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 blur-md opacity-50" />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#7C3AED] text-2xl font-bold text-white ring-4 ring-white dark:ring-zinc-900">
                      JD
                    </div>
                  </div>
                </div>
                <h3 className="text-center text-xl font-bold text-[#111827] dark:text-white">John Doe</h3>
                <p className="mt-1 text-center text-sm text-[#6B7280] dark:text-zinc-400">@johndoe</p>
                <p className="mt-3 text-center text-sm text-[#6B7280] dark:text-zinc-400">
                  Full-stack developer helping startups build great products.
                </p>
                <div className="mt-6 space-y-2">
                  {MOCK_SERVICES.map((s) => (
                    <div
                      key={s.title}
                      className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 transition-colors hover:border-blue-200 dark:border-zinc-700 dark:hover:border-blue-500/50"
                    >
                      <span className="text-sm font-medium text-[#111827] dark:text-zinc-200">{s.title}</span>
                      <span className="text-sm font-semibold text-[#10B981]">{s.price}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-center gap-2">
                  {["LinkedIn", "GitHub", "Twitter"].map((l) => (
                    <span
                      key={l}
                      className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-[#6B7280] dark:border-zinc-700 dark:text-zinc-400"
                    >
                      {l}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex justify-center">
                  <span className="inline-flex h-10 items-center rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] px-6 text-sm font-medium text-white shadow-md">
                    Get in touch
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-[#F9FAFB] px-4 py-16 md:py-24 dark:bg-zinc-900/30 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              How it works
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#111827] dark:text-white md:text-4xl">
              As simple as 1-2-3
            </h2>
          </div>
          <div className="relative grid gap-12 md:grid-cols-3 md:gap-6">
            {/* connector line */}
            <div className="absolute left-0 right-0 top-6 hidden h-0.5 bg-gradient-to-r from-transparent via-blue-200 to-transparent dark:via-blue-800 md:block" />
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative text-center">
                <div className="relative mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-lg font-bold text-white shadow-lg shadow-blue-500/30">
                  {i + 1}
                </div>
                <div className="mb-3 text-4xl">{step.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-[#111827] dark:text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-[#6B7280] dark:text-zinc-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="bg-white px-4 py-16 md:py-24 dark:bg-[#0b0b0f] lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Who it&apos;s for
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#111827] dark:text-white md:text-4xl">
              Built for professionals
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {AUDIENCES.map((a) => (
              <div
                key={a.title}
                className="group rounded-2xl border border-gray-200 border-l-4 border-l-blue-500 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:border-l-blue-500 dark:bg-zinc-900"
              >
                <div className="mb-4 inline-flex rounded-xl bg-blue-100 p-3 text-3xl transition-transform group-hover:scale-110 dark:bg-blue-900/30">
                  {a.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[#111827] dark:text-white">{a.title}</h3>
                <p className="text-sm leading-relaxed text-[#6B7280] dark:text-zinc-400">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-[#F9FAFB] px-4 py-16 md:py-24 dark:bg-zinc-900/30 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Features
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#111827] dark:text-white md:text-4xl">
              Everything you need
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES_LIST.map((f) => (
              <div
                key={f.text}
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  ✓
                </span>
                <span className="text-sm text-[#111827] dark:text-zinc-200">{f.text}</span>
                {f.pro && (
                  <span className="ml-auto rounded-full bg-gradient-to-r from-blue-500 to-violet-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
                    Pro
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#3B82F6] via-[#2563EB] to-[#7C3AED] px-4 py-16 md:py-24 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.15),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Ready to get started?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Join for free. Upgrade when you&apos;re ready.
          </p>
          <Link
            href={isSignedIn ? "/dashboard" : "/sign-up"}
            className="mt-8 inline-flex h-12 items-center rounded-xl bg-white px-8 text-sm font-semibold text-[#3B82F6] shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
          >
            {isSignedIn ? "Go to dashboard" : "Create free profile"} →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}