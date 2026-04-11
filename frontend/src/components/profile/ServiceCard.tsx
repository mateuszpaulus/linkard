import type { ServiceResponse } from "@/types";

interface Props {
  service: ServiceResponse;
}

export function ServiceCard({ service }: Props) {
  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-blue-500/40">
      <h3 className="text-lg font-semibold text-[#111827] dark:text-white">{service.title}</h3>
      {service.description && (
        <p className="mt-1 text-sm italic leading-relaxed text-[#6B7280] dark:text-zinc-400">
          {service.description}
        </p>
      )}
      {service.price != null && (
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-2xl font-bold text-[#10B981]">{service.price}</span>
          <span className="text-sm text-gray-400 dark:text-zinc-500">{service.currency}</span>
          {service.priceLabel && (
            <span className="ml-1 text-sm font-normal text-[#6B7280] dark:text-zinc-400">
              · {service.priceLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}