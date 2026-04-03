function usernameToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palette = [
    "#3B82F6", "#7C3AED", "#DB2777", "#DC2626",
    "#D97706", "#059669", "#0891B2", "#2563EB",
  ];
  return palette[Math.abs(hash) % palette.length];
}

function getInitials(name: string | null, fallback: string): string {
  if (name) {
    return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  }
  return fallback.slice(0, 2).toUpperCase();
}

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  username: string;
  size?: number;
  className?: string;
}

export function Avatar({ src, name, username, size = 80, className = "" }: AvatarProps) {
  const initials = getInitials(name ?? null, username);
  const color = usernameToColor(username);

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? username}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold text-white ${className}`}
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}
