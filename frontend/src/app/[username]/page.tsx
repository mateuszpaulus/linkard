import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicProfile, type ProfileResponse } from "@/lib/api";
import { PlatformIcon } from "@/lib/platform-icons";

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
    };
  } catch {
    return { title: "Profile not found | Linkard" };
  }
}

function getInitials(name: string | null, username: string): string {
  if (name) {
    return name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
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

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-zinc-50 to-white px-4 py-12 dark:from-zinc-950 dark:to-zinc-900 sm:py-20">
      <div className="w-full max-w-lg space-y-10">
        {/* ── Header ── */}
        <div className="text-center">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName ?? profile.username}
              className="mx-auto mb-5 h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg dark:border-zinc-800"
            />
          ) : (
            <div className="mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-zinc-900 text-3xl font-bold text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900">
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

        {/* ── Services ── */}
        {profile.services.length > 0 && (
          <section>
            <h2 className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Services
            </h2>
            <div className="space-y-3">
              {profile.services.map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-zinc-900 dark:text-white">
                        {s.title}
                      </h3>
                      {s.description && (
                        <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                          {s.description}
                        </p>
                      )}
                    </div>
                    {s.price != null && (
                      <div className="shrink-0 text-right">
                        <span className="text-lg font-bold text-zinc-900 dark:text-white">
                          {s.price} {s.currency}
                        </span>
                        {s.priceLabel && (
                          <p className="text-xs text-zinc-400">{s.priceLabel}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Social Links ── */}
        {profile.links.length > 0 && (
          <section>
            <h2 className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Find me on
            </h2>
            <div className="space-y-3">
              {profile.links.map((l) => (
                <a
                  key={l.id}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-4 font-medium text-zinc-900 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
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
              ))}
            </div>
          </section>
        )}

        {/* ── Contact ── */}
        <div className="text-center">
          <a
            href={`mailto:?subject=Hi ${profile.displayName ?? profile.username}!`}
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-8 py-3 font-medium text-white shadow-sm transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
              <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
            </svg>
            Get in touch
          </a>
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
