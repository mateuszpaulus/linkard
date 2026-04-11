import Link from "next/link";

export default function ProfileNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9FAFB] px-4 dark:bg-[#0f0f0f]">
      <div className="text-center">
        <p className="text-6xl">🔍</p>
        <h1 className="mt-6 text-2xl font-bold text-[#111827] dark:text-white">
          Profile not found
        </h1>
        <p className="mt-3 max-w-sm text-[#6B7280] dark:text-zinc-400">
          This user doesn&apos;t exist or has changed their link. Check if the address is correct.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/sign-up"
            className="inline-flex h-11 items-center rounded-xl bg-[#3B82F6] px-6 text-sm font-medium text-white hover:bg-[#2563EB]"
          >
            Create your own profile
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-xl border border-gray-300 px-6 text-sm font-medium text-[#6B7280] hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
