import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicProfile, type ProfileResponse } from "@/lib/api";
import { PlatformIcon, platformIconStyle } from "@/lib/platform-icons";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  try {
    const profile = await getPublicProfile(username);
    const title = profile.displayName
      ? `${profile.displayName} (@${profile.username})`
      : `@${profile.username}`;
    return {
      title: `${title} | Linkard`,
      description: profile.bio ?? `Check out ${username}'s profile on Linkard`,
      openGraph: {
        title,
        description: profile.bio ?? `Professional profile of ${username}`,
        type: "profile",
        url: `https://linkard-io.vercel.app/${username}`,
        ...(profile.avatarUrl && {
          images: [{ url: profile.avatarUrl, width: 400, height: 400, alt: title }],
        }),
      },
      twitter: {
        card: profile.avatarUrl ? "summary_large_image" : "summary",
        title,
        description: profile.bio ?? `Professional profile of ${username}`,
        ...(profile.avatarUrl && { images: [profile.avatarUrl] }),
      },
    };
  } catch {
    return { title: "Profile not found | Linkard" };
  }
}

function getInitials(name: string | null, username: string): string {
  if (name) {
    return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
}

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

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;

  let profile: ProfileResponse;
  try {
    profile = await getPublicProfile(username);
  } catch {
    notFound();
  }

  const initials = getInitials(profile.displayName, profile.username);
  const avatarColor = usernameToColor(profile.username);

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-zinc-50 to-white px-4 py-12 dark:from-zinc-950 dark:to-zinc-900 sm:py-20">
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeSlideIn 0.55s ease-out both; }
        .fade-in-1 { animation-delay: 0.05s; }
        .fade-in-2 { animation-delay: 0.15s; }
        .fade-in-3 { animation-delay: 0.25s; }
        .fade-in-4 { animation-delay: 0.35s; }
      `}</style>
      <div className="w-full max-w-lg space-y-10">

        {/* ── Header ── */}
        <div className="fade-in fade-in-1 text-center">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName ?? profile.username}
              className="mx-auto mb-5 h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg dark:border-zinc-800"
            />
          ) : (
            <div
              className="mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full text-3xl font-bold text-white shadow-lg"
              style={{ backgroundColor: avatarColor }}
            >
              {initials}
            </div>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {profile.displayName ?? profile.username}
          </h1>
          <p className="mt-1 text-zinc-500">@{profile.username}</p>
          {profile.bio && (
            <p className="mx-auto mt-4 max-w-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {profile.bio}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-400">
            {profile.location && (
              <span className="flex items-center gap-1">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {profile.location}
              </span>
            )}
            {profile.websiteUrl && (
              <a
                href={profile.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 underline transition-colors hover:text-zinc-900 dark:hover:text-white"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                </svg>
                {profile.websiteUrl.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>

        {/* ── Usługi ── */}
        {profile.services.length > 0 && (
          <section className="fade-in fade-in-2">
            <h2 className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Co oferuję
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {profile.services.map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex flex-col gap-2">
                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                      {s.title}
                    </h3>
                    {s.description && (
                      <p className="text-sm leading-relaxed text-zinc-500">
                        {s.description}
                      </p>
                    )}
                    {s.price != null && (
                      <div className="mt-1">
                        <span className="inline-block rounded-lg bg-indigo-50 px-3 py-1 text-base font-bold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                          {s.price} {s.currency}
                        </span>
                        {s.priceLabel && (
                          <span className="ml-1 text-xs text-zinc-400">{s.priceLabel}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Linki społecznościowe ── */}
        {profile.links.length > 0 && (
          <section className="fade-in fade-in-3">
            <h2 className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Znajdź mnie
            </h2>
            <div className="space-y-3">
              {profile.links.map((l) => {
                const iconStyle = platformIconStyle(l.iconName);
                return (
                  <a
                    key={l.id}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-4 font-medium text-zinc-900 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconStyle.className}`}
                      style={iconStyle.style}
                    >
                      <PlatformIcon
                        name={l.iconName}
                        fallback={l.label.slice(0, 2).toUpperCase()}
                      />
                    </span>
                    <span>{l.label}</span>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="ml-auto h-4 w-4 text-zinc-400">
                      <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
                    </svg>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Kontakt ── */}
        <div className="fade-in fade-in-4 space-y-4 text-center">
          <a
            href={`mailto:?subject=Cześć ${profile.displayName ?? profile.username}!`}
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-8 py-3 font-medium text-white shadow-sm transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
              <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
            </svg>
            Skontaktuj się
          </a>

          <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <a
              href="/sign-up"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-indigo-400">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              Stwórz profil na Linkard
            </a>
          </div>
        </div>

        {/* ── Footer ── */}
        <p className="text-center text-xs text-zinc-300 dark:text-zinc-700">
          Powered by{" "}
          <a href="/" className="underline hover:text-zinc-500">
            Linkard
          </a>
        </p>
      </div>
    </div>
  );
}
