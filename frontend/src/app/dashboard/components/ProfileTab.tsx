"use client";

import { useState } from "react";
import { Lock, Check } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { Spinner } from "@/components/ui/Spinner";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/lib/toast";
import { useDashboardCtx } from "../DashboardContext";

const USERNAME_REGEX = /^[a-z0-9-]{3,30}$/;
const BIO_MAX = 160;

const THEME_COLORS = [
  "#3B82F6", // blue (default)
  "#7C3AED", // violet
  "#EC4899", // pink
  "#EF4444", // red
  "#F97316", // orange
  "#F59E0B", // amber
  "#10B981", // emerald
  "#06B6D4", // cyan
];

export function ProfileTab() {
  const { t } = useTranslation();
  const { profile, isPro, saveProfile: onSave } = useDashboardCtx();
  const { push: onToast } = useToast();
  const [form, setForm] = useState({
    username: profile?.username ?? "",
    displayName: profile?.displayName ?? "",
    bio: profile?.bio ?? "",
    avatarUrl: profile?.avatarUrl ?? "",
    location: profile?.location ?? "",
    websiteUrl: profile?.websiteUrl ?? "",
    themeColor: profile?.themeColor ?? null,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.username || !USERNAME_REGEX.test(form.username)) {
      e.username = t("dashboard.profile.usernameError");
    }
    if (form.displayName && form.displayName.length < 2) {
      e.displayName = "Display name must be at least 2 characters";
    }
    if (form.bio.length > BIO_MAX) {
      e.bio = `Bio must be max ${BIO_MAX} characters`;
    }
    if (form.websiteUrl && !/^https?:\/\/.+/i.test(form.websiteUrl)) {
      e.websiteUrl = "Website must start with https://";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleUsernameChange(value: string) {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setForm((f) => ({ ...f, username: cleaned }));
    if (cleaned && !USERNAME_REGEX.test(cleaned)) {
      setErrors((e) => ({ ...e, username: t("dashboard.profile.usernameError") }));
    } else {
      setErrors((e) => {
        const { username: _u, ...rest } = e;
        void _u;
        return rest;
      });
    }
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave(form);
      onToast({ message: t("dashboard.profile.saved"), type: "success" });
    } catch (err) {
      onToast({
        message: err instanceof Error ? err.message : t("dashboard.profile.saveError"),
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  const profileUrl = profile?.username ? `https://skedify-io.vercel.app/${profile.username}` : null;

  function copyLink() {
    if (!profile?.username) return;
    navigator.clipboard.writeText(`https://skedify.io/${profile.username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const inputClass =
    "h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-[#111827] outline-none transition-shadow focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent placeholder:text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white";

  const initials = form.displayName
    ? form.displayName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : form.username
    ? form.username.slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-6 text-lg font-semibold text-[#111827] dark:text-white">
          {profile?.username ? t("dashboard.profile.title") : t("dashboard.profile.create")}
        </h2>
        <div className="space-y-5">
          <ImageUpload
            currentUrl={form.avatarUrl || null}
            initials={initials}
            onUploaded={(url) => setForm((f) => ({ ...f, avatarUrl: url }))}
          />

          {/* Username */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#111827] dark:text-zinc-200">
              {t("dashboard.profile.yourLink")}
            </label>
            <div className="flex items-center overflow-hidden rounded-xl border border-gray-300 transition-shadow focus-within:ring-2 focus-within:ring-[#3B82F6] dark:border-zinc-700">
              <span className="border-r border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-[#6B7280] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                skedify.io/
              </span>
              <input
                placeholder={t("dashboard.profile.usernamePlaceholder")}
                value={form.username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className="h-11 flex-1 bg-transparent px-3 text-sm text-[#111827] outline-none dark:text-white"
              />
            </div>
            {form.username && !errors.username ? (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-[#3B82F6]">
                🔗 skedify.io/{form.username}
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-gray-400">Only lowercase letters, numbers and hyphens (3–30 chars)</p>
            )}
            {errors.username && (
              <p className="mt-1.5 flex items-center gap-1 text-sm text-[#EF4444]">
                ⚠️ {errors.username}
              </p>
            )}
          </div>

          {/* Display name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#111827] dark:text-zinc-200">
              {t("dashboard.profile.displayName")}
            </label>
            <input
              placeholder={t("dashboard.profile.displayNamePlaceholder")}
              value={form.displayName}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              className={inputClass}
            />
            {errors.displayName && (
              <p className="mt-1.5 text-sm text-[#EF4444]">⚠️ {errors.displayName}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#111827] dark:text-zinc-200">
              {t("dashboard.profile.bio")}
            </label>
            <textarea
              placeholder={t("dashboard.profile.bioPlaceholder")}
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value.slice(0, BIO_MAX) }))}
              rows={3}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-[#111827] outline-none transition-shadow focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
            <div className="mt-1 flex justify-between text-xs">
              <span className="text-gray-400">Describe yourself in a few words</span>
              <span
                className={
                  form.bio.length > 140
                    ? "font-semibold text-[#EF4444]"
                    : "text-gray-400"
                }
              >
                {form.bio.length}/{BIO_MAX}
              </span>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#111827] dark:text-zinc-200">
              {t("dashboard.profile.location")}
            </label>
            <input
              placeholder={t("dashboard.profile.locationPlaceholder")}
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className={inputClass}
            />
          </div>

          {/* Website */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#111827] dark:text-zinc-200">
              {t("dashboard.profile.website")}
            </label>
            <input
              inputMode="url"
              placeholder="https://example.com"
              value={form.websiteUrl}
              onChange={(e) => setForm((f) => ({ ...f, websiteUrl: e.target.value }))}
              className={inputClass}
            />
            {errors.websiteUrl && (
              <p className="mt-1.5 text-sm text-[#EF4444]">⚠️ {errors.websiteUrl}</p>
            )}
          </div>

          {/* Theme color */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-sm font-medium text-[#111827] dark:text-zinc-200">
                {t("dashboard.profile.theme")}
              </label>
              {!isPro && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-[#6B7280] dark:bg-zinc-800 dark:text-zinc-400">
                  <Lock className="h-3 w-3" strokeWidth={2.5} />
                  {t("dashboard.profile.themeProLock")}
                </span>
              )}
            </div>
            <p className="mb-3 text-xs text-gray-400">{t("dashboard.profile.themeDesc")}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => isPro && setForm((f) => ({ ...f, themeColor: null }))}
                disabled={!isPro}
                aria-label={t("dashboard.profile.themeDefault")}
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white text-[10px] font-semibold text-[#6B7280] transition-all dark:bg-zinc-800 dark:text-zinc-400 ${
                  form.themeColor === null
                    ? "border-[#3B82F6] ring-2 ring-[#3B82F6]/30"
                    : "border-gray-200 dark:border-zinc-700"
                } ${!isPro ? "cursor-not-allowed opacity-50" : "hover:border-gray-400"}`}
              >
                ⊘
              </button>
              {THEME_COLORS.map((color) => {
                const selected = form.themeColor === color;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => isPro && setForm((f) => ({ ...f, themeColor: color }))}
                    disabled={!isPro}
                    aria-label={color}
                    style={{ backgroundColor: color }}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                      selected ? "border-white ring-2 ring-offset-2" : "border-white/0"
                    } ${!isPro ? "cursor-not-allowed opacity-50" : "hover:scale-110"}`}
                  >
                    {selected && <Check className="h-5 w-5 text-white" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || form.bio.length > BIO_MAX}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-[#3B82F6] text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#2563EB] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
          >
            {saving ? <Spinner className="h-5 w-5 text-white" /> : t("dashboard.profile.save")}
          </button>
        </div>
      </div>

      {/* Public link */}
      {profileUrl && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-3 text-sm font-semibold text-[#111827] dark:text-zinc-200">
            {t("dashboard.profile.publicLink")}
          </h3>
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
            <span className="flex-1 truncate text-sm font-medium text-[#3B82F6]">
              🔗 skedify.io/{profile!.username}
            </span>
            <button
              onClick={copyLink}
              className="shrink-0 rounded-lg bg-[#3B82F6] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#2563EB]"
            >
              {copied ? t("common.copied") : t("common.copy")}
            </button>
            <a
              href={`/${profile!.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-[#111827] transition-colors hover:bg-gray-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              {t("common.open")}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}