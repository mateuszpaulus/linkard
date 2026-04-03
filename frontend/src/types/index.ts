export interface ProfileResponse {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  location: string | null;
  websiteUrl: string | null;
  plan: "FREE" | "PRO";
  services: ServiceResponse[];
  links: LinkResponse[];
  availability?: AvailabilityDay[];
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
  pendingBookings: number;
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

export interface AvailabilityDay {
  dayOfWeek: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface AvailabilityRequest {
  days: AvailabilityDay[];
}

export interface BookingSlot {
  time: string;
  available: boolean;
}

export interface BookingRequest {
  date: string;
  time: string;
  name: string;
  email: string;
  message?: string;
}

export interface BookingResponse {
  id: string;
  date: string;
  time: string;
  clientName: string;
  clientEmail: string;
  message: string | null;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
}

export interface CheckoutSessionResponse {
  url: string;
}
