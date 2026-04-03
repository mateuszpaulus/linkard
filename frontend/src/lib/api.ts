import type {
  ProfileResponse,
  ProfileRequest,
  StatsResponse,
  ServiceResponse,
  ServiceRequest,
  LinkResponse,
  LinkRequest,
  ContactRequest,
  ProfilesPage,
  AvailabilityDay,
  AvailabilityRequest,
  BookingSlot,
  BookingRequest,
  BookingResponse,
  CheckoutSessionResponse,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function apiFetch<T>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const { token, ...fetchOptions } = options ?? {};

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((fetchOptions.headers as Record<string, string>) ?? {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `API error: ${res.status} ${res.statusText}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Public ──
export function getPublicProfile(username: string) {
  return apiFetch<ProfileResponse>(`/api/p/${username}`);
}

export function sendContact(username: string, data: ContactRequest) {
  return apiFetch<void>(`/api/p/${username}/contact`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getPublicProfiles(page = 0, size = 12) {
  return apiFetch<ProfilesPage>(`/api/profiles?page=${page}&size=${size}`);
}

export function getAvailableSlots(username: string, date: string) {
  return apiFetch<BookingSlot[]>(`/api/p/${username}/slots?date=${date}`);
}

export function getAvailableDays(username: string, month: string) {
  return apiFetch<string[]>(`/api/p/${username}/available-days?month=${month}`);
}

export function createBooking(username: string, data: BookingRequest) {
  return apiFetch<BookingResponse>(`/api/p/${username}/bookings`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Authenticated ──
export function getMyProfile(token: string) {
  return apiFetch<ProfileResponse>("/api/me/profile", { token });
}

export function createProfile(token: string, data: ProfileRequest) {
  return apiFetch<ProfileResponse>("/api/me/profile", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export function updateProfile(token: string, data: Partial<ProfileRequest>) {
  return apiFetch<ProfileResponse>("/api/me/profile", {
    method: "PATCH",
    token,
    body: JSON.stringify(data),
  });
}

export function getMyStats(token: string) {
  return apiFetch<StatsResponse>("/api/me/stats", { token });
}

export function getMyServices(token: string) {
  return apiFetch<ServiceResponse[]>("/api/me/services", { token });
}

export function addService(token: string, data: ServiceRequest) {
  return apiFetch<ServiceResponse>("/api/me/services", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export function updateService(token: string, id: string, data: Partial<ServiceRequest>) {
  return apiFetch<ServiceResponse>(`/api/me/services/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(data),
  });
}

export function deleteService(token: string, id: string) {
  return apiFetch<void>(`/api/me/services/${id}`, {
    method: "DELETE",
    token,
  });
}

export function getMyLinks(token: string) {
  return apiFetch<LinkResponse[]>("/api/me/links", { token });
}

export function addLink(token: string, data: LinkRequest) {
  return apiFetch<LinkResponse>("/api/me/links", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export function updateLink(token: string, id: string, data: Partial<LinkRequest>) {
  return apiFetch<LinkResponse>(`/api/me/links/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(data),
  });
}

export function deleteLink(token: string, id: string) {
  return apiFetch<void>(`/api/me/links/${id}`, {
    method: "DELETE",
    token,
  });
}

// ── Booking / Availability ──
export function getMyAvailability(token: string) {
  return apiFetch<AvailabilityDay[]>("/api/me/availability", { token });
}

export function updateMyAvailability(token: string, data: AvailabilityRequest) {
  return apiFetch<AvailabilityDay[]>("/api/me/availability", {
    method: "PUT",
    token,
    body: JSON.stringify(data),
  });
}

export function getMyBookings(token: string, status?: string) {
  const q = status ? `?status=${status}` : "";
  return apiFetch<BookingResponse[]>(`/api/me/bookings${q}`, { token });
}

export function updateBookingStatus(token: string, id: string, status: "CONFIRMED" | "CANCELLED") {
  return apiFetch<BookingResponse>(`/api/me/bookings/${id}/status`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ status }),
  });
}

// ── Stripe ──
export function createCheckoutSession(token: string) {
  return apiFetch<CheckoutSessionResponse>("/api/me/create-checkout-session", {
    method: "POST",
    token,
  });
}

export function getCustomerPortalUrl(token: string) {
  return apiFetch<{ url: string }>("/api/me/customer-portal", {
    method: "POST",
    token,
  });
}
