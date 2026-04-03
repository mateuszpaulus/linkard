"use client";

import { useState } from "react";
import { sendContact } from "@/lib/api";
import { Spinner } from "@/components/ui/Spinner";

interface Props {
  username: string;
}

export function ContactForm({ username }: Props) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.message.length < 10) {
      setError("Wiadomość musi mieć minimum 10 znaków.");
      return;
    }
    setSending(true);
    setError("");
    try {
      await sendContact(username, form);
      setSent(true);
      setForm({ name: "", email: "", message: "" });
    } catch {
      setError("Nie udało się wysłać wiadomości. Spróbuj ponownie.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981]/10 text-2xl text-[#10B981]">
          ✓
        </div>
        <h3 className="text-lg font-semibold text-[#111827]">Wiadomość wysłana!</h3>
        <p className="mt-2 text-sm text-[#6B7280]">Odpowiedź otrzymasz na podany email.</p>
        <button
          onClick={() => setSent(false)}
          className="mt-4 text-sm font-medium text-[#3B82F6] hover:text-[#2563EB]"
        >
          Wyślij kolejną
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-semibold text-[#111827]">Napisz do mnie</h2>

      {error && (
        <div className="mb-4 rounded-lg bg-[#EF4444]/10 px-4 py-2.5 text-sm text-[#EF4444]">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#111827]">Imię *</label>
          <input
            required
            placeholder="Jan Kowalski"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-[#111827] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#111827]">Email *</label>
          <input
            required
            type="email"
            placeholder="jan@example.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-[#111827] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#111827]">Wiadomość *</label>
          <textarea
            required
            minLength={10}
            placeholder="Cześć, chciałbym zapytać o..."
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            rows={4}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
          />
        </div>
        <button
          type="submit"
          disabled={sending}
          className="flex h-11 w-full items-center justify-center rounded-xl bg-[#3B82F6] text-sm font-medium text-white hover:bg-[#2563EB] disabled:opacity-50"
        >
          {sending ? <Spinner className="h-5 w-5 text-white" /> : "Wyślij wiadomość"}
        </button>
      </div>
    </form>
  );
}
