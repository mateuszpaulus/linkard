"use client";

import { useUser, useAuth, SignOutButton } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  getMyProfile,
  createProfile,
  updateProfile,
  getMyStats,
  getMyServices,
  addService,
  updateService,
  deleteService,
  getMyLinks,
  addLink,
  updateLink,
  deleteLink,
  getMyAvailability,
  updateMyAvailability,
  getMyBookings,
  updateBookingStatus,
  createCheckoutSession,
  getCustomerPortalUrl,
} from "@/lib/api";
import type {
  ProfileResponse,
  ServiceResponse,
  LinkResponse,
  StatsResponse,
  AvailabilityDay,
  BookingResponse,
} from "@/types";
import { ImageUpload } from "@/components/ImageUpload";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";

const USERNAME_REGEX = /^[a-z0-9-]{3,30}$/;
const BIO_MAX = 160;

const PLATFORMS = [
  { value: "linkedin", label: "LinkedIn", icon: "💼" },
  { value: "github", label: "GitHub", icon: "🐙" },
  { value: "instagram", label: "Instagram", icon: "📸" },
  { value: "twitter", label: "Twitter / X", icon: "🐦" },
  { value: "youtube", label: "YouTube", icon: "▶️" },
  { value: "tiktok", label: "TikTok", icon: "🎵" },
  { value: "other", label: "Inne", icon: "🔗" },
];

const DAY_NAMES = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];

type Tab = "profile" | "services" | "links" | "booking" | "stats" | "plan";

const NAV_ITEMS: { id: Tab; label: string; icon: string; proOnly?: boolean }[] = [
  { id: "profile", label: "Profil", icon: "👤" },
  { id: "services", label: "Usługi", icon: "🛠️" },
  { id: "links", label: "Linki", icon: "🔗" },
  { id: "booking", label: "Booking", icon: "📅", proOnly: true },
  { id: "stats", label: "Statystyki", icon: "📊", proOnly: true },
  { id: "plan", label: "Plan", icon: "💳" },
];

function hasProfile(p: ProfileResponse | null): boolean {
  return p !== null && p.username !== null && p.username !== "";
}

function getPlatformIcon(iconName: string | null): string {
  return PLATFORMS.find((p) => p.value === iconName)?.icon ?? "🔗";
}

