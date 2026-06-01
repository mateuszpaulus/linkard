"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "@/lib/i18n";

interface Props {
  username: string;
  displayName: string | null;
}

export function ShareButton({ username, displayName }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}/${username}`);
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, [username]);

  const shareTitle = displayName ?? `@${username}`;

  async function handleShareClick() {
    if (canNativeShare) {
      try {
        await navigator.share({ title: shareTitle, url });
        return;
      } catch (err) {
        // AbortError = user cancelled — open modal as fallback
        if ((err as Error)?.name !== "AbortError") {
          setOpen(true);
        }
        return;
      }
    }
    setOpen(true);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <>
      <button
        onClick={handleShareClick}
        className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-[#111827] shadow-sm transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-[var(--accent)] dark:hover:text-[var(--accent)]"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        {t("profile.shareBtn")}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={t("profile.share.title")}>
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#6B7280] dark:text-zinc-400">
              {t("profile.share.linkLabel")}
            </label>
            <div className="flex gap-2">
              <input
                readOnly
                value={url}
                onFocus={(e) => e.target.select()}
                className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-[#111827] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              />
              <button
                onClick={copyLink}
                className="inline-flex h-10 items-center rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white transition-colors hover:bg-[#2563EB]"
              >
                {copied ? t("profile.share.copied") : t("profile.share.copy")}
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            {url && (
              <QRCodeSVG
                value={url}
                size={180}
                level="M"
                marginSize={2}
                className="rounded-lg"
              />
            )}
            <p className="text-xs text-[#6B7280] dark:text-zinc-500">
              {t("profile.share.qrHint")}
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
