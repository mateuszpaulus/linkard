"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Key } from "lucide-react";
import { useToast } from "@/lib/toast";

/**
 * Dev-only: copy current Clerk JWT to clipboard so it can be pasted into
 * api-requests/*.http files for backend testing.
 * Renders nothing outside of NODE_ENV=development.
 */
export function DevTokenButton() {
  const { getToken, isSignedIn } = useAuth();
  const { push } = useToast();
  const [busy, setBusy] = useState(false);

  if (process.env.NODE_ENV !== "development") return null;
  if (!isSignedIn) return null;

  async function handleClick() {
    setBusy(true);
    try {
      const token = await getToken();
      if (!token) {
        push({ message: "No active Clerk session", type: "error" });
        return;
      }
      await navigator.clipboard.writeText(token);
      push({ message: "JWT copied to clipboard (paste into *.http)", type: "info" });
    } catch (err) {
      push({
        message: `Failed to copy token: ${(err as Error).message}`,
        type: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      title="Copy Clerk JWT (dev only)"
      className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-[#6B7280] transition-colors hover:bg-amber-100 hover:text-amber-700 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-amber-900/30 dark:hover:text-amber-300"
    >
      <Key className="h-3.5 w-3.5" strokeWidth={2.5} />
      JWT
    </button>
  );
}
