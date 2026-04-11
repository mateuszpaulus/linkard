"use client";

import { useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "@/lib/i18n";
import type { LinkResponse } from "@/types";

interface Props {
  links: LinkResponse[];
  isPro: boolean;
  onCreateOrUpdate: (
    id: string | null,
    data: { label: string; url: string; iconName: string }
  ) => Promise<LinkResponse>;
  onRemove: (id: string) => Promise<void>;
  onToast: (msg: { message: string; type: "success" | "error" }) => void;
}

const PLATFORMS = [
  { value: "linkedin", label: "LinkedIn", icon: "💼", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  { value: "github", label: "GitHub", icon: "🐙", color: "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300" },
  { value: "instagram", label: "Instagram", icon: "📸", color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300" },
  { value: "twitter", label: "Twitter / X", icon: "🐦", color: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300" },
  { value: "youtube", label: "YouTube", icon: "▶️", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
  { value: "tiktok", label: "TikTok", icon: "🎵", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
  { value: "other", label: "Other", icon: "🔗", color: "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300" },
];

function getPlatform(iconName: string | null) {
  return PLATFORMS.find((p) => p.value === iconName) ?? PLATFORMS[PLATFORMS.length - 1];
}

export function LinksTab({ links, isPro, onCreateOrUpdate, onRemove, onToast }: Props) {
  const { t } = useTranslation();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<LinkResponse | null>(null);
  const [form, setForm] = useState({ platform: "linkedin", url: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const canAdd = isPro || links.length < 3;

  function openAdd() {
    setEditing(null);
    setForm({ platform: "linkedin", url: "" });
    setErrors({});
    setModal(true);
  }

  function openEdit(l: LinkResponse) {
    setEditing(l);
    setForm({ platform: l.iconName ?? "other", url: l.url });
    setErrors({});
    setModal(true);
  }

  async function handleSave() {
    const e: Record<string, string> = {};
    if (!form.url.trim()) e.url = "URL is required";
    else if (!/^https?:\/\/.+/i.test(form.url)) e.url = "URL must start with https://";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    try {
      const label = PLATFORMS.find((p) => p.value === form.platform)?.label ?? "Link";
      await onCreateOrUpdate(editing?.id ?? null, {
        label,
        url: form.url,
        iconName: form.platform,
      });
      onToast({
        message: editing ? t("dashboard.links.saved") : t("dashboard.links.added"),
        type: "success",
      });
      setModal(false);
    } catch {
      onToast({ message: t("dashboard.links.saveError"), type: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await onRemove(id);
    } catch {
      onToast({ message: t("dashboard.links.deleteError"), type: "error" });
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#111827] dark:text-white">
          {t("dashboard.links.title")}{" "}
          <span className="text-sm font-normal text-[#6B7280]">
            {isPro ? links.length : `${links.length}/3`}
          </span>
        </h2>
        <button
          onClick={openAdd}
          disabled={!canAdd}
          className="inline-flex h-11 items-center rounded-xl bg-[#3B82F6] px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#2563EB] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          + {t("dashboard.links.addBtn")}
        </button>
      </div>

      {!canAdd && (
        <div className="rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-4 py-3 text-sm text-[#F59E0B]">
          {t("dashboard.links.upgradeHint")}{" "}
          <Link href="/pricing" className="font-semibold underline">
            {t("common.upgrade")}
          </Link>
        </div>
      )}

      {links.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center dark:border-zinc-700">
          <div className="mx-auto mb-4 text-6xl">🔗</div>
          <p className="text-lg font-semibold text-[#111827] dark:text-white">
            No social links yet
          </p>
          <p className="mt-2 text-sm text-[#6B7280] dark:text-zinc-400">
            Connect your social profiles so people can find you
          </p>
          <button
            onClick={openAdd}
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-[#3B82F6] px-6 text-sm font-semibold text-white hover:bg-[#2563EB]"
          >
            + {t("dashboard.links.addBtn")}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((l) => {
            const platform = getPlatform(l.iconName);
            return (
              <div
                key={l.id}
                className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${platform.color}`}
                >
                  {platform.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#111827] dark:text-white">{l.label}</p>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-sm text-[#6B7280] hover:text-[#3B82F6] dark:text-zinc-400"
                  >
                    {l.url}
                  </a>
                </div>
                <button
                  aria-label={t("common.edit")}
                  onClick={() => openEdit(l)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#6B7280] transition-colors hover:bg-gray-100 hover:text-[#111827] dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  ✏️
                </button>
                <button
                  aria-label={t("common.delete")}
                  onClick={() => handleDelete(l.id)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#EF4444] transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  🗑
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={
          editing
            ? t("dashboard.links.modal.editTitle")
            : t("dashboard.links.modal.addTitle")
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#111827] dark:text-zinc-200">
              {t("dashboard.links.modal.platform")}
            </label>
            <select
              value={form.platform}
              onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
              className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#3B82F6] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            >
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.icon} {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#111827] dark:text-zinc-200">
              {t("dashboard.links.modal.urlLabel")} *
            </label>
            <input
              inputMode="url"
              placeholder="https://..."
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
            {errors.url && <p className="mt-1 text-sm text-[#EF4444]">⚠️ {errors.url}</p>}
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
              {t("dashboard.links.modal.save")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}