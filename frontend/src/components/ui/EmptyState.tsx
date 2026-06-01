import type { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: "dashed" | "plain";
}

export function EmptyState({ icon, title, description, action, variant = "dashed" }: Props) {
  const container =
    variant === "dashed"
      ? "rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center dark:border-zinc-700"
      : "py-10 text-center";

  return (
    <div className={container}>
      <div className={variant === "dashed" ? "mx-auto mb-4 text-6xl" : "text-5xl"}>{icon}</div>
      <p
        className={
          variant === "dashed"
            ? "text-lg font-semibold text-[#111827] dark:text-white"
            : "mt-3 text-sm text-[#6B7280] dark:text-zinc-400"
        }
      >
        {title}
      </p>
      {description && variant === "dashed" && (
        <p className="mt-2 text-sm text-[#6B7280] dark:text-zinc-400">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
