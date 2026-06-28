import { getEquipmentBySlug } from "@/data/equipment";
import { quoteApi } from "@/services/quote.service";
import type { AdminQuote, QuoteStatus } from "@/types/admin";

export const quoteService = {
  async list(): Promise<AdminQuote[]> {
    return quoteApi.listAdmin();
  },
  async get(id: string): Promise<AdminQuote | undefined> {
    try {
      return await quoteApi.get(id);
    } catch {
      const all = await quoteApi.listAdmin();
      return all.find((q) => q.id === id);
    }
  },
  async setStatus(id: string, status: QuoteStatus): Promise<AdminQuote> {
    return quoteApi.patch(id, { status });
  },
  async addNote(id: string, notes: string): Promise<AdminQuote> {
    return quoteApi.patch(id, { notes });
  },
  resolveItemName(slug: string) {
    return getEquipmentBySlug(slug)?.name ?? slug;
  },
};
