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

const USERNAME_REGEX = /^[a-z0-9-]{3,30}$/;

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

  const [form, setForm] = useState({
    username: "",
    displayName: "",
    bio: "",
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
    const title = prompt("Service title:");
    if (!title) return;
    const description = prompt("Description (optional):") ?? "";
    const priceStr = prompt("Price (optional):");
    const token = await getToken();
    if (!token) return;

    try {
      const s = await addService(token, {
        title,
        description,
        price: priceStr ? parseFloat(priceStr) : undefined,
        currency: "PLN",
      });
      setServices((prev) => [...prev, s]);
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
    const label = prompt("Link label:");
    if (!label) return;
    const url = prompt("URL:");
    if (!url) return;
    const token = await getToken();
    if (!token) return;

    try {
      const l = await addLink(token, { label, url });
      setLinks((prev) => [...prev, l]);
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
        {/* Success message */}
        {successMsg && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
            {successMsg}
          </div>
        )}

        {/* Error message */}
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

        {/* Profile Section */}
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
            <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              <p>
                <span className="font-medium text-zinc-900 dark:text-white">
                  @{profile!.username}
                </span>{" "}
                {profile!.displayName && `- ${profile!.displayName}`}
              </p>
              {profile!.bio && <p>{profile!.bio}</p>}
              {profile!.location && <p>{profile!.location}</p>}
              {profile!.websiteUrl && <p>{profile!.websiteUrl}</p>}
            </div>
          )}
        </section>

        {/* Services Section */}
        {profileExists && (
          <section className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Services
              </h2>
              <button
                onClick={handleAddService}
                className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              >
                + Add
              </button>
            </div>
            {services.length === 0 ? (
              <p className="text-sm text-zinc-400">No services yet.</p>
            ) : (
              <ul className="space-y-3">
                {services.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded border border-zinc-100 px-4 py-3 dark:border-zinc-800"
                  >
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-white">
                        {s.title}
                      </p>
                      {s.description && (
                        <p className="text-sm text-zinc-500">{s.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {s.price && (
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          {s.price} {s.currency}
                          {s.priceLabel && ` ${s.priceLabel}`}
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

        {/* Links Section */}
        {profileExists && (
          <section className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Links
              </h2>
              <button
                onClick={handleAddLink}
                className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              >
                + Add
              </button>
            </div>
            {links.length === 0 ? (
              <p className="text-sm text-zinc-400">No links yet.</p>
            ) : (
              <ul className="space-y-3">
                {links.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center justify-between rounded border border-zinc-100 px-4 py-3 dark:border-zinc-800"
                  >
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-white">
                        {l.label}
                      </p>
                      <p className="text-sm text-zinc-500">{l.url}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteLink(l.id)}
                      className="text-sm text-red-500 hover:text-red-700"
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
