export type CategorySlug =
  | "laptops"
  | "desktops"
  | "sound-systems"
  | "projectors"
  | "networking"
  | "printers"
  | "displays"
  | "servers";

export type Availability = "available" | "limited" | "out-of-stock";

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
  iconKey: string;
}

export interface EquipmentSpec {
  label: string;
  value: string;
}

export interface Equipment {
  slug: string;
  name: string;
  category: CategorySlug;
  tagline: string;
  description: string;
  specs: EquipmentSpec[];
  features: string[];
  accessories: string[];
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  availability: Availability;
  rating: number;
  tag: string;
}

export interface CartItem {
  slug: string;
  quantity: number;
}

export interface BookingInput {
  equipmentSlug: string;
  startDate: string;
  endDate: string;
  quantity: number;
  deliveryRequired: boolean;
  installationRequired: boolean;
  specialRequirements?: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  projectType: string;
}

export interface Booking extends BookingInput {
  id: string;
  createdAt: string;
  estimatedCost: number;
  status: "confirmed" | "pending";
}

export interface QuoteItem {
  slug: string;
  quantity: number;
}

export interface QuoteInput {
  items: QuoteItem[];
  name: string;
  company: string;
  email: string;
  phone: string;
  requirements: string;
}

export interface Quote extends QuoteInput {
  id: string;
  reference: string;
  createdAt: string;
  estimatedTotal: number;
}