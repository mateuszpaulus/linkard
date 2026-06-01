import { ImageResponse } from "next/og";
import { getPublicProfile } from "@/lib/api";

export const alt = "Skedify profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PALETTE = [
  "#3B82F6", "#7C3AED", "#DB2777", "#DC2626",
  "#D97706", "#059669", "#0891B2", "#2563EB",
];

function gradientFor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash);
  const a = PALETTE[h % PALETTE.length];
  const offset = (h >> 3) % (PALETTE.length - 1);
  const b = PALETTE[(h + offset + 1) % PALETTE.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
}

function initialsFor(name: string | null, username: string): string {
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

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  let profile;
  try {
    profile = await getPublicProfile(username);
  } catch {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #3B82F6, #7C3AED)",
            color: "white",
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: "-0.03em",
          }}
        >
          Skedify
        </div>
      ),
      { ...size }
    );
  }

  const displayName = profile.displayName ?? profile.username;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 50%, #FAF5FF 100%)",
          padding: 60,
        }}
      >
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt=""
            width={220}
            height={220}
            style={{
              borderRadius: 9999,
              objectFit: "cover",
              border: "8px solid white",
              boxShadow: "0 20px 50px rgba(59, 130, 246, 0.25)",
            }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 220,
              height: 220,
              borderRadius: 9999,
              background: gradientFor(profile.username),
              color: "white",
              fontSize: 96,
              fontWeight: 800,
              border: "8px solid white",
              boxShadow: "0 20px 50px rgba(59, 130, 246, 0.25)",
            }}
          >
            {initialsFor(profile.displayName, profile.username)}
          </div>
        )}

        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 72,
            fontWeight: 800,
            color: "#111827",
            letterSpacing: "-0.02em",
          }}
        >
          {displayName}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 8,
            fontSize: 32,
            color: "#6B7280",
          }}
        >
          @{profile.username}
        </div>

        {profile.bio && (
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 28,
              color: "#4B5563",
              textAlign: "center",
              maxWidth: 900,
              lineHeight: 1.4,
            }}
          >
            {profile.bio.length > 140 ? profile.bio.slice(0, 137) + "…" : profile.bio}
          </div>
        )}

        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 24,
            color: "#374151",
            fontWeight: 600,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "linear-gradient(135deg, #3B82F6, #7C3AED)",
              color: "white",
              fontSize: 22,
              fontWeight: 800,
            }}
          >
            S
          </div>
          skedify.io/{profile.username}
        </div>
      </div>
    ),
    { ...size }
  );
}
