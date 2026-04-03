export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-3 w-20 rounded bg-gray-200" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-gray-200" />
        <div className="h-3 w-3/4 rounded bg-gray-200" />
      </div>
    </div>
  );
}
