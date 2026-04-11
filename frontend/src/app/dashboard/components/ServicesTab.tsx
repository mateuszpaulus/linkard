"use client";

import { useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "@/lib/i18n";
import type { ServiceResponse } from "@/types";

interface Props {
  services: ServiceResponse[];
  isPro: boolean;
  onCreateOrUpdate: (
    id: string | null,
    data: { title: string; description?: string; price?: number; currency: string }
  ) => Promise<ServiceResponse>;
  onRemove: (id: string) => Promise<void>;
  onToast: (msg: { message: string; type: "success" | "error" }) => void;
}

const CURRENCIES = ["USD", "EUR", "PLN", "GBP"];

export function ServicesTab({ services, isPro, onCreateOrUpdate, onRemove, onToast }: Props) {
  const { t } = useTranslation();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<ServiceResponse | null>(null);
  const [form, setForm] = useState({ title: "", description: "", price: "", currency: "USD" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const canAdd = isPro || services.length < 3;

  function openAdd() {
    setEditing(null);
    setForm({ title: "", description: "", price: "", currency: "USD" });
    setErrors({});
    setModal(true);
  }

  function openEdit(s: ServiceResponse) {
    setEditing(s);
    setForm({
      title: s.title,
      description: s.description ?? "",
      price: s.price != null ? String(s.price) : "",
      currency: s.currency,
    });
    setErrors({});
    setModal(true);
  }

  async function handleSave() {
    const e: Record<string, string> = {};
    if (!form.title.trim() || form.title.length < 3) e.title = "Title must be at least 3 characters";
    if (form.title.length > 100) e.title = "Title is too long (max 100 chars)";
    const priceNum = form.price ? parseFloat(form.price) : NaN;
    if (form.price && (isNaN(priceNum) || priceNum < 0)) e.price = "Price must be 0 or greater";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    try {
      await onCreateOrUpdate(editing?.id ?? null, {
        title: form.title,
        description: form.description || undefined,
        price: form.price ? priceNum : undefined,
        currency: form.currency,
      });
      onToast({
        message: editing ? t("dashboard.services.saved") : t("dashboard.services.added"),
        type: "success",
      });
      setModal(false);
    } catch {
      onToast({ message: t("dashboard.services.saveError"), type: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await onRemove(id);
      setDeletingId(null);
      onToast({ message: t("dashboard.services.deleted"), type: "success" });
    } catch {
      onToast({ message: t("dashboard.services.deleteError"), type: "error" });
    }
  }

  const inputClass =
    "h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent dark:border-zinc-700 dark:bg-zinc-800 dark:text-white";

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#111827] dark:text-white">
          {t("dashboard.services.title")}{" "}
          <span className="text-sm font-normal text-[#6B7280]">
            {isPro ? services.length : `${services.length}/3`}
          </span>
        </h2>
        <button
          onClick={openAdd}
          disabled={!canAdd}
          className="inline-flex h-11 items-center rounded-xl bg-[#3B82F6] px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#2563EB] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          title={!canAdd ? t("dashboard.services.upgradeHint") : undefined}
        >
          + {t("dashboard.services.addBtn")}
        </button>
      </div>

      {!canAdd && (
        <div className="rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-4 py-3 text-sm text-[#F59E0B]">
          {t("dashboard.services.upgradeHint")}{" "}
          <Link href="/pricing" className="font-semibold underline">
            {t("common.upgrade")}
          </Link>
        </div>
      )}

      {services.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center dark:border-zinc-700">
          <div className="mx-auto mb-4 text-6xl">🛠️</div>
          <p className="text-lg font-semibold text-[#111827] dark:text-white">
            No services yet
          </p>
          <p className="mt-2 text-sm text-[#6B7280] dark:text-zinc-400">
            Add your first service to start earning
          </p>
          <button
            onClick={openAdd}
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-[#3B82F6] px-6 text-sm font-semibold text-white hover:bg-[#2563EB]"
          >
            + {t("dashboard.services.addBtn")}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((s) => (
            <div
              key={s.id}
              className="group relative rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-start gap-3">
                <div
                  className="mt-1 text-gray-300 dark:text-zinc-600"
                  title="Drag to reorder (coming soon)"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 2a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0zM7 18a2 2 0 11-4 0 2 2 0 014 0zM17 2a2 2 0 11-4 0 2 2 0 014 0zM17 10a2 2 0 11-4 0 2 2 0 014 0zM17 18a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#111827] dark:text-white">{s.title}</p>
                  {s.description && (
                    <p className="mt-1 text-sm italic text-[#6B7280] dark:text-zinc-400">
                      {s.description}
                    </p>
                  )}
                  {s.price != null && (
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-[#10B981]">{s.price}</span>
                      <span className="text-sm text-gray-400 dark:text-zinc-500">
                        {s.currency}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    aria-label={t("common.edit")}
                    onClick={() => openEdit(s)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-[#6B7280] transition-colors hover:bg-gray-100 hover:text-[#111827] dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    ✏️
                  </button>
                  <button
                    aria-label={t("common.delete")}
                    onClick={() => setDeletingId(s.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#EF4444]/30 text-[#EF4444] transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    🗑
                  </button>
                </div>
              </div>
              {deletingId === s.id && (
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-red-50 p-3 dark:bg-red-950/20">
                  <span className="text-sm text-[#EF4444]">{t("common.areYouSure")}</span>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="rounded-lg bg-[#EF4444] px-3 py-1 text-xs font-semibold text-white"
                  >
                    {t("common.yes")}
                  </button>
                  <button
                    onClick={() => setDeletingId(null)}
                    className="text-xs text-[#6B7280] hover:text-[#111827] dark:hover:text-white"
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={
          editing
            ? t("dashboard.services.modal.editTitle")
            : t("dashboard.services.modal.addTitle")
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#111827] dark:text-zinc-200">
              {t("dashboard.services.modal.titleLabel")} *
            </label>
            <input
              placeholder={t("dashboard.services.modal.titlePlaceholder")}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={inputClass}
            />
            {errors.title && <p className="mt-1 text-sm text-[#EF4444]">⚠️ {errors.title}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#111827] dark:text-zinc-200">
              {t("dashboard.services.modal.description")}
            </label>
            <textarea
              placeholder={t("dashboard.services.modal.descriptionPlaceholder")}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-[#111827] dark:text-zinc-200">
                {t("dashboard.services.modal.price")}
              </label>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.01}
                placeholder="0"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className={inputClass}
              />
              {errors.price && <p className="mt-1 text-sm text-[#EF4444]">⚠️ {errors.price}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#111827] dark:text-zinc-200">
                {t("dashboard.services.modal.currency")}
              </label>
              <select
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                className="h-11 rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#3B82F6] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setModal(false)}
              className="flex h-11 flex-1 items-center justify-center rounded-xl border border-gray-300 text-sm font-semibold text-[#6B7280] hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex h-11 flex-1 items-center justify-center rounded-xl bg-[#3B82F6] text-sm font-semibold text-white hover:bg-[#2563EB] disabled:opacity-50"
            >
              {t("dashboard.services.modal.save")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}