export interface ProfileResponse {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  location: string | null;
  websiteUrl: string | null;
  themeColor: string | null;
  plan: "FREE" | "PRO";
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
  themeColor?: string | null;
}

export interface StatsResponse {
  viewCount: number;
  servicesCount: number;
  linksCount: number;
  pendingBookings: number;
  profileUrl: string | null;
  contactCount: number;
  bookingCount: number;
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
  page: number;
  totalPages: number;
  totalElements: number;
  last: boolean;
}

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

export interface CheckoutSessionResponse {
  url: string;
}
