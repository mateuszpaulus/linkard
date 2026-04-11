import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen dark:bg-[#0f0f0f]">
      {/* Left panel - desktop only */}
      <div className="hidden w-1/2 flex-col justify-center bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] px-12 lg:flex">
        <Link href="/" className="mb-8 text-2xl font-bold text-white">
          Skedify
        </Link>
        <h1 className="text-3xl font-bold text-white">
          Create a professional profile in 5 minutes
        </h1>
        <p className="mt-4 text-lg text-blue-200">
          Join the professionals already using Skedify.
        </p>
        <ul className="mt-8 space-y-4">
          <li className="flex items-center gap-3 text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm">✓</span>
            Profile with bio, services and prices
          </li>
          <li className="flex items-center gap-3 text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm">✓</span>
            Social links in one place
          </li>
          <li className="flex items-center gap-3 text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm">✓</span>
            Contact form and meeting booking
          </li>
        </ul>
      </div>

      {/* Right panel */}
      <div className="flex w-full flex-col items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="mb-8 lg:hidden">
          <Link href="/" className="text-2xl font-bold text-[#3B82F6]">
            Skedify
          </Link>
        </div>
        <SignUp
          fallbackRedirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "w-full max-w-md",
              card: "shadow-none border border-gray-200 rounded-xl",
            },
          }}
        />
      </div>
    </div>
  );
}
