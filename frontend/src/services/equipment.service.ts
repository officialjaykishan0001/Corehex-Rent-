import { api } from "./api";
import type { Availability, CategorySlug, Equipment, EquipmentSpec } from "@/types/rental";
import type { AdminEquipment, EquipmentInput, EquipmentStatus } from "@/types/admin";

export interface BackendEquipment {
  _id: string;
  name: string;
  slug: string;
  category: string;
  brand?: string;
  model?: string;
  tagline?: string;
  description?: string;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  totalQuantity: number;
  availableQuantity: number;
  thumbnail?: string;
  images?: string[];
  status?: EquipmentStatus;
  specs?: EquipmentSpec[];
  accessories?: string[];
  features?: string[];
  rating?: number;
  tag?: string;
  createdAt?: string;
  updatedAt?: string;
}

function deriveAvailability(available: number): Availability {
  if (available <= 0) return "out-of-stock";
  if (available <= 2) return "limited";
  return "available";
}

export function toEquipment(b: BackendEquipment): Equipment {
  return {
    slug: b.slug,
    name: b.name,
    category: b.category as CategorySlug,
    tagline: b.tagline ?? "",
    description: b.description ?? "",
    specs: b.specs ?? [],
    features: b.features ?? [],
    accessories: b.accessories ?? [],
    dailyRate: b.dailyRate,
    weeklyRate: b.weeklyRate,
    monthlyRate: b.monthlyRate,
    availability: deriveAvailability(b.availableQuantity),
    rating: b.rating ?? 4.7,
    tag: b.tag ?? b.brand ?? "Featured",
  };
}

export function toAdminEquipment(b: BackendEquipment): AdminEquipment {
  const base = toEquipment(b);
  const rented = Math.max(0, b.totalQuantity - b.availableQuantity);
  return {
    ...base,
    id: b._id,
    brand: b.brand,
    model: b.model,
    thumbnail: b.thumbnail,
    images: b.images,
    totalQuantity: b.totalQuantity,
    availableQuantity: b.availableQuantity,
    rentedQuantity: rented,
    maintenanceQuantity: 0,
    status: (b.status as EquipmentStatus) ?? "active",
    createdAt: b.createdAt ?? new Date().toISOString(),
    updatedAt: b.updatedAt ?? new Date().toISOString(),
    isCustom: false,
  };
}

function inputToPayload(input: Partial<EquipmentInput>) {
  const out: Record<string, unknown> = {};
  const keys: (keyof EquipmentInput)[] = [
    "name",
    "slug",
    "category",
    "brand",
    "model",
    "description",
    "tagline",
    "dailyRate",
    "weeklyRate",
    "monthlyRate",
    "totalQuantity",
    "availableQuantity",
    "thumbnail",
    "images",
    "specs",
    "accessories",
    "status",
  ];
  for (const k of keys) {
    if (input[k] !== undefined) out[k] = input[k];
  }
  return out;
}

export const equipmentApi = {
  async list(): Promise<BackendEquipment[]> {
    const { data } = await api.get<{ success: boolean; data: BackendEquipment[] }>("/equipment");
    return data.data ?? [];
  },
  async listEquipment(): Promise<Equipment[]> {
    const items = await this.list();
    return items.map(toEquipment);
  },
  async listAdmin(): Promise<AdminEquipment[]> {
    const items = await this.list();
    return items.map(toAdminEquipment);
  },
  async getById(id: string): Promise<AdminEquipment> {
    const { data } = await api.get<{ success: boolean; data: BackendEquipment }>(
      `/equipment/${id}`,
    );
    return toAdminEquipment(data.data);
  },
  async getBySlug(slug: string): Promise<Equipment | undefined> {
    const items = await this.list();
    const match = items.find((e) => e.slug === slug);
    return match ? toEquipment(match) : undefined;
  },
  async create(input: EquipmentInput): Promise<AdminEquipment> {
    const { data } = await api.post<{ success: boolean; data: BackendEquipment }>(
      "/equipment",
      inputToPayload(input),
    );
    return toAdminEquipment(data.data);
  },
  async update(id: string, patch: Partial<EquipmentInput>): Promise<AdminEquipment> {
    const { data } = await api.put<{ success: boolean; data: BackendEquipment }>(
      `/equipment/${id}`,
      inputToPayload(patch),
    );
    return toAdminEquipment(data.data);
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/equipment/${id}`);
  },
};