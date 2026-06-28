import { inventoryApi, type InventorySummary } from "@/services/inventory.service";

export type { InventorySummary };

export const inventoryService = {
  async summary(): Promise<InventorySummary> {
    return inventoryApi.summary();
  },
  async list() {
    return inventoryApi.list();
  },
};
