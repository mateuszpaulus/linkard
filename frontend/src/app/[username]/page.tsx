import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPublicProfile } from "@/lib/api";
import type { ProfileResponse } from "@/types";
import { ContactForm } from "@/components/profile/ContactForm";
import { ServiceCard } from "@/components/profile/ServiceCard";
import { LinkButton } from "@/components/profile/LinkButton";
import { Avatar } from "@/components/ui/Avatar";
import BookingWidget from "@/components/BookingWidget";

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
      title: `${title} — Skedify`,
      description: profile.bio ?? `${username}'s profile on Skedify`,
      openGraph: {
        title: `${profile.displayName ?? username} — Skedify`,
        description: profile.bio ?? `${username}'s professional profile on Skedify`,
        type: "profile",
        url: `https://skedify.io/${username}`,
        ...(profile.avatarUrl && {
          images: [{ url: profile.avatarUrl, width: 400, height: 400, alt: title }],
        }),
      },
    };
  } catch {
    return { title: "Profile not found — Skedify" };
  }
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-gray-200 dark:bg-zinc-700" />
      <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-zinc-500">
        {label}
      </span>
      <div className="h-px flex-1 bg-gray-200 dark:bg-zinc-700" />
    </div>
  );
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;

  let profile: ProfileResponse;
  try {
    profile = await getPublicProfile(username);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white px-4 py-10 dark:from-blue-950/20 dark:via-[#0b0b0f] dark:to-[#0b0b0f] sm:py-16">
      <div className="mx-auto w-full max-w-xl space-y-8">
        {/* ── Hero ── */}
        <div className="animate-fade-in-up text-center">
          <div className="mb-5 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-blue-400 to-violet-400 opacity-40 blur-md" />
              <div className="relative rounded-full ring-4 ring-white shadow-xl dark:ring-zinc-800">
                <Avatar
                  src={profile.avatarUrl}
                  name={profile.displayName}
                  username={profile.username}
                  size={96}
                />
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827] dark:text-white sm:text-3xl">
            {profile.displayName ?? profile.username}
          </h1>
          <p className="mt-1 text-sm text-[#6B7280] dark:text-zinc-400">
            @{profile.username}
          </p>
          {profile.bio && (
            <p className="mx-auto mt-4 max-w-sm leading-relaxed text-[#6B7280] dark:text-zinc-400">
              {profile.bio}
            </p>
          )}
          {(profile.location || profile.websiteUrl) && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-[#6B7280] dark:text-zinc-400">
              {profile.location && (
                <span className="flex items-center gap-1">📍 {profile.location}</span>
              )}
              {profile.websiteUrl && (
                <a
                  href={profile.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#3B82F6] hover:underline"
                >
                  🌐 {profile.websiteUrl.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          )}
        </div>

        {/* ── Social links ── */}
        {profile.links.length > 0 && (
          <section className="animate-fade-in-up animate-fade-in-up-delay-1 space-y-3">
            {profile.links.map((l) => (
              <LinkButton key={l.id} link={l} />
            ))}
          </section>
        )}

        {/* ── Services ── */}
        {profile.services.length > 0 && (
          <section className="animate-fade-in-up animate-fade-in-up-delay-2 space-y-4">
            <Divider label="What I offer" />
            <div className="space-y-3">
              {profile.services.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          </section>
        )}

        {/* ── Booking ── */}
        <div className="animate-fade-in-up animate-fade-in-up-delay-3">
          <BookingWidget username={profile.username} displayName={profile.displayName} />
        </div>

        {/* ── Contact ── */}
        <section className="animate-fade-in-up animate-fade-in-up-delay-3">
          <ContactForm username={profile.username} />
        </section>

        {/* ── Footer ── */}
        <div className="pt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-[#3B82F6] dark:text-zinc-500"
          >
            Powered by <span className="font-semibold">Skedify</span> ↗
          </Link>
        </div>
      </div>
    </div>
  );
}