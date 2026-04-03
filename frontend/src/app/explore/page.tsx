"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPublicProfiles } from "@/lib/api";
import type { ProfileSummaryResponse } from "@/types";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

export default function ExplorePage() {
  const [profiles, setProfiles] = useState<ProfileSummaryResponse[]>([]);
  const [filtered, setFiltered] = useState<ProfileSummaryResponse[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadProfiles(0, true);
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(profiles);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        profiles.filter(
          (p) =>
            (p.displayName?.toLowerCase().includes(q)) ||
            p.username.toLowerCase().includes(q) ||
            (p.bio?.toLowerCase().includes(q))
        )
      );
    }
  }, [search, profiles]);

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
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
        {/* Hero */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-[#111827] md:text-4xl">
            Odkryj specjalistów
          </h1>
          <p className="mt-3 text-[#6B7280]">
            Znajdź specjalistów i poznaj ich ofertę.
          </p>
        </div>

        {/* Search */}
        <div className="mx-auto mb-10 max-w-md">
          <input
            type="text"
            placeholder="Szukaj po nazwie lub branży..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-[#111827] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
          />
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-[#6B7280]">
            {search ? "Brak wyników wyszukiwania." : "Brak profili do wyświetlenia."}
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <Link
                  key={p.id}
                  href={`/${p.username}`}
                  className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <Avatar
                      src={p.avatarUrl}
                      name={p.displayName}
                      username={p.username}
                      size={56}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#111827] group-hover:text-[#3B82F6]">
                        {p.displayName ?? p.username}
                      </p>
                      <p className="text-sm text-[#6B7280]">@{p.username}</p>
                    </div>
                  </div>

                  {p.bio && (
                    <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-[#6B7280]">
                      {p.bio}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    {p.servicesCount > 0 && (
                      <span className="inline-flex items-center rounded-full bg-[#3B82F6]/10 px-2.5 py-1 text-xs font-medium text-[#3B82F6]">
                        💼 {p.servicesCount} {p.servicesCount === 1 ? "usługa" : p.servicesCount < 5 ? "usługi" : "usług"}
                      </span>
                    )}
                    <span className="text-xs font-medium text-[#3B82F6] group-hover:underline">
                      Zobacz profil →
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {hasMore && !search && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => loadProfiles(page + 1, false)}
                  disabled={loadingMore}
                  className="inline-flex h-11 items-center rounded-xl border border-gray-300 px-8 text-sm font-medium text-[#111827] hover:bg-gray-50 disabled:opacity-50"
                >
                  {loadingMore ? (
                    <Spinner className="mr-2 h-4 w-4 text-[#6B7280]" />
                  ) : null}
                  {loadingMore ? "Ładuję..." : "Załaduj więcej"}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
