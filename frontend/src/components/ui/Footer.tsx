import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white px-4 py-8 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <span className="text-lg font-bold text-[#3B82F6]">Linkard</span>
        <div className="flex gap-6 text-sm text-[#6B7280]">
          <Link href="/pricing" className="hover:text-[#111827]">
            Cennik
          </Link>
          <Link href="/sign-in" className="hover:text-[#111827]">
            Zaloguj się
          </Link>
          <Link href="/sign-up" className="hover:text-[#111827]">
            Zarejestruj się
          </Link>
        </div>
        <p className="text-sm text-[#6B7280]">
          © 2026 Linkard · Made with ❤️
        </p>
      </div>
    </footer>
  );
}
