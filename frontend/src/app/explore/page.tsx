"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getPublicProfiles } from "@/lib/api";
import type { ProfileSummaryResponse } from "@/types";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { Spinner } from "@/components/ui/Spinner";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { useTranslation } from "@/lib/i18n";

export default function ExplorePage() {
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState<ProfileSummaryResponse[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadProfiles(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce search input → search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(searchInput), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  const filtered = useMemo(() => {
    if (!search.trim()) return profiles;
    const q = search.toLowerCase();
    return profiles.filter(
      (p) =>
        p.displayName?.toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q) ||
        p.bio?.toLowerCase().includes(q)
    );
  }, [search, profiles]);

  async function loadProfiles(p: number, reset: boolean) {
    if (reset) setLoading(true);
    else setLoadingMore(true);
    try {
      const data = await getPublicProfiles(p, 12);
      if (reset) setProfiles(data.content);
      else setProfiles((prev) => [...prev, ...data.content]);
      setHasMore(!data.last);
      setPage(p);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  function serviceLabel(count: number): string {
    if (count === 1) return `${count} ${t("explore.service")}`;
    return `${count} ${t("explore.services_few")}`;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50/40 to-white dark:from-blue-950/10 dark:to-[#0b0b0f]">
      <Header />

      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 lg:px-8">
        <div className="mb-10 animate-fade-in-up text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            🌐 {t("explore.subtitle")}
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[#111827] dark:text-white md:text-5xl">
            {t("explore.title")}
          </h1>
        </div>

        <div className="mx-auto mb-10 max-w-md animate-fade-in-up animate-fade-in-up-delay-1">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder={t("explore.searchPlaceholder")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-11 pr-10 text-sm text-[#111827] shadow-sm outline-none transition-shadow focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
            {searchInput && (
              <button
                aria-label="Clear search"
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
            <div className="mb-4 text-5xl">🔍</div>
            <p className="text-lg font-semibold text-[#111827] dark:text-white">
              {search
                ? t("explore.noResultsFor") ?? `No profiles found for "${search}"`
                : t("explore.empty")}
            </p>
            {search && (
              <button
                onClick={() => setSearchInput("")}
                className="mt-4 inline-flex h-10 items-center rounded-xl bg-[#3B82F6] px-5 text-sm font-medium text-white hover:bg-[#2563EB]"
              >
                {t("common.clear") ?? "Clear"}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <ProfileCard
                  key={p.id}
                  profile={p}
                  serviceLabel={serviceLabel(p.servicesCount)}
                  viewProfileLabel={t("explore.viewProfile")}
                />
              ))}
            </div>

            {hasMore && !search && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => loadProfiles(page + 1, false)}
                  disabled={loadingMore}
                  className="inline-flex h-11 items-center rounded-xl border border-gray-300 bg-white px-8 text-sm font-medium text-[#111827] shadow-sm transition-all hover:bg-gray-50 hover:shadow-md disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {loadingMore ? <Spinner className="mr-2 h-4 w-4 text-[#6B7280]" /> : null}
                  {loadingMore ? t("explore.loading") : t("explore.loadMore")}
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