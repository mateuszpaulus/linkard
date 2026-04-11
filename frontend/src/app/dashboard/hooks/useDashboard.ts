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
  getMyLinks,
  addLink,
  updateLink,
  deleteLink,
  getMyAvailability,
  saveMyAvailability,
  getMyBookings,
  confirmBooking,
  cancelBooking,
  createCheckoutSession,
  getCustomerPortalUrl,
  type AvailabilitySlot,
  type BookingResponse,
} from "@/lib/api";
import type {
  ProfileResponse,
  ServiceResponse,
  LinkResponse,
  StatsResponse,
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

export type ToastState = { message: string; type: "success" | "error" | "info" | "warning" } | null;

export function useDashboard() {
  const { getToken } = useAuth();

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [links, setLinks] = useState<LinkResponse[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(DEFAULT_AVAILABILITY);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);

  const plan = profile?.plan ?? "FREE";
  const isPro = plan === "PRO";

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

  // ── Profile ──
  const saveProfile = async (form: {
    username: string;
    displayName: string;
    bio: string;
    avatarUrl: string;
    location: string;
    websiteUrl: string;
  }) => {
    const token = await getToken();
    if (!token) throw new Error("No token");
    const saved = hasProfile(profile)
      ? await updateProfile(token, form)
      : await createProfile(token, form);
    setProfile(saved);
    return saved;
  };

  // ── Services ──
  const createOrUpdateService = async (
    id: string | null,
    data: { title: string; description?: string; price?: number; currency: string }
  ) => {
    const token = await getToken();
    if (!token) throw new Error("No token");
    if (id) {
      const updated = await updateService(token, id, data);
      setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    }
    const created = await addService(token, data);
    setServices((prev) => [...prev, created]);
    return created;
  };

  const removeService = async (id: string) => {
    const token = await getToken();
    if (!token) throw new Error("No token");
    await deleteService(token, id);
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  // ── Links ──
  const createOrUpdateLink = async (
    id: string | null,
    data: { label: string; url: string; iconName: string }
  ) => {
    const token = await getToken();
    if (!token) throw new Error("No token");
    if (id) {
      const updated = await updateLink(token, id, data);
      setLinks((prev) => prev.map((l) => (l.id === id ? updated : l)));
      return updated;
    }
    const created = await addLink(token, data);
    setLinks((prev) => [...prev, created]);
    return created;
  };

  const removeLink = async (id: string) => {
    const token = await getToken();
    if (!token) throw new Error("No token");
    await deleteLink(token, id);
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  // ── Availability ──
  const saveAvailability = async (slots: AvailabilitySlot[]) => {
    const token = await getToken();
    if (!token) throw new Error("No token");
    const saved = await saveMyAvailability(token, slots);
    setAvailability(saved);
    return saved;
  };

  // ── Bookings ──
  const confirm = async (id: string) => {
    const token = await getToken();
    if (!token) throw new Error("No token");
    const updated = await confirmBooking(token, id);
    setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
  };
  const cancel = async (id: string) => {
    const token = await getToken();
    if (!token) throw new Error("No token");
    const updated = await cancelBooking(token, id);
    setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
  };

  // ── Plan ──
  const upgrade = async () => {
    const token = await getToken();
    if (!token) throw new Error("No token");
    const { url } = await createCheckoutSession(token);
    window.location.href = url;
  };
  const managePortal = async () => {
    const token = await getToken();
    if (!token) throw new Error("No token");
    const { url } = await getCustomerPortalUrl(token);
    window.location.href = url;
  };

  return {
    // state
    profile,
    services,
    links,
    stats,
    availability,
    bookings,
    loading,
    toast,
    plan,
    isPro,
    setAvailability,
    setToast,
    // actions
    saveProfile,
    createOrUpdateService,
    removeService,
    createOrUpdateLink,
    removeLink,
    saveAvailability,
    confirm,
    cancel,
    upgrade,
    managePortal,
  };
}