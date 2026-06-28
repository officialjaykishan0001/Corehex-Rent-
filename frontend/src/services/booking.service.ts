import { api } from "./api";
import type { Booking, BookingInput } from "@/types/rental";
import type { AdminBooking, BookingStatus } from "@/types/admin";

interface BackendBooking {
  _id: string;
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
  estimatedCost: number;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

function normalizeStatus(s: string): BookingStatus {
  const known: BookingStatus[] = [
    "pending",
    "approved",
    "rejected",
    "active",
    "completed",
    "cancelled",
  ];
  return (known as string[]).includes(s) ? (s as BookingStatus) : "pending";
}

function toBooking(b: BackendBooking): Booking {
  return {
    id: b._id,
    equipmentSlug: b.equipmentSlug,
    startDate: b.startDate,
    endDate: b.endDate,
    quantity: b.quantity,
    deliveryRequired: b.deliveryRequired,
    installationRequired: b.installationRequired,
    specialRequirements: b.specialRequirements,
    name: b.name,
    company: b.company,
    email: b.email,
    phone: b.phone,
    projectType: b.projectType,
    estimatedCost: b.estimatedCost,
    status: b.status === "pending" ? "pending" : "confirmed",
    createdAt: b.createdAt,
  };
}

export function toAdminBooking(b: BackendBooking): AdminBooking {
  const base = toBooking(b);
  return {
    ...base,
    status: normalizeStatus(b.status),
    notes: b.notes,
    timeline: [
      { id: `ev-create-${b._id}`, label: "Booking created", at: b.createdAt, by: "Customer" },
      ...(b.updatedAt && b.updatedAt !== b.createdAt
        ? [{ id: `ev-update-${b._id}`, label: `Status: ${b.status}`, at: b.updatedAt, by: "Admin" }]
        : []),
    ],
  };
}

export const bookingApi = {
  async create(input: BookingInput): Promise<Booking> {
    const { data } = await api.post<{ success: boolean; data: BackendBooking }>(
      "/booking",
      input,
    );
    return toBooking(data.data);
  },
  async list(): Promise<Booking[]> {
    const { data } = await api.get<{ success: boolean; data: BackendBooking[] }>("/booking");
    return (data.data ?? []).map(toBooking);
  },
  async listAdmin(): Promise<AdminBooking[]> {
    const { data } = await api.get<{ success: boolean; data: BackendBooking[] }>("/booking");
    return (data.data ?? []).map(toAdminBooking);
  },
  async get(id: string): Promise<AdminBooking> {
    const { data } = await api.get<{ success: boolean; data: BackendBooking }>(
      `/booking/${id}`,
    );
    return toAdminBooking(data.data);
  },
  async patch(id: string, patch: Partial<{ status: BookingStatus; notes: string }>): Promise<AdminBooking> {
    const { data } = await api.patch<{ success: boolean; data: BackendBooking }>(
      `/booking/${id}`,
      patch,
    );
    return toAdminBooking(data.data);
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/booking/${id}`);
  },
};