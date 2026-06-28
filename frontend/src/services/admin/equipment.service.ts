import { categories } from "@/data/equipment";
import { equipmentApi } from "@/services/equipment.service";
import type {
  AdminEquipment,
  EquipmentInput,
  InventoryOverride,
} from "@/types/admin";

export const equipmentService = {
  async list(): Promise<AdminEquipment[]> {
    return equipmentApi.listAdmin();
  },
  async get(id: string): Promise<AdminEquipment | undefined> {
    try {
      return await equipmentApi.getById(id);
    } catch {
      const all = await equipmentApi.listAdmin();
      return all.find((e) => e.id === id || e.slug === id);
    }
  },
  async create(input: EquipmentInput): Promise<AdminEquipment> {
    return equipmentApi.create(input);
  },
  async update(id: string, patch: Partial<EquipmentInput>): Promise<AdminEquipment> {
    return equipmentApi.update(id, patch);
  },
  async remove(id: string): Promise<void> {
    return equipmentApi.remove(id);
  },
  async adjustInventory(
    id: string,
    patch: Partial<
      Pick<
        InventoryOverride,
        "totalQuantity" | "availableQuantity" | "rentedQuantity" | "maintenanceQuantity" | "status"
      >
    >,
  ): Promise<AdminEquipment> {
    const allowed: Partial<EquipmentInput> = {};
    if (patch.totalQuantity !== undefined) allowed.totalQuantity = patch.totalQuantity;
    if (patch.availableQuantity !== undefined) allowed.availableQuantity = patch.availableQuantity;
    if (patch.status !== undefined) allowed.status = patch.status;
    return equipmentApi.update(id, allowed);
  },
  categories() {
    return categories;
  },
};
