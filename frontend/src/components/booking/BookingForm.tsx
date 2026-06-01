"use client";

import { useTranslation } from "@/lib/i18n";

const MESSAGE_MAX = 300;

export interface BookingFormState {
  name: string;
  email: string;
  message: string;
}

interface Props {
  form: BookingFormState;
  setForm: (updater: (prev: BookingFormState) => BookingFormState) => void;
  submitting: boolean;
  error: string;
  onSubmit: () => void;
}

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-[var(--accent)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white";

export function BookingForm({ form, setForm, submitting, error, onSubmit }: Props) {
  const { t } = useTranslation();
  const disabled = submitting || !form.name.trim() || !form.email.trim();

  return (
    <div className="space-y-3">
      <input
        placeholder={t("booking.formName")}
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        className={inputClass}
      />
      <input
        type="email"
        placeholder={t("booking.formEmail")}
        value={form.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        className={inputClass}
      />
      <div>
        <textarea
          placeholder={t("booking.formMessage")}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value.slice(0, MESSAGE_MAX) }))}
          rows={3}
          className={inputClass}
        />
        <p className="mt-1 text-right text-xs text-zinc-400">
          {form.message.length}/{MESSAGE_MAX}
        </p>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        onClick={onSubmit}
        disabled={disabled}
        className="w-full rounded-lg bg-[var(--accent)] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-50"
      >
        {submitting ? t("booking.submitting") : t("booking.submit")}
      </button>
    </div>
  );
}
