import type { Booking, Quote, Equipment, CategorySlug } from "./rental";

export type AdminRole = "admin" | "manager" | "staff";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatarInitials: string;
}

export type BookingStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "active"
  | "completed"
  | "cancelled";

export interface TimelineEvent {
  id: string;
  label: string;
  at: string;
  by?: string;
}

export interface AdminBookingMeta {
  notes?: string;
  timeline: TimelineEvent[];
}

export interface AdminBooking extends Omit<Booking, "status">, AdminBookingMeta {
  status: BookingStatus;
}

export type QuoteStatus = "new" | "contacted" | "quoted" | "converted" | "closed";

export interface AdminQuoteMeta {
  status: QuoteStatus;
  notes?: string;
}

export interface AdminQuote extends Quote, AdminQuoteMeta {}

export type EquipmentStatus = "active" | "draft" | "out-of-stock";

export interface InventoryOverride {
  totalQuantity: number;
  availableQuantity: number;
  rentedQuantity: number;
  maintenanceQuantity: number;
  status: EquipmentStatus;
  updatedAt: string;
}

export interface AdminEquipment extends Equipment {
  id: string;
  brand?: string;
  model?: string;
  thumbnail?: string;
  images?: string[];
  totalQuantity: number;
  availableQuantity: number;
  rentedQuantity: number;
  maintenanceQuantity: number;
  status: EquipmentStatus;
  createdAt: string;
  updatedAt: string;
  isCustom?: boolean;
}

export interface EquipmentInput {
  name: string;
  slug: string;
  category: CategorySlug;
  brand?: string;
  model?: string;
  description: string;
  tagline?: string;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  totalQuantity: number;
  availableQuantity: number;
  thumbnail?: string;
  images?: string[];
  specs: { label: string; value: string }[];
  accessories: string[];
  status: EquipmentStatus;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  totalBookings: number;
  lifetimeRevenue: number;
  firstSeen: string;
  lastSeen: string;
}

export type NotificationKind =
  | "booking"
  | "quote"
  | "inventory"
  | "maintenance"
  | "system";

export interface AdminNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  href?: string;
  read: boolean;
  createdAt: string;
}

export interface AdminSettings {
  companyName: string;
  contactEmail: string;
  phone: string;
  address: string;
  taxPercentage: number;
  securityDeposit: number;
  rentalTerms: string;
  notifyBookings: boolean;
  notifyQuotes: boolean;
}

export interface AnalyticsPoint {
  label: string;
  revenue: number;
  bookings: number;
}

export interface CategoryPerformance {
  category: string;
  bookings: number;
  revenue: number;
}