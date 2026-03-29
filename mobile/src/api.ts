const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";

async function apiFetch<T>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const { token, ...fetchOptions } = options ?? {};
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((fetchOptions.headers as Record<string, string>) ?? {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...fetchOptions, headers });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const getPublicProfile = (username: string) =>
  apiFetch<ProfileResponse>(`/api/p/${username}`);

export const getMyProfile = (token: string) =>
  apiFetch<ProfileResponse>("/api/me/profile", { token });

export const createProfile = (token: string, data: ProfileRequest) =>
  apiFetch<ProfileResponse>("/api/me/profile", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });

export const updateProfile = (token: string, data: Partial<ProfileRequest>) =>
  apiFetch<ProfileResponse>("/api/me/profile", {
    method: "PATCH",
    token,
    body: JSON.stringify(data),
  });

export const getMyServices = (token: string) =>
  apiFetch<ServiceResponse[]>("/api/me/services", { token });

export const addService = (token: string, data: ServiceRequest) =>
  apiFetch<ServiceResponse>("/api/me/services", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });

export const deleteService = (token: string, id: string) =>
  apiFetch<void>(`/api/me/services/${id}`, { method: "DELETE", token });

export const getMyLinks = (token: string) =>
  apiFetch<LinkResponse[]>("/api/me/links", { token });

export const addLink = (token: string, data: LinkRequest) =>
  apiFetch<LinkResponse>("/api/me/links", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });

export const deleteLink = (token: string, id: string) =>
  apiFetch<void>(`/api/me/links/${id}`, { method: "DELETE", token });

// ── Types ────────────────────────────────────────────────────────────────────

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
