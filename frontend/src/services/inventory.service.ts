import { api, ApiError } from "./api";
import type { AdminEquipment } from "@/types/admin";
import { equipmentApi, toAdminEquipment, type BackendEquipment } from "./equipment.service";

export interface InventorySummary {
  total: number;
  available: number;
  rented: number;
  maintenance: number;
  lowStock: AdminEquipment[];
  outOfStock: AdminEquipment[];
}

interface BackendSummary {
  success?: boolean;
  total?: number;
  available?: number;
  rented?: number | null;
  maintenance?: number | null;
  lowStock?: BackendEquipment[];
  outOfStock?: BackendEquipment[];
}

export const inventoryApi = {
  async list(): Promise<AdminEquipment[]> {
    try {
      const { data } = await api.get<{ success: boolean; data: BackendEquipment[] }>(
        "/inventory",
      );
      return (data.data ?? []).map(toAdminEquipment);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) throw err;
      return equipmentApi.listAdmin();
    }
  },
  async summary(): Promise<InventorySummary> {
    try {
      const { data } = await api.get<BackendSummary>("/inventory/summary");
      const items = await this.list();
      const rented = data.rented ?? items.reduce((s, i) => s + i.rentedQuantity, 0);
      const maintenance = data.maintenance ?? 0;
      return {
        total: data.total ?? items.reduce((s, i) => s + i.totalQuantity, 0),
        available: data.available ?? items.reduce((s, i) => s + i.availableQuantity, 0),
        rented,
        maintenance,
        lowStock:
          data.lowStock?.map(toAdminEquipment) ??
          items.filter((i) => i.availableQuantity > 0 && i.availableQuantity <= 2),
        outOfStock:
          data.outOfStock?.map(toAdminEquipment) ??
          items.filter((i) => i.availableQuantity === 0),
      };
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) throw err;
      const items = await this.list();
      return {
        total: items.reduce((s, i) => s + i.totalQuantity, 0),
        available: items.reduce((s, i) => s + i.availableQuantity, 0),
        rented: items.reduce((s, i) => s + i.rentedQuantity, 0),
        maintenance: 0,
        lowStock: items.filter((i) => i.availableQuantity > 0 && i.availableQuantity <= 2),
        outOfStock: items.filter((i) => i.availableQuantity === 0),
      };
    }
  },
};