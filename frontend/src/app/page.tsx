"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

const STEPS = [
  {
    number: "1",
    title: "Sign up",
    description: "Create your account in 30 seconds — email or social login.",
  },
  {
    number: "2",
    title: "Build your profile",
    description:
      "Add your bio, services with pricing, and social links.",
  },
  {
    number: "3",
    title: "Share your link",
    description:
      "Get a clean URL like linkard.io/yourname and share it everywhere.",
  },
];

const AUDIENCES = [
  {
    title: "Developers & IT",
    description:
      "Show your tech stack, consulting rates, and link to GitHub, portfolio, or blog.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
  },
  {
    title: "Creatives",
    description:
      "Designers, photographers, videographers — showcase your work, rates, and booking links.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
  {
    title: "Consultants & Coaches",
    description:
      "List your sessions, packages, and let clients reach you directly.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
  },
];

const MOCK_SERVICES = [
  { title: "1h Consultation", price: "300 PLN", label: "/ hour" },
  { title: "Code Review", price: "500 PLN", label: "/ project" },
  { title: "Workshop", price: "2 000 PLN", label: "/ day" },
];

const MOCK_LINKS = ["LinkedIn", "GitHub", "Twitter"];

export default function Home() {
  const { isSignedIn } = useAuth();

  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-zinc-950">
      {/* ── Hero ── */}
      <section className="flex flex-col items-center justify-center px-6 py-24 text-center sm:py-32">
        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-6xl dark:text-white">
          Your professional profile
          <br />
          <span className="text-zinc-400">in 5 minutes</span>
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          One page. All your services. One link.
          <br className="hidden sm:block" />
          Let clients find everything they need about you.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-full bg-zinc-900 px-8 py-3.5 text-base font-medium text-white shadow-sm transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/explore"
                className="rounded-full border border-zinc-300 px-8 py-3.5 text-base font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800"
              >
                Explore profiles
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/sign-up"
                className="rounded-full bg-zinc-900 px-8 py-3.5 text-base font-medium text-white shadow-sm transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Create your profile for free
              </Link>
              <Link
                href="/explore"
                className="rounded-full border border-zinc-300 px-8 py-3.5 text-base font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800"
              >
                Explore profiles
              </Link>
            </>
          )}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-t border-zinc-100 bg-zinc-50 px-6 py-20 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-sm font-semibold uppercase tracking-widest text-zinc-400">
            How it works
          </h2>
          <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
            {STEPS.map((step) => (
              <div key={step.number} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-lg font-bold text-white dark:bg-white dark:text-zinc-900">
                  {step.number}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who is it for ── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-sm font-semibold uppercase tracking-widest text-zinc-400">
            Who is it for
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {AUDIENCES.map((a) => (
              <div
                key={a.title}
                className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="mb-4 text-zinc-400">{a.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
                  {a.title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500">
                  {a.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Example profile mockup ── */}
      <section className="border-t border-zinc-100 bg-zinc-50 px-6 py-20 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-sm font-semibold uppercase tracking-widest text-zinc-400">
            What your profile looks like
          </h2>
          <div className="mx-auto max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-4 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900 text-2xl font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                JK
              </div>
            </div>
            <h3 className="text-center text-xl font-bold text-zinc-900 dark:text-white">
              Jan Kowalski
            </h3>
            <p className="mt-0.5 text-center text-sm text-zinc-500">
              @jankowalski
            </p>
            <p className="mt-3 text-center text-sm text-zinc-600 dark:text-zinc-400">
              Full-stack developer helping startups build great products.
            </p>
            <div className="mt-6 space-y-2">
              {MOCK_SERVICES.map((s) => (
                <div
                  key={s.title}
                  className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-3 dark:border-zinc-800"
                >
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">
                    {s.title}
                  </span>
                  <span className="text-sm text-zinc-500">
                    {s.price}{" "}
                    <span className="text-zinc-400">{s.label}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center gap-2">
              {MOCK_LINKS.map((l) => (
                <span
                  key={l}
                  className="rounded-full border border-zinc-200 px-4 py-1.5 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                >
                  {l}
                </span>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <span className="rounded-full bg-zinc-900 px-6 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-900">
                Get in touch
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Ready to stand out?
        </h2>
        <p className="mt-2 text-zinc-500">
          Join professionals who already use Linkard.
        </p>
        <div className="mt-6">
          <Link
            href={isSignedIn ? "/dashboard" : "/sign-up"}
            className="inline-flex rounded-full bg-zinc-900 px-8 py-3.5 text-base font-medium text-white shadow-sm transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isSignedIn ? "Go to Dashboard" : "Get started for free"}
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-100 px-6 py-8 dark:border-zinc-800">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-lg font-bold text-zinc-900 dark:text-white">
            Linkard
          </span>
          <div className="flex gap-6 text-sm text-zinc-500">
            <Link href="/explore" className="hover:text-zinc-900 dark:hover:text-white">
              Explore
            </Link>
            <Link href="/sign-up" className="hover:text-zinc-900 dark:hover:text-white">
              Sign up
            </Link>
            <Link href="/sign-in" className="hover:text-zinc-900 dark:hover:text-white">
              Sign in
            </Link>
          </div>
          <p className="text-sm text-zinc-400">Made with ❤️ by Linkard</p>
        </div>
      </footer>
    </div>
  );
}
