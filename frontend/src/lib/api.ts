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
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// Public
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

// Authenticated
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

// Types
export interface ProfileResponse {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  location: string | null;
  websiteUrl: string | null;
  services: ServiceResponse[];
  links: LinkResponse[];
}

export interface ProfileRequest {
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  websiteUrl?: string;
}

export interface StatsResponse {
  viewCount: number;
  servicesCount: number;
  linksCount: number;
  profileUrl: string | null;
}

export interface ServiceResponse {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  currency: string;
  priceLabel: string | null;
  displayOrder: number;
}

export interface ServiceRequest {
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  priceLabel?: string;
}

export interface LinkResponse {
  id: string;
  label: string;
  url: string;
  iconName: string | null;
  displayOrder: number;
}

export interface LinkRequest {
  label: string;
  url: string;
  iconName?: string;
}

export interface ContactRequest {
  name: string;
  email: string;
  message: string;
}

export interface ProfileSummaryResponse {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  servicesCount: number;
}

export interface ProfilesPage {
  content: ProfileSummaryResponse[];
  totalPages: number;
  totalElements: number;
  number: number;
  last: boolean;
}
