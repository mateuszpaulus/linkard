"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

export default function Home() {
  const { isSignedIn } = useAuth();

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-white dark:bg-zinc-950">
      <main className="flex max-w-2xl flex-col items-center gap-8 px-6 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Linkard
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400">
          Your professional link-in-bio page. Share your services, links, and
          portfolio in one place.
        </p>
        <div className="flex gap-4">
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/sign-up"
                className="rounded-full bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Create your profile
              </Link>
              <Link
                href="/sign-in"
                className="rounded-full border border-zinc-300 px-6 py-3 font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
