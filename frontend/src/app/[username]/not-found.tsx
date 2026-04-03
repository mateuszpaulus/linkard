import Link from "next/link";

export default function ProfileNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9FAFB] px-4">
      <div className="text-center">
        <p className="text-6xl">🔍</p>
        <h1 className="mt-6 text-2xl font-bold text-[#111827]">
          Nie znaleziono profilu
        </h1>
        <p className="mt-3 max-w-sm text-[#6B7280]">
          Ten użytkownik nie istnieje lub zmienił swój link. Sprawdź czy adres jest poprawny.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/sign-up"
            className="inline-flex h-11 items-center rounded-xl bg-[#3B82F6] px-6 text-sm font-medium text-white hover:bg-[#2563EB]"
          >
            Stwórz własny profil
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-xl border border-gray-300 px-6 text-sm font-medium text-[#6B7280] hover:bg-gray-50"
          >
            Wróć do strony głównej
          </Link>
        </div>
      </div>
    </div>
  );
}
