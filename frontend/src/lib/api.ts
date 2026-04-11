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
  CheckoutSessionResponse,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export type ApiError = {
  status: number;
  message: string;
  isPlanLimit: boolean;
};

export class ApiException extends Error {
  status: number;
  isPlanLimit: boolean;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiException";
    this.status = status;
    this.isPlanLimit = status === 402 || status === 403;
  }
}

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
    let message: string;
    if (res.status === 401) {
      message = "Unauthorized — please sign in again.";
    } else if (res.status === 402 || res.status === 403) {
      message = text || "This feature requires a Pro plan.";
    } else if (res.status === 404) {
      message = text || "Not found.";
    } else if (res.status >= 500) {
      message = "Server error — please try again later.";
    } else {
      message = text || `API error: ${res.status} ${res.statusText}`;
    }
    throw new ApiException(res.status, message);
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

export function getPublicAvailability(username: string) {
  return apiFetch<AvailabilitySlot[]>(`/api/p/${username}/availability`);
}

export function getBookedSlots(username: string, date: string) {
  return apiFetch<BookingResponse[]>(`/api/p/${username}/booked-slots?date=${date}`);
}

export function createBooking(username: string, data: BookingRequest) {
  return apiFetch<BookingResponse>(`/api/p/${username}/book`, {
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

// ── Availability ──
export function getMyAvailability(token: string) {
  return apiFetch<AvailabilitySlot[]>("/api/me/availability", { token });
}

export function saveMyAvailability(token: string, slots: AvailabilitySlot[]) {
  return apiFetch<AvailabilitySlot[]>("/api/me/availability", {
    method: "PUT",
    token,
    body: JSON.stringify(slots),
  });
}

// ── Bookings ──
export function getMyBookings(token: string) {
  return apiFetch<BookingResponse[]>("/api/me/bookings", { token });
}

export function confirmBooking(token: string, id: string) {
  return apiFetch<BookingResponse>(`/api/me/bookings/${id}/confirm`, {
    method: "PATCH",
    token,
  });
}

export function cancelBooking(token: string, id: string) {
  return apiFetch<BookingResponse>(`/api/me/bookings/${id}/cancel`, {
    method: "PATCH",
    token,
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

// ── Types (used by BookingWidget and other components) ──
export interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface BookingRequest {
  clientName: string;
  clientEmail: string;
  clientMessage?: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface BookingResponse {
  id: string;
  clientName: string;
  clientEmail: string;
  clientMessage: string | null;
  date: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
}