export default function DashboardPage() {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [links, setLinks] = useState<LinkResponse[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [copied, setCopied] = useState(false);

  // Profile form
  const [form, setForm] = useState({
    username: "",
    displayName: "",
    bio: "",
    avatarUrl: "",
    location: "",
    websiteUrl: "",
  });

  // Service modal
  const [serviceModal, setServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceResponse | null>(null);
  const [serviceForm, setServiceForm] = useState({ title: "", description: "", price: "", currency: "PLN" });
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);

  // Link modal
  const [linkModal, setLinkModal] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkResponse | null>(null);
  const [linkForm, setLinkForm] = useState({ platform: "linkedin", url: "" });

  // Booking
  const [availability, setAvailability] = useState<AvailabilityDay[]>([]);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [bookingTab, setBookingTab] = useState<"upcoming" | "history">("upcoming");
  const [savingAvailability, setSavingAvailability] = useState(false);

  // Plan
  const [upgradingPlan, setUpgradingPlan] = useState(false);

  const plan = profile?.plan ?? "FREE";
  const isPro = plan === "PRO";

  const loadData = useCallback(async () => {
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
        const [s, l, st] = await Promise.all([
          getMyServices(token),
          getMyLinks(token),
          getMyStats(token),
        ]);
        setServices(s);
        setLinks(l);
        setStats(st);

        if (p.plan === "PRO") {
          try {
            const [avail, bk] = await Promise.all([
              getMyAvailability(token),
              getMyBookings(token),
            ]);
            setAvailability(avail);
            setBookings(bk);
          } catch {
            // booking features may not be set up yet
          }
        }
      }
    } catch {
      // no profile yet
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Profile handlers ──
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
    try {
      const saved = hasProfile(profile)
        ? await updateProfile(token, form)
        : await createProfile(token, form);
      setProfile(saved);
      setToast({ message: "Profil zapisany!", type: "success" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd zapisu");
    } finally {
      setSaving(false);
    }
  }

  // ── Service handlers ──
  function openAddService() {
    setEditingService(null);
    setServiceForm({ title: "", description: "", price: "", currency: "PLN" });
    setServiceModal(true);
  }

  function openEditService(s: ServiceResponse) {
    setEditingService(s);
    setServiceForm({
      title: s.title,
      description: s.description ?? "",
      price: s.price != null ? String(s.price) : "",
      currency: s.currency,
    });
    setServiceModal(true);
  }

  async function handleSaveService() {
    if (!serviceForm.title.trim()) return;
    const token = await getToken();
    if (!token) return;
    try {
      const data = {
        title: serviceForm.title,
        description: serviceForm.description || undefined,
        price: serviceForm.price ? parseFloat(serviceForm.price) : undefined,
        currency: serviceForm.currency,
      };
      if (editingService) {
        const updated = await updateService(token, editingService.id, data);
        setServices((prev) => prev.map((s) => (s.id === editingService.id ? updated : s)));
      } else {
        const created = await addService(token, data);
        setServices((prev) => [...prev, created]);
      }
      setServiceModal(false);
      setToast({ message: editingService ? "Usługa zapisana!" : "Usługa dodana!", type: "success" });
    } catch {
      setError("Błąd zapisu usługi");
    }
  }

  async function handleDeleteService(id: string) {
    const token = await getToken();
    if (!token) return;
    try {
      await deleteService(token, id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      setDeletingServiceId(null);
      setToast({ message: "Usługa usunięta", type: "success" });
    } catch {
      setError("Błąd usuwania usługi");
    }
  }

  // ── Link handlers ──
  function openAddLink() {
    setEditingLink(null);
    setLinkForm({ platform: "linkedin", url: "" });
    setLinkModal(true);
  }

  function openEditLink(l: LinkResponse) {
    setEditingLink(l);
    setLinkForm({ platform: l.iconName ?? "other", url: l.url });
    setLinkModal(true);
  }

  async function handleSaveLink() {
    if (!linkForm.url.trim()) return;
    const token = await getToken();
    if (!token) return;
    const label = PLATFORMS.find((p) => p.value === linkForm.platform)?.label ?? "Link";
    try {
      if (editingLink) {
        const updated = await updateLink(token, editingLink.id, {
          label,
          url: linkForm.url,
          iconName: linkForm.platform,
        });
        setLinks((prev) => prev.map((l) => (l.id === editingLink.id ? updated : l)));
      } else {
        const created = await addLink(token, { label, url: linkForm.url, iconName: linkForm.platform });
        setLinks((prev) => [...prev, created]);
      }
      setLinkModal(false);
      setToast({ message: editingLink ? "Link zapisany!" : "Link dodany!", type: "success" });
    } catch {
      setError("Błąd zapisu linku");
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

  // ── Booking handlers ──
  function initAvailability(): AvailabilityDay[] {
    return Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      enabled: i < 5,
      startTime: "09:00",
      endTime: "17:00",
    }));
  }

  async function handleSaveAvailability() {
    const token = await getToken();
    if (!token) return;
    setSavingAvailability(true);
    try {
      const saved = await updateMyAvailability(token, { days: availability });
      setAvailability(saved);
      setToast({ message: "Dostępność zapisana!", type: "success" });
    } catch {
      setError("Błąd zapisu dostępności");
    } finally {
      setSavingAvailability(false);
    }
  }

  async function handleBookingAction(id: string, status: "CONFIRMED" | "CANCELLED") {
    const token = await getToken();
    if (!token) return;
    try {
      const updated = await updateBookingStatus(token, id, status);
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
      setToast({ message: status === "CONFIRMED" ? "Rezerwacja potwierdzona!" : "Rezerwacja odrzucona", type: "success" });
    } catch {
      setError("Błąd aktualizacji rezerwacji");
    }
  }

  // ── Plan handlers ──
  async function handleUpgrade() {
    const token = await getToken();
    if (!token) return;
    setUpgradingPlan(true);
    try {
      const { url } = await createCheckoutSession(token);
      window.location.href = url;
    } catch {
      setError("Błąd tworzenia sesji płatności");
      setUpgradingPlan(false);
    }
  }

  async function handleManageSubscription() {
    const token = await getToken();
    if (!token) return;
    try {
      const { url } = await getCustomerPortalUrl(token);
      window.location.href = url;
    } catch {
      setError("Błąd otwarcia portalu płatności");
    }
  }

  function copyLink() {
    if (!profile?.username) return;
    navigator.clipboard.writeText(`https://linkard.io/${profile.username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const profileUrl = profile?.username ? `https://linkard.io/${profile.username}` : null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB]">
        <Spinner className="h-8 w-8 text-[#3B82F6]" />
      </div>
    );
  }

  const canAddService = isPro || services.length < 3;
  const canAddLink = isPro || links.length < 3;
  const currentAvailability = availability.length > 0 ? availability : initAvailability();

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* ── Sidebar (desktop) ── */}
      <aside className="fixed left-0 top-0 hidden h-screen w-60 flex-col border-r border-gray-200 bg-white lg:flex">
        <div className="border-b border-gray-200 px-6 py-5">
          <Link href="/" className="text-xl font-bold text-[#3B82F6]">Linkard</Link>
        </div>
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <Avatar
              src={form.avatarUrl || null}
              name={form.displayName || null}
              username={form.username || "U"}
              size={40}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#111827]">
                {form.displayName || user?.firstName || "Użytkownik"}
              </p>
              <Badge plan={plan} />
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`mb-1 flex h-11 w-full items-center gap-3 rounded-xl px-4 text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? "bg-[#3B82F6]/10 text-[#3B82F6]"
                  : "text-[#6B7280] hover:bg-gray-100"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.proOnly && !isPro && <span className="ml-auto text-xs">🔒</span>}
            </button>
          ))}
        </nav>
        <div className="border-t border-gray-200 px-3 py-4">
          <SignOutButton>
            <button className="flex h-11 w-full items-center gap-3 rounded-xl px-4 text-sm font-medium text-[#EF4444] hover:bg-red-50">
              Wyloguj
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* ── Content ── */}
      <main className="pb-24 lg:ml-60 lg:pb-8">
        {/* Mobile header */}
        <header className="border-b border-gray-200 bg-white px-4 py-4 lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-[#3B82F6]">Linkard</Link>
            <div className="flex items-center gap-2">
              <Badge plan={plan} />
              <SignOutButton>
                <button className="text-sm text-[#EF4444]">Wyloguj</button>
              </SignOutButton>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-8">
          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl bg-[#EF4444]/10 px-4 py-3 text-sm text-[#EF4444]">
              {error}
              <button onClick={() => setError("")} className="ml-2 underline">zamknij</button>
            </div>
          )}

          {/* ── PROFILE TAB ── */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-lg font-semibold text-[#111827]">
                  {hasProfile(profile) ? "Twój profil" : "Stwórz profil"}
                </h2>
                <div className="space-y-5">
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
                    <label className="mb-1.5 block text-sm font-medium text-[#111827]">Twój link</label>
                    <div className="flex items-center overflow-hidden rounded-xl border border-gray-300">
                      <span className="border-r border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-[#6B7280]">
                        linkard.io/
                      </span>
                      <input
                        placeholder="twoj-username"
                        value={form.username}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        className="h-11 flex-1 bg-transparent px-3 text-sm text-[#111827] outline-none"
                      />
                    </div>
                    {form.username && !usernameError && (
                      <p className="mt-1.5 text-xs text-[#10B981]">✓ linkard.io/{form.username}</p>
                    )}
                    {usernameError && (
                      <p className="mt-1.5 text-xs text-[#EF4444]">{usernameError}</p>
                    )}
                  </div>

                  {/* Display name */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#111827]">Imię i nazwisko</label>
                    <input
                      placeholder="np. Jan Kowalski"
                      value={form.displayName}
                      onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                      className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm text-[#111827] outline-none focus:border-[#3B82F6]"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="text-sm font-medium text-[#111827]">Bio</label>
                      <span className={`text-xs ${form.bio.length > BIO_MAX ? "text-[#EF4444]" : "text-[#6B7280]"}`}>
                        {form.bio.length}/{BIO_MAX}
                      </span>
                    </div>
                    <textarea
                      placeholder="Opowiedz ludziom o sobie..."
                      value={form.bio}
                      onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value.slice(0, BIO_MAX) }))}
                      rows={3}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#3B82F6]"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#111827]">Lokalizacja</label>
                    <input
                      placeholder="Warszawa, Polska"
                      value={form.location}
                      onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                      className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm text-[#111827] outline-none focus:border-[#3B82F6]"
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#111827]">Strona internetowa</label>
                    <input
                      placeholder="https://twojastrona.pl"
                      value={form.websiteUrl}
                      onChange={(e) => setForm((f) => ({ ...f, websiteUrl: e.target.value }))}
                      className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm text-[#111827] outline-none focus:border-[#3B82F6]"
                    />
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={saving || form.bio.length > BIO_MAX}
                    className="flex h-11 w-full items-center justify-center rounded-xl bg-[#3B82F6] text-sm font-medium text-white hover:bg-[#2563EB] disabled:opacity-50 sm:w-auto sm:px-8"
                  >
                    {saving ? <Spinner className="h-5 w-5 text-white" /> : "Zapisz profil"}
                  </button>
                </div>
              </div>

              {/* Public link */}
              {profileUrl && (
                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <h3 className="mb-3 text-sm font-medium text-[#111827]">Twój publiczny link:</h3>
                  <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <span className="flex-1 truncate text-sm text-[#3B82F6]">
                      🔗 linkard.io/{profile!.username}
                    </span>
                    <button
                      onClick={copyLink}
                      className="shrink-0 rounded-lg bg-[#3B82F6] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2563EB]"
                    >
                      {copied ? "Skopiowano! ✓" : "Kopiuj"}
                    </button>
                    <a
                      href={`/${profile!.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-[#111827] hover:bg-gray-50"
                    >
                      Otwórz
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── SERVICES TAB ── */}
          {activeTab === "services" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#111827]">
                  Moje usługi{" "}
                  <span className="text-sm font-normal text-[#6B7280]">
                    {isPro ? services.length : `${services.length}/3`}
                  </span>
                </h2>
                <button
                  onClick={openAddService}
                  disabled={!canAddService}
                  className="inline-flex h-11 items-center rounded-xl bg-[#3B82F6] px-5 text-sm font-medium text-white hover:bg-[#2563EB] disabled:opacity-50"
                  title={!canAddService ? "Upgrade do Pro dla nieograniczonych usług" : undefined}
                >
                  + Dodaj usługę
                </button>
              </div>
              {!canAddService && (
                <p className="text-sm text-[#F59E0B]">Upgrade do Pro dla nieograniczonych usług.</p>
              )}

              {services.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-gray-300 p-10 text-center">
                  <p className="text-sm text-[#6B7280]">Brak usług. Dodaj pierwszą usługę.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {services.map((s) => (
                    <div key={s.id} className="rounded-xl bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-[#111827]">{s.title}</p>
                          {s.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-[#6B7280]">{s.description}</p>
                          )}
                          {s.price != null && (
                            <span className="mt-2 inline-block text-lg font-semibold text-[#10B981]">
                              {s.price} {s.currency}
                            </span>
                          )}
                        </div>
                        <div className="ml-4 flex shrink-0 gap-2">
                          <button
                            onClick={() => openEditService(s)}
                            className="inline-flex h-9 items-center rounded-lg border border-gray-300 px-3 text-xs font-medium text-[#111827] hover:bg-gray-50"
                          >
                            Edytuj
                          </button>
                          <button
                            onClick={() => setDeletingServiceId(s.id)}
                            className="inline-flex h-9 items-center rounded-lg border border-[#EF4444]/30 px-3 text-xs font-medium text-[#EF4444] hover:bg-red-50"
                          >
                            Usuń
                          </button>
                        </div>
                      </div>
                      {deletingServiceId === s.id && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-3">
                          <span className="text-sm text-[#EF4444]">Czy na pewno?</span>
                          <button
                            onClick={() => handleDeleteService(s.id)}
                            className="rounded-lg bg-[#EF4444] px-3 py-1 text-xs font-medium text-white"
                          >
                            Tak, usuń
                          </button>
                          <button
                            onClick={() => setDeletingServiceId(null)}
                            className="text-xs text-[#6B7280] hover:text-[#111827]"
                          >
                            Anuluj
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── LINKS TAB ── */}
          {activeTab === "links" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#111827]">
                  Moje linki{" "}
                  <span className="text-sm font-normal text-[#6B7280]">
                    {isPro ? links.length : `${links.length}/3`}
                  </span>
                </h2>
                <button
                  onClick={openAddLink}
                  disabled={!canAddLink}
                  className="inline-flex h-11 items-center rounded-xl bg-[#3B82F6] px-5 text-sm font-medium text-white hover:bg-[#2563EB] disabled:opacity-50"
                >
                  + Dodaj link
                </button>
              </div>
              {!canAddLink && (
                <p className="text-sm text-[#F59E0B]">Upgrade do Pro dla nieograniczonych linków.</p>
              )}

              {links.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-gray-300 p-10 text-center">
                  <p className="text-sm text-[#6B7280]">Brak linków. Dodaj swoje profile społecznościowe.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {links.map((l) => (
                    <div key={l.id} className="flex items-center gap-4 rounded-xl bg-white px-5 py-4 shadow-sm">
                      <span className="text-xl">{getPlatformIcon(l.iconName)}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[#111827]">{l.label}</p>
                        <p className="truncate text-sm text-[#6B7280]">
                          {l.url.length > 40 ? l.url.slice(0, 40) + "..." : l.url}
                        </p>
                      </div>
                      <button
                        onClick={() => openEditLink(l)}
                        className="text-sm text-[#6B7280] hover:text-[#111827]"
                      >
                        Edytuj
                      </button>
                      <button
                        onClick={() => handleDeleteLink(l.id)}
                        className="text-sm text-[#EF4444] hover:text-red-700"
                      >
                        Usuń
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── BOOKING TAB ── */}
          {activeTab === "booking" && (
            <div className="space-y-6">
              {!isPro ? (
                <div className="rounded-xl bg-white p-12 text-center shadow-sm">
                  <div className="text-4xl">🔒</div>
                  <h2 className="mt-4 text-lg font-semibold text-[#111827]">Booking dostępny w planie Pro</h2>
                  <p className="mt-2 text-sm text-[#6B7280]">Pozwól klientom rezerwować spotkania z Tobą.</p>
                  <Link
                    href="/pricing"
                    className="mt-6 inline-flex h-11 items-center rounded-xl bg-[#3B82F6] px-6 text-sm font-medium text-white hover:bg-[#2563EB]"
                  >
                    Upgrade do Pro
                  </Link>
                </div>
              ) : (
                <>
                  {/* Availability */}
                  <div className="rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-[#111827]">Moja dostępność</h2>
                    <div className="space-y-3">
                      {currentAvailability.map((day, i) => (
                        <div key={i} className="flex items-center gap-4 rounded-lg border border-gray-200 px-4 py-3">
                          <button
                            onClick={() => {
                              const updated = [...currentAvailability];
                              updated[i] = { ...updated[i], enabled: !updated[i].enabled };
                              setAvailability(updated);
                            }}
                            className={`h-6 w-10 rounded-full transition-colors ${
                              day.enabled ? "bg-[#3B82F6]" : "bg-gray-300"
                            }`}
                          >
                            <div
                              className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                day.enabled ? "translate-x-4" : "translate-x-0.5"
                              }`}
                            />
                          </button>
                          <span className="w-28 text-sm font-medium text-[#111827]">{DAY_NAMES[i]}</span>
                          <input
                            type="time"
                            value={day.startTime}
                            disabled={!day.enabled}
                            onChange={(e) => {
                              const updated = [...currentAvailability];
                              updated[i] = { ...updated[i], startTime: e.target.value };
                              setAvailability(updated);
                            }}
                            className="h-9 rounded-lg border border-gray-300 px-2 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                          />
                          <span className="text-sm text-[#6B7280]">—</span>
                          <input
                            type="time"
                            value={day.endTime}
                            disabled={!day.enabled}
                            onChange={(e) => {
                              const updated = [...currentAvailability];
                              updated[i] = { ...updated[i], endTime: e.target.value };
                              setAvailability(updated);
                            }}
                            className="h-9 rounded-lg border border-gray-300 px-2 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleSaveAvailability}
                      disabled={savingAvailability}
                      className="mt-4 flex h-11 items-center justify-center rounded-xl bg-[#3B82F6] px-6 text-sm font-medium text-white hover:bg-[#2563EB] disabled:opacity-50"
                    >
                      {savingAvailability ? <Spinner className="h-5 w-5 text-white" /> : "Zapisz dostępność"}
                    </button>
                  </div>

                  {/* Bookings */}
                  <div className="rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-[#111827]">Rezerwacje</h2>
                    <div className="mb-4 flex gap-2">
                      <button
                        onClick={() => setBookingTab("upcoming")}
                        className={`rounded-lg px-4 py-2 text-sm font-medium ${
                          bookingTab === "upcoming"
                            ? "bg-[#3B82F6]/10 text-[#3B82F6]"
                            : "text-[#6B7280] hover:bg-gray-100"
                        }`}
                      >
                        Nadchodzące
                      </button>
                      <button
                        onClick={() => setBookingTab("history")}
                        className={`rounded-lg px-4 py-2 text-sm font-medium ${
                          bookingTab === "history"
                            ? "bg-[#3B82F6]/10 text-[#3B82F6]"
                            : "text-[#6B7280] hover:bg-gray-100"
                        }`}
                      >
                        Historia
                      </button>
                    </div>
                    {bookings.length === 0 ? (
                      <div className="py-10 text-center">
                        <div className="text-3xl">📅</div>
                        <p className="mt-2 text-sm text-[#6B7280]">Brak rezerwacji</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {bookings
                          .filter((b) =>
                            bookingTab === "upcoming"
                              ? b.status === "PENDING" || b.status === "CONFIRMED"
                              : b.status === "CANCELLED"
                          )
                          .map((b) => (
                            <div key={b.id} className="rounded-lg border border-gray-200 p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium text-[#111827]">
                                    {b.date} o {b.time}
                                  </p>
                                  <p className="mt-1 text-sm text-[#6B7280]">
                                    {b.clientName} · {b.clientEmail}
                                  </p>
                                  {b.message && (
                                    <p className="mt-1 text-sm text-[#6B7280]">&quot;{b.message}&quot;</p>
                                  )}
                                </div>
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    b.status === "PENDING"
                                      ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                                      : b.status === "CONFIRMED"
                                        ? "bg-[#10B981]/10 text-[#10B981]"
                                        : "bg-[#EF4444]/10 text-[#EF4444]"
                                  }`}
                                >
                                  {b.status}
                                </span>
                              </div>
                              {b.status === "PENDING" && (
                                <div className="mt-3 flex gap-2">
                                  <button
                                    onClick={() => handleBookingAction(b.id, "CONFIRMED")}
                                    className="inline-flex h-9 items-center rounded-lg bg-[#10B981] px-3 text-xs font-medium text-white hover:bg-green-600"
                                  >
                                    Potwierdź ✓
                                  </button>
                                  <button
                                    onClick={() => handleBookingAction(b.id, "CANCELLED")}
                                    className="inline-flex h-9 items-center rounded-lg bg-[#EF4444] px-3 text-xs font-medium text-white hover:bg-red-600"
                                  >
                                    Odrzuć ✗
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── STATS TAB ── */}
          {activeTab === "stats" && (
            <div className="space-y-6">
              {!isPro ? (
                <div className="rounded-xl bg-white p-12 text-center shadow-sm">
                  <div className="text-4xl">🔒</div>
                  <h2 className="mt-4 text-lg font-semibold text-[#111827]">Statystyki dostępne w planie Pro</h2>
                  <Link
                    href="/pricing"
                    className="mt-6 inline-flex h-11 items-center rounded-xl bg-[#3B82F6] px-6 text-sm font-medium text-white hover:bg-[#2563EB]"
                  >
                    Upgrade do Pro
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <StatCard label="Wyświetlenia profilu" value={stats?.viewCount ?? 0} sub="ostatnie 30 dni" icon="👁" />
                  <StatCard label="Usługi" value={stats?.servicesCount ?? 0} icon="🛠️" />
                  <StatCard label="Linki" value={stats?.linksCount ?? 0} icon="🔗" />
                  <StatCard label="Oczekujące rezerwacje" value={stats?.pendingBookings ?? 0} icon="📅" />
                </div>
              )}
            </div>
          )}

          {/* ── PLAN TAB ── */}
          {activeTab === "plan" && (
            <div className="space-y-6">
              {!isPro ? (
                <div className="rounded-xl bg-white p-8 shadow-sm">
                  <h2 className="text-lg font-semibold text-[#111827]">Plan Free</h2>
                  <ul className="mt-4 space-y-2 text-sm text-[#6B7280]">
                    <li>• Do 3 usług</li>
                    <li>• Do 3 linków społecznościowych</li>
                    <li>• Brak bookingu spotkań</li>
                    <li>• Brak analityk</li>
                  </ul>
                  <button
                    onClick={handleUpgrade}
                    disabled={upgradingPlan}
                    className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-[#3B82F6] text-sm font-medium text-white hover:bg-[#2563EB] disabled:opacity-50"
                  >
                    {upgradingPlan ? <Spinner className="h-5 w-5 text-white" /> : "Upgrade do Pro — $9/mies."}
                  </button>
                </div>
              ) : (
                <div className="rounded-xl bg-white p-8 shadow-sm">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-[#111827]">Plan Pro</h2>
                    <span className="rounded-full bg-[#10B981]/10 px-3 py-1 text-xs font-semibold text-[#10B981]">
                      Aktywny ✓
                    </span>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-[#6B7280]">
                    <li>✓ Nieograniczone usługi i linki</li>
                    <li>✓ Booking spotkań</li>
                    <li>✓ Analityki wyświetleń</li>
                    <li>✓ Priorytetowe wsparcie</li>
                  </ul>
                  <button
                    onClick={handleManageSubscription}
                    className="mt-6 inline-flex h-11 items-center rounded-xl border border-gray-300 px-6 text-sm font-medium text-[#111827] hover:bg-gray-50"
                  >
                    Zarządzaj subskrypcją
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── Bottom nav (mobile) ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white lg:hidden">
        <div className="flex h-16 items-center justify-around">
          {[
            { id: "profile" as Tab, icon: "👤", label: "Profil" },
            { id: "services" as Tab, icon: "🛠️", label: "Usługi" },
            { id: "links" as Tab, icon: "🔗", label: "Linki" },
            { id: "booking" as Tab, icon: "📅", label: "Booking" },
            { id: "plan" as Tab, icon: "💳", label: "Plan" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-0.5 text-xs ${
                activeTab === item.id ? "text-[#3B82F6]" : "text-[#6B7280]"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ── Service Modal ── */}
      <Modal
        open={serviceModal}
        onClose={() => setServiceModal(false)}
        title={editingService ? "Edytuj usługę" : "Dodaj usługę"}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#111827]">Tytuł *</label>
            <input
              placeholder="np. Konsultacja 1h"
              value={serviceForm.title}
              onChange={(e) => setServiceForm((f) => ({ ...f, title: e.target.value }))}
              className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm outline-none focus:border-[#3B82F6]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#111827]">Opis</label>
            <textarea
              placeholder="Opis usługi (opcjonalnie)"
              value={serviceForm.description}
              onChange={(e) => setServiceForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#3B82F6]"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-[#111827]">Cena</label>
              <input
                type="number"
                placeholder="0"
                value={serviceForm.price}
                onChange={(e) => setServiceForm((f) => ({ ...f, price: e.target.value }))}
                className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm outline-none focus:border-[#3B82F6]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#111827]">Waluta</label>
              <select
                value={serviceForm.currency}
                onChange={(e) => setServiceForm((f) => ({ ...f, currency: e.target.value }))}
                className="h-11 rounded-xl border border-gray-300 px-3 text-sm outline-none focus:border-[#3B82F6]"
              >
                <option value="PLN">PLN</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setServiceModal(false)}
              className="flex h-11 flex-1 items-center justify-center rounded-xl border border-gray-300 text-sm font-medium text-[#6B7280] hover:bg-gray-50"
            >
              Anuluj
            </button>
            <button
              onClick={handleSaveService}
              className="flex h-11 flex-1 items-center justify-center rounded-xl bg-[#3B82F6] text-sm font-medium text-white hover:bg-[#2563EB]"
            >
              Zapisz usługę
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Link Modal ── */}
      <Modal
        open={linkModal}
        onClose={() => setLinkModal(false)}
        title={editingLink ? "Edytuj link" : "Dodaj link"}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#111827]">Platforma</label>
            <select
              value={linkForm.platform}
              onChange={(e) => setLinkForm((f) => ({ ...f, platform: e.target.value }))}
              className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none focus:border-[#3B82F6]"
            >
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.icon} {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#111827]">URL *</label>
            <input
              placeholder="https://..."
              value={linkForm.url}
              onChange={(e) => setLinkForm((f) => ({ ...f, url: e.target.value }))}
              className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm outline-none focus:border-[#3B82F6]"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setLinkModal(false)}
              className="flex h-11 flex-1 items-center justify-center rounded-xl border border-gray-300 text-sm font-medium text-[#6B7280] hover:bg-gray-50"
            >
              Anuluj
            </button>
            <button
              onClick={handleSaveLink}
              className="flex h-11 flex-1 items-center justify-center rounded-xl bg-[#3B82F6] text-sm font-medium text-white hover:bg-[#2563EB]"
            >
              Zapisz
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  sub,
}: {
  label: string;
  value: number;
  icon: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-2 text-2xl">{icon}</div>
      <p className="text-3xl font-bold text-[#111827]">{value.toLocaleString()}</p>
      <p className="mt-1 text-sm text-[#6B7280]">{label}</p>
      {sub && <p className="text-xs text-[#6B7280]">{sub}</p>}
    </div>
  );
}
