interface BadgeProps {
  plan: "FREE" | "PRO";
}

export function Badge({ plan }: BadgeProps) {
  if (plan === "PRO") {
    return (
      <span className="inline-flex items-center rounded-full bg-[#3B82F6]/10 px-2.5 py-0.5 text-xs font-semibold text-[#3B82F6]">
        Pro
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-[#6B7280]">
      Free
    </span>
  );
}
