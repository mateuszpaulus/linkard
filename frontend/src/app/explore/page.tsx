"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPublicProfiles, type ProfileSummaryResponse } from "@/lib/api";

function usernameToColor(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palette = [
    "#4f46e5", "#7c3aed", "#db2777", "#dc2626",
    "#d97706", "#059669", "#0891b2", "#2563eb",
  ];
  return palette[Math.abs(hash) % palette.length];
}

function getInitials(name: string | null, username: string): string {
  if (name) {
    return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
}

export default function ExplorePage() {
  const [profiles, setProfiles] = useState<ProfileSummaryResponse[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadProfiles(0, true);
  }, []);

  async function loadProfiles(p: number, reset: boolean) {
    if (reset) setLoading(true);
    else setLoadingMore(true);
    try {
      const data = await getPublicProfiles(p, 12);
      if (reset) {
        setProfiles(data.content);
      } else {
        setProfiles((prev) => [...prev, ...data.content]);
      }
      setHasMore(!data.last);
      setPage(p);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-xl font-bold text-zinc-900 dark:text-white">
            Linkard
          </Link>
          <Link
            href="/sign-up"
            className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Stwórz profil
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
            Odkryj profile
          </h1>
          <p className="mt-3 text-zinc-500">
            Znajdź specjalistów i poznaj ich ofertę.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="py-20 text-center text-zinc-400">
            Brak profili do wyświetlenia.
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {profiles.map((p) => (
                <Link
                  key={p.id}
                  href={`/${p.username}`}
                  className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-start gap-4">
                    {p.avatarUrl ? (
                      <img
                        src={p.avatarUrl}
                        alt={p.displayName ?? p.username}
                        className="h-14 w-14 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
                        style={{ backgroundColor: usernameToColor(p.username) }}
                      >
                        {getInitials(p.displayName, p.username)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-zinc-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                        {p.displayName ?? p.username}
                      </p>
                      <p className="text-sm text-zinc-400">@{p.username}</p>
                    </div>
                  </div>

                  {p.bio && (
                    <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-zinc-500">
                      {p.bio}
                    </p>
                  )}

                  {p.servicesCount > 0 && (
                    <div className="mt-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                        💼 {p.servicesCount} {p.servicesCount === 1 ? "usługa" : p.servicesCount < 5 ? "usługi" : "usług"}
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => loadProfiles(page + 1, false)}
                  disabled={loadingMore}
                  className="rounded-full border border-zinc-300 px-8 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {loadingMore ? "Ładuję..." : "Załaduj więcej"}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
