"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  getMyProfile,
  createProfile,
  updateProfile,
  getMyStats,
  getMyServices,
  addService,
  updateService,
  deleteService,
  reorderServices,
  getMyLinks,
  addLink,
  updateLink,
  deleteLink,
  reorderLinks,
  getMyAvailability,
  saveMyAvailability,
  getMyBookings,
  confirmBooking,
  cancelBooking,
  createCheckoutSession,
  getCustomerPortalUrl,
  sendTestEmail,
} from "@/lib/api";
import type {
  ProfileResponse,
  ServiceResponse,
  LinkResponse,
  StatsResponse,
  AvailabilitySlot,
  BookingResponse,
} from "@/types";

export const DEFAULT_AVAILABILITY: AvailabilitySlot[] = Array.from({ length: 7 }, (_, i) => ({
  dayOfWeek: i,
  startTime: "09:00",
  endTime: "17:00",
  isActive: i < 5,
}));

export function hasProfile(p: ProfileResponse | null): boolean {
  return p !== null && p.username !== null && p.username !== "";
}

export function useDashboard() {
  const { getToken } = useAuth();

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [links, setLinks] = useState<LinkResponse[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(DEFAULT_AVAILABILITY);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const plan = profile?.plan ?? "FREE";
  const isPro = plan === "PRO";

  const withToken = useCallback(
    async <T,>(fn: (token: string) => Promise<T>): Promise<T> => {
      const token = await getToken();
      if (!token) throw new Error("No token");
      return fn(token);
    },
    [getToken]
  );

  const loadData = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const p = await getMyProfile(token);
      setProfile(p);
      if (hasProfile(p)) {
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
            const [av, bk] = await Promise.all([
              getMyAvailability(token),
              getMyBookings(token),
            ]);
            if (av.length > 0) setAvailability(av);
            setBookings(bk);
          } catch {
            // booking features may not be configured yet
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

  const saveProfile = async (form: {
    username: string;
    displayName: string;
    bio: string;
    avatarUrl: string;
    location: string;
    websiteUrl: string;
    themeColor: string | null;
  }) =>
    withToken(async (token) => {
      const saved = hasProfile(profile)
        ? await updateProfile(token, form)
        : await createProfile(token, form);
      setProfile(saved);
      return saved;
    });

  const createOrUpdateService = (
    id: string | null,
    data: { title: string; description?: string; price?: number; currency: string }
  ) =>
    withToken(async (token) => {
      if (id) {
        const updated = await updateService(token, id, data);
        setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
        return updated;
      }
      const created = await addService(token, data);
      setServices((prev) => [...prev, created]);
      return created;
    });

  const removeService = (id: string) =>
    withToken(async (token) => {
      await deleteService(token, id);
      setServices((prev) => prev.filter((s) => s.id !== id));
    });

  const reorderServicesLocal = (ids: string[]) => {
    const prev = services;
    const byId = new Map(prev.map((s) => [s.id, s]));
    const next = ids.map((id) => byId.get(id)).filter((s): s is ServiceResponse => !!s);
    setServices(next);
    return withToken((token) => reorderServices(token, ids))
      .then((saved) => setServices(saved))
      .catch((err) => {
        setServices(prev);
        throw err;
      });
  };

  const createOrUpdateLink = (
    id: string | null,
    data: { label: string; url: string; iconName: string }
  ) =>
    withToken(async (token) => {
      if (id) {
        const updated = await updateLink(token, id, data);
        setLinks((prev) => prev.map((l) => (l.id === id ? updated : l)));
        return updated;
      }
      const created = await addLink(token, data);
      setLinks((prev) => [...prev, created]);
      return created;
    });

  const removeLink = (id: string) =>
    withToken(async (token) => {
      await deleteLink(token, id);
      setLinks((prev) => prev.filter((l) => l.id !== id));
    });

  const reorderLinksLocal = (ids: string[]) => {
    const prev = links;
    const byId = new Map(prev.map((l) => [l.id, l]));
    const next = ids.map((id) => byId.get(id)).filter((l): l is LinkResponse => !!l);
    setLinks(next);
    return withToken((token) => reorderLinks(token, ids))
      .then((saved) => setLinks(saved))
      .catch((err) => {
        setLinks(prev);
        throw err;
      });
  };

  const saveAvailability = (slots: AvailabilitySlot[]) =>
    withToken(async (token) => {
      const saved = await saveMyAvailability(token, slots);
      setAvailability(saved);
      return saved;
    });

  const confirm = (id: string) =>
    withToken(async (token) => {
      const updated = await confirmBooking(token, id);
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    });

  const cancel = (id: string) =>
    withToken(async (token) => {
      const updated = await cancelBooking(token, id);
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    });

  const upgrade = () =>
    withToken(async (token) => {
      const { url } = await createCheckoutSession(token);
      window.location.href = url;
    });

  const managePortal = () =>
    withToken(async (token) => {
      const { url } = await getCustomerPortalUrl(token);
      window.location.href = url;
    });

  const testEmail = () => withToken((token) => sendTestEmail(token));

  return {
    profile,
    services,
    links,
    stats,
    availability,
    bookings,
    loading,
    plan,
    isPro,
    setAvailability,
    saveProfile,
    createOrUpdateService,
    removeService,
    reorderServices: reorderServicesLocal,
    createOrUpdateLink,
    removeLink,
    reorderLinks: reorderLinksLocal,
    saveAvailability,
    confirm,
    cancel,
    upgrade,
    managePortal,
    testEmail,
  };
}
