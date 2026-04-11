import { PlatformIcon, platformIconStyle } from "@/lib/platform-icons";
import type { LinkResponse } from "@/types";

interface Props {
  link: LinkResponse;
}

export function LinkButton({ link }: Props) {
  const iconStyle = platformIconStyle(link.iconName);

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 text-sm font-medium text-[#111827] shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:border-blue-500/40"
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconStyle.className}`}
        style={iconStyle.style}
      >
        <PlatformIcon
          name={link.iconName}
          fallback={link.label.slice(0, 2).toUpperCase()}
        />
      </span>
      <span className="flex-1 font-medium">{link.label}</span>
      <span className="text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500 dark:text-zinc-500">
        ↗
      </span>
    </a>
  );
}