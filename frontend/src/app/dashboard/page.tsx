"use client";

import { useUser, useAuth, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
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

const PLATFORMS = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "github", label: "GitHub" },
  { value: "instagram", label: "Instagram" },
  { value: "twitter", label: "Twitter / X" },
  { value: "youtube", label: "YouTube" },
  { value: "dribbble", label: "Dribbble" },
  { value: "other", label: "Other" },
];

function hasProfile(p: ProfileResponse | null): boolean {
  return p !== null && p.username !== null && p.username !== "";
}

export default function DashboardPage() {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [links, setLinks] = useState<LinkResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState("");

  // Service form
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    title: "",
    description: "",
    price: "",
    currency: "PLN",
    priceLabel: "",
  });

  // Link form
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkForm, setLinkForm] = useState({
    platform: "linkedin",
    label: "",
    url: "",
  });

  const [form, setForm] = useState({
    username: "",
    displayName: "",
    bio: "",
    avatarUrl: "",
    location: "",
    websiteUrl: "",
  });

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
        const [s, l] = await Promise.all([
          getMyServices(token),
          getMyLinks(token),
        ]);
        setServices(s);
        setLinks(l);
      }
    } catch {
      // Profile doesn't exist yet — show create form
    } finally {
      setLoading(false);
    }
  }

  function handleUsernameChange(value: string) {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setForm({ ...form, username: cleaned });
    if (cleaned && !USERNAME_REGEX.test(cleaned)) {
      setUsernameError("3-30 characters: a-z, 0-9, hyphens only");
    } else {
      setUsernameError("");
    }
  }

  async function handleSaveProfile() {
    if (!form.username || !USERNAME_REGEX.test(form.username)) {
      setUsernameError("3-30 characters: a-z, 0-9, hyphens only");
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
      setEditing(false);
      setSuccessMsg(
        `Profile saved! Your link: linkard-io.vercel.app/${saved.username}`
      );
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
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
      setError("Failed to add service");
    }
  }

  async function handleDeleteService(id: string) {
    const token = await getToken();
    if (!token) return;
    try {
      await deleteService(token, id);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setError("Failed to delete service");
    }
  }

  async function handleAddLink() {
    if (!linkForm.url.trim()) return;
    const token = await getToken();
    if (!token) return;

    const label =
      linkForm.label.trim() ||
      PLATFORMS.find((p) => p.value === linkForm.platform)?.label ||
      "Link";

    try {
      const l = await addLink(token, {
        label,
        url: linkForm.url,
        iconName: linkForm.platform,
      });
      setLinks((prev) => [...prev, l]);
      setLinkForm({ platform: "linkedin", label: "", url: "" });
      setShowLinkForm(false);
    } catch {
      setError("Failed to add link");
    }
  }

  async function handleDeleteLink(id: string) {
    const token = await getToken();
    if (!token) return;
    try {
      await deleteLink(token, id);
      setLinks((prev) => prev.filter((l) => l.id !== id));
    } catch {
      setError("Failed to delete link");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  const profileExists = hasProfile(profile);
  const showForm = editing || !profileExists;

  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-zinc-950">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
          Dashboard
        </h1>
        <div className="flex items-center gap-4">
          {profileExists && (
            <a
              href={`/${profile!.username}`}
              target="_blank"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            >
              View public profile
            </a>
          )}
          <UserButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl space-y-8 px-6 py-8">
        {successMsg && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
            {successMsg}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            {error}
            <button
              onClick={() => setError("")}
              className="ml-2 font-medium underline"
            >
              dismiss
            </button>
          </div>
        )}

        {/* ── Profile Section ── */}
        <section className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {profileExists ? "Profile" : "Create your profile"}
            </h2>
            {!showForm && (
              <button
                onClick={() => setEditing(true)}
                className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              >
                Edit
              </button>
            )}
          </div>

          {showForm ? (
            <div className="space-y-4">
              <ImageUpload
                currentUrl={form.avatarUrl || null}
                initials={
                  form.displayName
                    ? form.displayName
                        .split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : form.username
                      ? form.username.slice(0, 2).toUpperCase()
                      : "?"
                }
                onUploaded={(url) => setForm({ ...form, avatarUrl: url })}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-400">
                    linkard-io.vercel.app/
                  </span>
                  <input
                    placeholder="your-username"
                    value={form.username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    className="flex-1 rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  />
                </div>
                {usernameError && (
                  <p className="mt-1 text-xs text-red-500">{usernameError}</p>
                )}
              </div>
              <input
                placeholder="Display name (e.g. Jan Kowalski)"
                value={form.displayName}
                onChange={(e) =>
                  setForm({ ...form, displayName: e.target.value })
                }
                className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
              <textarea
                placeholder="Tell people about yourself and what you do..."
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
              <input
                placeholder="Location (e.g. Warsaw, Poland)"
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
                className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
              <input
                placeholder="Website URL (e.g. https://yoursite.com)"
                value={form.websiteUrl}
                onChange={(e) =>
                  setForm({ ...form, websiteUrl: e.target.value })
                }
                className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                {profileExists && (
                  <button
                    onClick={() => setEditing(false)}
                    className="rounded px-4 py-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-4">
                {profile!.avatarUrl ? (
                  <img
                    src={profile!.avatarUrl}
                    alt={profile!.displayName ?? profile!.username}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 text-lg font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {profile!.displayName
                      ? profile!.displayName
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : profile!.username!.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {profile!.displayName ?? `@${profile!.username}`}
                  </p>
                  <p className="text-zinc-500">@{profile!.username}</p>
                </div>
              </div>
              {profile!.bio && <p>{profile!.bio}</p>}
              {profile!.location && <p>{profile!.location}</p>}
              {profile!.websiteUrl && <p>{profile!.websiteUrl}</p>}
            </div>
          )}
        </section>

        {/* ── Services Section ── */}
        {profileExists && (
          <section className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Services
              </h2>
              {!showServiceForm && (
                <button
                  onClick={() => setShowServiceForm(true)}
                  className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                >
                  + Add service
                </button>
              )}
            </div>

            {showServiceForm && (
              <div className="mb-4 space-y-3 rounded-lg border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <input
                  placeholder="Service title *"
                  value={serviceForm.title}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, title: e.target.value })
                  }
                  className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={serviceForm.description}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, description: e.target.value })
                  }
                  rows={2}
                  className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Price"
                    value={serviceForm.price}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, price: e.target.value })
                    }
                    className="w-28 rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                  <select
                    value={serviceForm.currency}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, currency: e.target.value })
                    }
                    className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  >
                    <option value="PLN">PLN</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                  <input
                    placeholder="e.g. / hour"
                    value={serviceForm.priceLabel}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, priceLabel: e.target.value })
                    }
                    className="flex-1 rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddService}
                    className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Add service
                  </button>
                  <button
                    onClick={() => setShowServiceForm(false)}
                    className="rounded px-4 py-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {services.length === 0 && !showServiceForm ? (
              <p className="text-sm text-zinc-400">
                No services yet. Add your first service to show clients what you offer.
              </p>
            ) : (
              <ul className="space-y-3">
                {services.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-start justify-between rounded-lg border border-zinc-100 px-4 py-3 dark:border-zinc-800"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-zinc-900 dark:text-white">
                        {s.title}
                      </p>
                      {s.description && (
                        <p className="mt-0.5 text-sm text-zinc-500">
                          {s.description}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 flex shrink-0 items-center gap-3">
                      {s.price != null && (
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          {s.price} {s.currency}
                          {s.priceLabel && (
                            <span className="font-normal text-zinc-400">
                              {" "}
                              {s.priceLabel}
                            </span>
                          )}
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteService(s.id)}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* ── Links Section ── */}
        {profileExists && (
          <section className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Social Links
              </h2>
              {!showLinkForm && (
                <button
                  onClick={() => setShowLinkForm(true)}
                  className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                >
                  + Add link
                </button>
              )}
            </div>

            {showLinkForm && (
              <div className="mb-4 space-y-3 rounded-lg border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <select
                  value={linkForm.platform}
                  onChange={(e) =>
                    setLinkForm({ ...linkForm, platform: e.target.value })
                  }
                  className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Label (optional — defaults to platform name)"
                  value={linkForm.label}
                  onChange={(e) =>
                    setLinkForm({ ...linkForm, label: e.target.value })
                  }
                  className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                <input
                  placeholder="URL *"
                  value={linkForm.url}
                  onChange={(e) =>
                    setLinkForm({ ...linkForm, url: e.target.value })
                  }
                  className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddLink}
                    className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Add link
                  </button>
                  <button
                    onClick={() => setShowLinkForm(false)}
                    className="rounded px-4 py-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {links.length === 0 && !showLinkForm ? (
              <p className="text-sm text-zinc-400">
                No links yet. Add your social profiles so people can find you.
              </p>
            ) : (
              <ul className="space-y-3">
                {links.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-3 dark:border-zinc-800"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {(l.iconName ?? l.label).slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-zinc-900 dark:text-white">
                          {l.label}
                        </p>
                        <p className="truncate text-sm text-zinc-500">
                          {l.url}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteLink(l.id)}
                      className="ml-4 shrink-0 text-sm text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
