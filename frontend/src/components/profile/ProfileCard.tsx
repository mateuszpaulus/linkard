import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import type { ProfileSummaryResponse } from "@/types";

interface Props {
  profile: ProfileSummaryResponse;
  serviceLabel: string;
  viewProfileLabel: string;
}

export function ProfileCard({ profile, serviceLabel, viewProfileLabel }: Props) {
  return (
    <Link
      href={`/${profile.username}`}
      className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-500/40"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-50/0 to-violet-50/0 opacity-0 transition-opacity group-hover:opacity-100 dark:from-blue-950/20 dark:to-violet-950/20" />

      <div className="relative flex items-start gap-4">
        <Avatar
          src={profile.avatarUrl}
          name={profile.displayName}
          username={profile.username}
          size={56}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-[#111827] transition-colors group-hover:text-[#3B82F6] dark:text-white">
            {profile.displayName ?? profile.username}
          </p>
          <p className="truncate text-sm text-[#6B7280] dark:text-zinc-400">@{profile.username}</p>
        </div>
      </div>

      {profile.bio && (
        <p className="relative mt-4 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-[#6B7280] dark:text-zinc-400">
          {profile.bio}
        </p>
      )}

      <div className="relative mt-4 flex items-center justify-between">
        {profile.servicesCount > 0 ? (
          <span className="inline-flex items-center rounded-full bg-[#3B82F6]/10 px-2.5 py-1 text-xs font-medium text-[#3B82F6]">
            💼 {serviceLabel}
          </span>
        ) : (
          <span />
        )}
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#3B82F6] opacity-0 transition-opacity group-hover:opacity-100">
          {viewProfileLabel} →
        </span>
      </div>
    </Link>
  );
}