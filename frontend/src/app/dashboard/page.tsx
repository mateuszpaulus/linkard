"use client";

import { useUser, useAuth, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getMyProfile,
  createProfile,
  updateProfile,
  getMyServices,
  addService,
  deleteService,
  getMyLinks,
  addLink,
  deleteLink,
  type ProfileResponse,
  type ServiceResponse,
  type LinkResponse,
} from "@/lib/api";
import { ImageUpload } from "@/components/ImageUpload";

const USERNAME_REGEX = /^[a-z0-9-]{3,30}$/;
const BIO_MAX = 160;

const PLATFORMS = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "github", label: "GitHub" },
  { value: "instagram", label: "Instagram" },
  { value: "twitter", label: "Twitter / X" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "dribbble", label: "Dribbble" },
  { value: "other", label: "Other" },
];

type Tab = "profile" | "services" | "links" | "preview";

function hasProfile(p: ProfileResponse | null): boolean {
  return p !== null && p.username !== null && p.username !== "";
}

export default function DashboardPage() {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [links, setLinks] = useState<LinkResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    username: "",
    displayName: "",
    bio: "",
    avatarUrl: "",
    location: "",
    websiteUrl: "",
  });

  const [serviceForm, setServiceForm] = useState({
    title: "",
    description: "",
    price: "",
    currency: "PLN",
    priceLabel: "",
  });
  const [showServiceForm, setShowServiceForm] = useState(false);

  const [linkForm, setLinkForm] = useState({ platform: "linkedin", label: "", url: "" });
  const [showLinkForm, setShowLinkForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const token = await getToken();
    if (!token) return;
    try {
      const p = await getMyProfile(token);
      setProfile(p);
      if (hasProfile(p)) {
        setForm({
          username: p.username ?? "",
          displayName: p.displayName ?? "",
          bio: p.bio ?? "",
          avatarUrl: p.avatarUrl ?? "",
          location: p.location ?? "",
          websiteUrl: p.websiteUrl ?? "",
        });
        const [s, l] = await Promise.all([getMyServices(token), getMyLinks(token)]);
        setServices(s);
        setLinks(l);
      }
    } catch {
      // no profile yet
    } finally {
      setLoading(false);
    }
  }

  function handleUsernameChange(value: string) {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setForm((f) => ({ ...f, username: cleaned }));
    if (cleaned && !USERNAME_REGEX.test(cleaned)) {
      setUsernameError("3–30 znaków: a-z, 0-9, myślniki");
    } else {
      setUsernameError("");
    }
  }

  async function handleSaveProfile() {
    if (!form.username || !USERNAME_REGEX.test(form.username)) {
      setUsernameError("3–30 znaków: a-z, 0-9, myślniki");
      return;
    }
    const token = await getToken();
    if (!token) return;
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      const saved = hasProfile(profile)
        ? await updateProfile(token, form)
        : await createProfile(token, form);
      setProfile(saved);
      setSuccessMsg("Profil zapisany!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd zapisu");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddService() {
    if (!serviceForm.title.trim()) return;
    const token = await getToken();
    if (!token) return;
    try {
      const s = await addService(token, {
        title: serviceForm.title,
        description: serviceForm.description || undefined,
        price: serviceForm.price ? parseFloat(serviceForm.price) : undefined,
        currency: serviceForm.currency,
        priceLabel: serviceForm.priceLabel || undefined,
      });
      setServices((prev) => [...prev, s]);
      setServiceForm({ title: "", description: "", price: "", currency: "PLN", priceLabel: "" });
      setShowServiceForm(false);
    } catch {
      setError("Błąd dodawania usługi");
    }
  }

  async function handleDeleteService(id: string) {
    const token = await getToken();
    if (!token) return;
    try {
      await deleteService(token, id);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setError("Błąd usuwania usługi");
    }
  }

  async function handleAddLink() {
    if (!linkForm.url.trim()) return;
    const token = await getToken();
    if (!token) return;
    const label = linkForm.label.trim() || PLATFORMS.find((p) => p.value === linkForm.platform)?.label || "Link";
    try {
      const l = await addLink(token, { label, url: linkForm.url, iconName: linkForm.platform });
      setLinks((prev) => [...prev, l]);
      setLinkForm({ platform: "linkedin", label: "", url: "" });
      setShowLinkForm(false);
    } catch {
      setError("Błąd dodawania linku");
    }
  }

  async function handleDeleteLink(id: string) {
    const token = await getToken();
    if (!token) return;
    try {
      await deleteLink(token, id);
      setLinks((prev) => prev.filter((l) => l.id !== id));
    } catch {
      setError("Błąd usuwania linku");
    }
  }

  function copyLink() {
    if (!profile?.username) return;
    navigator.clipboard.writeText(`https://linkard-io.vercel.app/${profile.username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const profileUrl = profile?.username ? `https://linkard-io.vercel.app/${profile.username}` : null;
  const profileExists = hasProfile(profile);

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "profile", label: "Profil", icon: "👤" },
    { id: "services", label: "Usługi", icon: "💼" },
    { id: "links", label: "Linki", icon: "🔗" },
    { id: "preview", label: "Podgląd", icon: "👁" },
  ];

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* ── Header ── */}
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="text-xl font-bold text-zinc-900 dark:text-white">
            Linkard
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-zinc-500 sm:block">
              {user?.primaryEmailAddress?.emailAddress}
            </span>
            <UserButton />
          </div>
        </div>
      </header>

      {/* ── Tabs ── */}
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-4xl">
          <nav className="flex">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-colors sm:px-6 ${
                  activeTab === tab.id
                    ? "border-zinc-900 text-zinc-900 dark:border-white dark:text-white"
                    : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:block">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Content ── */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        {/* Alerts */}
        {successMsg && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/50 dark:text-green-300">
            ✓ {successMsg}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
            {error}
            <button onClick={() => setError("")} className="ml-2 underline">usuń</button>
          </div>
        )}

        {/* ── TAB: Profil ── */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-white">
                {profileExists ? "Twój profil" : "Stwórz profil"}
              </h2>

              <div className="space-y-5">
                {/* Avatar */}
                <ImageUpload
                  currentUrl={form.avatarUrl || null}
                  initials={
                    form.displayName
                      ? form.displayName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
                      : form.username ? form.username.slice(0, 2).toUpperCase() : "?"
                  }
                  onUploaded={(url) => setForm((f) => ({ ...f, avatarUrl: url }))}
                />

                {/* Username */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Twój link
                  </label>
                  <div className="flex items-center overflow-hidden rounded-lg border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-800">
                    <span className="border-r border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900">
                      linkard-io.vercel.app/
                    </span>
                    <input
                      placeholder="twoj-username"
                      value={form.username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      className="flex-1 bg-transparent px-3 py-2.5 text-sm text-zinc-900 outline-none dark:text-white"
                    />
                  </div>
                  {form.username && !usernameError && (
                    <p className="mt-1.5 text-xs text-indigo-500">
                      ✓ linkard-io.vercel.app/{form.username}
                    </p>
                  )}
                  {usernameError && (
                    <p className="mt-1.5 text-xs text-red-500">{usernameError}</p>
                  )}
                </div>

                {/* Display name */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Imię i nazwisko
                  </label>
                  <input
                    placeholder="np. Jan Kowalski"
                    value={form.displayName}
                    onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>

                {/* Bio z licznikiem */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Bio</label>
                    <span className={`text-xs ${form.bio.length > BIO_MAX ? "text-red-500" : "text-zinc-400"}`}>
                      {form.bio.length}/{BIO_MAX}
                    </span>
                  </div>
                  <textarea
                    placeholder="Opowiedz ludziom o sobie i tym co robisz..."
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value.slice(0, BIO_MAX) }))}
                    rows={3}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Lokalizacja
                  </label>
                  <input
                    placeholder="np. Warszawa, Polska"
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Strona internetowa
                  </label>
                  <input
                    placeholder="https://twojastrona.pl"
                    value={form.websiteUrl}
                    onChange={(e) => setForm((f) => ({ ...f, websiteUrl: e.target.value }))}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={saving || form.bio.length > BIO_MAX}
                  className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {saving ? "Zapisuję..." : "Zapisz profil"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Usługi ── */}
        {activeTab === "services" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Usługi</h2>
              {!showServiceForm && (
                <button
                  onClick={() => setShowServiceForm(true)}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  + Dodaj usługę
                </button>
              )}
            </div>

            {showServiceForm && (
              <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-4 font-medium text-zinc-900 dark:text-white">Nowa usługa</h3>
                <div className="space-y-3">
                  <input
                    placeholder="Tytuł usługi *"
                    value={serviceForm.title}
                    onChange={(e) => setServiceForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                  <textarea
                    placeholder="Opis (opcjonalnie)"
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm((f) => ({ ...f, description: e.target.value }))}
                    rows={2}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                  <div className="flex gap-3">
                    <input
                      type="number"
                      placeholder="Cena"
                      value={serviceForm.price}
                      onChange={(e) => setServiceForm((f) => ({ ...f, price: e.target.value }))}
                      className="w-28 rounded-lg border border-zinc-300 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                    <select
                      value={serviceForm.currency}
                      onChange={(e) => setServiceForm((f) => ({ ...f, currency: e.target.value }))}
                      className="rounded-lg border border-zinc-300 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    >
                      <option value="PLN">PLN</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </select>
                    <input
                      placeholder="np. / godz."
                      value={serviceForm.priceLabel}
                      onChange={(e) => setServiceForm((f) => ({ ...f, priceLabel: e.target.value }))}
                      className="flex-1 rounded-lg border border-zinc-300 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddService}
                      className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
                    >
                      Dodaj
                    </button>
                    <button
                      onClick={() => setShowServiceForm(false)}
                      className="rounded-lg px-4 py-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                    >
                      Anuluj
                    </button>
                  </div>
                </div>
              </div>
            )}

            {services.length === 0 && !showServiceForm ? (
              <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
                <p className="text-sm text-zinc-400">Brak usług. Dodaj pierwszą usługę.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {services.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-start justify-between rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-zinc-900 dark:text-white">{s.title}</p>
                      {s.description && (
                        <p className="mt-0.5 text-sm text-zinc-500">{s.description}</p>
                      )}
                      {s.price != null && (
                        <span className="mt-2 inline-block rounded-lg bg-indigo-50 px-2.5 py-0.5 text-sm font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                          {s.price} {s.currency}
                          {s.priceLabel && <span className="ml-1 font-normal text-indigo-400">{s.priceLabel}</span>}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteService(s.id)}
                      className="ml-4 shrink-0 text-sm text-red-500 hover:text-red-700"
                    >
                      Usuń
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Linki ── */}
        {activeTab === "links" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Linki społecznościowe</h2>
              {!showLinkForm && (
                <button
                  onClick={() => setShowLinkForm(true)}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  + Dodaj link
                </button>
              )}
            </div>

            {showLinkForm && (
              <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-4 font-medium text-zinc-900 dark:text-white">Nowy link</h3>
                <div className="space-y-3">
                  <select
                    value={linkForm.platform}
                    onChange={(e) => setLinkForm((f) => ({ ...f, platform: e.target.value }))}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                  <input
                    placeholder="Etykieta (opcjonalnie)"
                    value={linkForm.label}
                    onChange={(e) => setLinkForm((f) => ({ ...f, label: e.target.value }))}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                  <input
                    placeholder="URL *"
                    value={linkForm.url}
                    onChange={(e) => setLinkForm((f) => ({ ...f, url: e.target.value }))}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddLink}
                      className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
                    >
                      Dodaj
                    </button>
                    <button
                      onClick={() => setShowLinkForm(false)}
                      className="rounded-lg px-4 py-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                    >
                      Anuluj
                    </button>
                  </div>
                </div>
              </div>
            )}

            {links.length === 0 && !showLinkForm ? (
              <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
                <p className="text-sm text-zinc-400">Brak linków. Dodaj swoje profile społecznościowe.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {links.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-zinc-900 dark:text-white">{l.label}</p>
                      <p className="truncate text-sm text-zinc-400">{l.url}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteLink(l.id)}
                      className="ml-4 shrink-0 text-sm text-red-500 hover:text-red-700"
                    >
                      Usuń
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Podgląd ── */}
        {activeTab === "preview" && (
          <div className="space-y-6">
            {profileExists && profileUrl ? (
              <>
                <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                  <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                    Twój link
                  </h2>
                  <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
                    <span className="flex-1 truncate text-sm text-zinc-600 dark:text-zinc-300">
                      {profileUrl}
                    </span>
                    <button
                      onClick={copyLink}
                      className="shrink-0 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
                    >
                      {copied ? "✓ Skopiowano!" : "Kopiuj"}
                    </button>
                  </div>
                  <div className="mt-3 flex gap-3">
                    <a
                      href={`/${profile!.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                    >
                      Otwórz profil
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-100 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                    <span className="ml-2 text-xs text-zinc-400">{profileUrl}</span>
                  </div>
                  <iframe
                    src={`/${profile!.username}`}
                    className="h-[600px] w-full bg-white"
                    title="Podgląd profilu"
                  />
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
                <p className="text-zinc-500">Najpierw zapisz profil z nazwą użytkownika.</p>
                <button
                  onClick={() => setActiveTab("profile")}
                  className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  Przejdź do Profilu →
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
