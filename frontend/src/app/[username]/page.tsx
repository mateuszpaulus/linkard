import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPublicProfile } from "@/lib/api";
import type { ProfileResponse } from "@/types";
import { PlatformIcon, platformIconStyle } from "@/lib/platform-icons";
import { ContactForm } from "@/components/profile/ContactForm";
import { BookingCalendar } from "@/components/profile/BookingCalendar";
import { Avatar } from "@/components/ui/Avatar";

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
      title: `${title} — Linkard`,
      description: profile.bio ?? `Profil ${username} na Linkard`,
      openGraph: {
        title: `${profile.displayName ?? username} — Linkard`,
        description: profile.bio ?? `Profesjonalny profil ${username}`,
        type: "profile",
        url: `https://linkard.io/${username}`,
        ...(profile.avatarUrl && {
          images: [{ url: profile.avatarUrl, width: 400, height: 400, alt: title }],
        }),
      },
    };
  } catch {
    return { title: "Profil nie znaleziony — Linkard" };
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;

  let profile: ProfileResponse;
  try {
    profile = await getPublicProfile(username);
  } catch {
    notFound();
  }

  const hasBooking =
    profile.plan === "PRO" &&
    profile.availability &&
    profile.availability.some((d) => d.enabled);

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-4 py-12 sm:py-20">
      <div className="mx-auto w-full max-w-[680px] space-y-10">
        {/* ── Hero ── */}
        <div className="text-center">
          <div className="mb-5 flex justify-center">
            <Avatar
              src={profile.avatarUrl}
              name={profile.displayName}
              username={profile.username}
              size={80}
            />
          </div>
          <h1 className="text-2xl font-bold text-[#111827]">
            {profile.displayName ?? profile.username}
          </h1>
          <p className="mt-1 text-[#6B7280]">@{profile.username}</p>
          {profile.bio && (
            <p className="mx-auto mt-4 max-w-sm leading-relaxed text-[#6B7280]">
              {profile.bio}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-[#6B7280]">
            {profile.location && (
              <span className="flex items-center gap-1">
                📍 {profile.location}
              </span>
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
        </div>

        {/* ── Linki społecznościowe ── */}
        {profile.links.length > 0 && (
          <section>
            <div className="flex flex-wrap justify-center gap-3">
              {profile.links.map((l) => {
                const iconStyle = platformIconStyle(l.iconName);
                return (
                  <a
                    key={l.id}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-[#111827] shadow-sm transition-all hover:shadow-md"
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconStyle.className}`}
                      style={iconStyle.style}
                    >
                      <PlatformIcon
                        name={l.iconName}
                        fallback={l.label.slice(0, 2).toUpperCase()}
                      />
                    </span>
                    {l.label}
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Usługi ── */}
        {profile.services.length > 0 && (
          <section>
            <h2 className="mb-4 text-center text-lg font-semibold text-text">
              Co oferuję
            </h2>
            <div className="space-y-3">
              {profile.services.map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-text">{s.title}</h3>
                  {s.description && (
                    <p className="mt-1 text-sm text-subtext">{s.description}</p>
                  )}
                  {s.price != null && (
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xl font-bold text-success">
                        {s.price} {s.currency}
                        {s.priceLabel && (
                          <span className="ml-1 text-sm font-normal text-subtext">
                            {s.priceLabel}
                          </span>
                        )}
                      </span>
                      <a
                        href="#kontakt"
                        className="inline-flex h-9 items-center rounded-lg border border-primary px-4 text-sm font-medium text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white"
                      >
                        Skontaktuj się
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Booking ── */}
        {hasBooking && (
          <section>
            <BookingCalendar username={profile.username} />
          </section>
        )}

        {/* ── Kontakt ── */}
        <section id="kontakt">
          <ContactForm username={profile.username} />
        </section>

        {/* ── Footer ── */}
        <div className="border-t border-gray-200 pt-6 text-center">
          <p className="text-sm text-[#6B7280]">
            Stwórz własny profil na{" "}
            <Link href="/" className="font-semibold text-[#3B82F6] hover:underline">
              Linkard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
