import Link from "next/link";

export default function ProfileNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-zinc-50 to-white px-6 dark:from-zinc-950 dark:to-zinc-900">
      <div className="text-center">
        <p className="text-6xl">🔍</p>
        <h1 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-white">
          Nie znaleziono profilu
        </h1>
        <p className="mt-3 max-w-sm text-zinc-500 dark:text-zinc-400">
          Ten użytkownik nie istnieje lub zmienił swój link. Sprawdź czy adres jest poprawny.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/sign-up"
            className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Stwórz własny profil
          </Link>
          <Link
            href="/"
            className="rounded-full border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Wróć do strony głównej
          </Link>
        </div>
      </div>
    </div>
  );
}
