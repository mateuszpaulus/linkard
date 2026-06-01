import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPublicProfile, getPublicAvailability } from "@/lib/api";
import type { ProfileResponse } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { FadeInUp } from "@/components/ui/FadeInUp";
import BookingWidget from "@/components/BookingWidget";
import { getServerT } from "@/lib/i18n-server";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const { t } = await getServerT();
  try {
    const profile = await getPublicProfile(username);
    const name = profile.displayName ?? `@${profile.username}`;
    return {
      title: `${t("bookPage.metaTitle", { name })} — Skedify`,
      description: t("bookPage.metaDesc"),
      openGraph: {
        title: t("bookPage.metaTitle", { name }),
        description: t("bookPage.metaDesc"),
        type: "website",
        url: `https://skedify.io/${username}/book`,
        ...(profile.avatarUrl && {
          images: [{ url: profile.avatarUrl, width: 400, height: 400, alt: name }],
        }),
      },
    };
  } catch {
    return { title: `${t("notFound.title")} — Skedify` };
  }
}

export default async function BookPage({ params }: Props) {
  const { username } = await params;
  const { t } = await getServerT();

  let profile: ProfileResponse;
  try {
    profile = await getPublicProfile(username);
  } catch {
    notFound();
  }

  let availability;
  try {
    availability = await getPublicAvailability(username);
  } catch {
    redirect(`/${username}`);
  }

  if (!availability.some((a) => a.isActive)) {
    redirect(`/${username}`);
  }

  const displayName = profile.displayName ?? profile.username;

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white px-4 py-8 dark:from-blue-950/20 dark:via-[#0b0b0f] dark:to-[#0b0b0f] sm:py-12"
      style={{ ["--accent" as string]: profile.themeColor ?? "#3B82F6" }}
    >
      <div className="mx-auto w-full max-w-xl space-y-6">
        <Link
          href={`/${profile.username}`}
          className="inline-flex items-center gap-1 text-sm text-[#6B7280] transition-colors hover:text-[var(--accent)] dark:text-zinc-400"
        >
          <span>←</span>
          <span className="font-medium">@{profile.username}</span>
        </Link>

        <FadeInUp className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-blue-400 to-violet-400 opacity-30 blur-md" />
              <div className="relative rounded-full ring-4 ring-white dark:ring-zinc-800">
                <Avatar
                  src={profile.avatarUrl}
                  name={profile.displayName}
                  username={profile.username}
                  size={72}
                />
              </div>
            </div>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#111827] dark:text-white sm:text-2xl">
            {t("bookPage.heading", { name: displayName })}
          </h1>
          {profile.bio && (
            <p className="mx-auto mt-2 max-w-sm text-sm text-[#6B7280] dark:text-zinc-400">
              {profile.bio}
            </p>
          )}
        </FadeInUp>

        <FadeInUp delay={0.1} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <BookingWidget username={profile.username} displayName={profile.displayName} />
        </FadeInUp>

        <div className="pt-2 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-[var(--accent)] dark:text-zinc-500"
          >
            {t("profile.poweredBy")} <span className="font-semibold">Skedify</span> ↗
          </Link>
        </div>
      </div>
    </div>
  );
}
