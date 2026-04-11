"use client";

import { useState } from "react";
import { sendContact } from "@/lib/api";
import { Spinner } from "@/components/ui/Spinner";
import { useTranslation } from "@/lib/i18n";

interface Props {
  username: string;
}

export function ContactForm({ username }: Props) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.message.length < 10) {
      setError(t("contact.minLength"));
      return;
    }
    setSending(true);
    setError("");
    try {
      await sendContact(username, form);
      setSent(true);
      setForm({ name: "", email: "", message: "" });
    } catch {
      setError(t("contact.error"));
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="animate-scale-in rounded-2xl bg-gray-50 p-8 text-center dark:bg-zinc-800/50">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981]/10 text-2xl text-[#10B981]">
          ✓
        </div>
        <h3 className="text-lg font-semibold text-[#111827] dark:text-white">{t("contact.successTitle")}</h3>
        <p className="mt-2 text-sm text-[#6B7280] dark:text-zinc-400">{t("contact.replyHint")}</p>
        <button
          onClick={() => setSent(false)}
          className="mt-4 text-sm font-medium text-[#3B82F6] hover:text-[#2563EB]"
        >
          {t("contact.successBtn")}
        </button>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-[#111827] outline-none transition-shadow focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent placeholder:text-gray-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-gray-50 p-6 dark:bg-zinc-800/50"
    >
      <h2 className="mb-5 text-lg font-semibold text-[#111827] dark:text-white">
        {t("contact.writeToMe")} 💬
      </h2>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-[#EF4444]/10 px-4 py-2.5 text-sm text-[#EF4444]">
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#111827] dark:text-zinc-200">
            {t("contact.name")} *
          </label>
          <input
            required
            placeholder={t("contact.namePlaceholder")}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#111827] dark:text-zinc-200">
            {t("contact.email")} *
          </label>
          <input
            required
            type="email"
            inputMode="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#111827] dark:text-zinc-200">
            {t("contact.message")} *
          </label>
          <textarea
            required
            minLength={10}
            placeholder={t("contact.messagePlaceholder")}
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            rows={4}
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={sending}
          className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? <Spinner className="h-5 w-5 text-white" /> : t("contact.send")}
        </button>
      </div>
    </form>
  );
}