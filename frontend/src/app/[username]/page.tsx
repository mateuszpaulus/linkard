import { notFound } from "next/navigation";
import { getPublicProfile, type ProfileResponse } from "@/lib/api";

interface Props {
  params: Promise<{ username: string }>;
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
    <div className="flex flex-1 flex-col items-center bg-white px-6 py-16 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          {profile.avatarUrl && (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName ?? profile.username}
              className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
            />
          )}
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {profile.displayName ?? profile.username}
          </h1>
          <p className="text-sm text-zinc-500">@{profile.username}</p>
          {profile.bio && (
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              {profile.bio}
            </p>
          )}
          {profile.location && (
            <p className="mt-1 text-sm text-zinc-400">{profile.location}</p>
          )}
        </div>

        {/* Services */}
        {profile.services.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Services
            </h2>
            {profile.services.map((s) => (
              <div
                key={s.id}
                className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-white">
                      {s.title}
                    </h3>
                    {s.description && (
                      <p className="mt-1 text-sm text-zinc-500">
                        {s.description}
                      </p>
                    )}
                  </div>
                  {s.price && (
                    <span className="whitespace-nowrap text-sm font-semibold text-zinc-900 dark:text-white">
                      {s.price} {s.currency}
                      {s.priceLabel && (
                        <span className="font-normal text-zinc-400">
                          {" "}
                          {s.priceLabel}
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Links */}
        {profile.links.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Links
            </h2>
            {profile.links.map((l) => (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-lg border border-zinc-200 px-4 py-3 font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-white dark:hover:bg-zinc-900"
              >
                {l.label}
              </a>
            ))}
          </section>
        )}

        {/* Website */}
        {profile.websiteUrl && (
          <div className="text-center">
            <a
              href={profile.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-white"
            >
              {profile.websiteUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
