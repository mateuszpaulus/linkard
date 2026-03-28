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

export default function DashboardPage() {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [links, setLinks] = useState<LinkResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

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
    } catch {
      // Profile doesn't exist yet
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile() {
    const token = await getToken();
    if (!token) return;

    try {
      const saved = profile
        ? await updateProfile(token, form)
        : await createProfile(token, form);
      setProfile(saved);
      setEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save profile");
    }
  }

  async function handleAddService() {
    const title = prompt("Service title:");
    if (!title) return;
    const description = prompt("Description (optional):") ?? "";
    const priceStr = prompt("Price (optional):");
    const token = await getToken();
    if (!token) return;

    const s = await addService(token, {
      title,
      description,
      price: priceStr ? parseFloat(priceStr) : undefined,
      currency: "PLN",
    });
    setServices((prev) => [...prev, s]);
  }

  async function handleDeleteService(id: string) {
    const token = await getToken();
    if (!token) return;
    await deleteService(token, id);
    setServices((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleAddLink() {
    const label = prompt("Link label:");
    if (!label) return;
    const url = prompt("URL:");
    if (!url) return;
    const token = await getToken();
    if (!token) return;

    const l = await addLink(token, { label, url });
    setLinks((prev) => [...prev, l]);
  }

  async function handleDeleteLink(id: string) {
    const token = await getToken();
    if (!token) return;
    await deleteLink(token, id);
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-zinc-950">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
          Dashboard
        </h1>
        <div className="flex items-center gap-4">
          {profile && (
            <a
              href={`/${profile.username}`}
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
        {/* Profile Section */}
        <section className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Profile
            </h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              >
                Edit
              </button>
            )}
          </div>

          {editing || !profile ? (
            <div className="space-y-4">
              <input
                placeholder="Username (e.g. jankowalski)"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
                className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
              <input
                placeholder="Display name"
                value={form.displayName}
                onChange={(e) =>
                  setForm({ ...form, displayName: e.target.value })
                }
                className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
              <textarea
                placeholder="Bio"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
              <input
                placeholder="Location"
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
                className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
              <input
                placeholder="Website URL"
                value={form.websiteUrl}
                onChange={(e) =>
                  setForm({ ...form, websiteUrl: e.target.value })
                }
                className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Save
                </button>
                {profile && (
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
                  @{profile.username}
                </span>{" "}
                {profile.displayName && `- ${profile.displayName}`}
              </p>
              {profile.bio && <p>{profile.bio}</p>}
              {profile.location && <p>{profile.location}</p>}
              {profile.websiteUrl && <p>{profile.websiteUrl}</p>}
            </div>
          )}
        </section>

        {/* Services Section */}
        {profile && (
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
        {profile && (
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
