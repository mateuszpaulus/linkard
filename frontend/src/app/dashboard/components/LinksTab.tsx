"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown, Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/lib/toast";
import { useDashboardCtx } from "../DashboardContext";
import type { LinkResponse } from "@/types";

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

export function LinksTab() {
  const {
    links,
    isPro,
    createOrUpdateLink: onCreateOrUpdate,
    removeLink: onRemove,
    reorderLinks: onReorder,
  } = useDashboardCtx();
  const { push: onToast } = useToast();
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

  async function move(idx: number, delta: -1 | 1) {
    const target = idx + delta;
    if (target < 0 || target >= links.length) return;
    const ids = links.map((l) => l.id);
    [ids[idx], ids[target]] = [ids[target], ids[idx]];
    try {
      await onReorder(ids);
    } catch {
      onToast({ message: t("dashboard.links.saveError"), type: "error" });
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
          className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-[#3B82F6] px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#2563EB] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          {t("dashboard.links.addBtn")}
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
        <EmptyState
          icon="🔗"
          title="No social links yet"
          description="Connect your social profiles so people can find you"
          action={
            <button
              onClick={openAdd}
              className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-[#3B82F6] px-6 text-sm font-semibold text-white hover:bg-[#2563EB]"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              {t("dashboard.links.addBtn")}
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {links.map((l, idx) => {
            const platform = getPlatform(l.iconName);
            return (
              <div
                key={l.id}
                className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={idx === 0}
                    onClick={() => move(idx, -1)}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-[#6B7280] transition-colors hover:bg-gray-100 hover:text-[#111827] disabled:cursor-not-allowed disabled:opacity-25 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                  >
                    <ChevronUp className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    disabled={idx === links.length - 1}
                    onClick={() => move(idx, 1)}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-[#6B7280] transition-colors hover:bg-gray-100 hover:text-[#111827] disabled:cursor-not-allowed disabled:opacity-25 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                  >
                    <ChevronDown className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                </div>
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