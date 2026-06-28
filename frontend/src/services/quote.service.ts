import { api, ApiError } from "./api";
import type { Quote, QuoteInput } from "@/types/rental";
import type { AdminQuote, QuoteStatus } from "@/types/admin";

interface BackendQuote {
  _id: string;
  reference?: string;
  items: { slug: string; quantity: number }[];
  name: string;
  company: string;
  email: string;
  phone: string;
  requirements: string;
  estimatedTotal?: number;
  status?: string;
  notes?: string;
  createdAt: string;
}

function toQuote(q: BackendQuote): Quote {
  return {
    id: q._id,
    reference: q.reference ?? `CHX-${q._id.slice(-6).toUpperCase()}`,
    items: q.items,
    name: q.name,
    company: q.company,
    email: q.email,
    phone: q.phone,
    requirements: q.requirements,
    estimatedTotal: q.estimatedTotal ?? 0,
    createdAt: q.createdAt,
  };
}

function toAdminQuote(q: BackendQuote): AdminQuote {
  const base = toQuote(q);
  const s = (q.status as QuoteStatus) ?? "new";
  return { ...base, status: s, notes: q.notes };
}

async function safeArray<T>(p: Promise<T[]>): Promise<T[]> {
  try {
    return await p;
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 401)) return [];
    throw err;
  }
}

export const quoteApi = {
  async create(input: QuoteInput): Promise<Quote> {
    const { data } = await api.post<{ success: boolean; data: BackendQuote }>(
      "/quote",
      input,
    );
    return toQuote(data.data);
  },
  async list(): Promise<Quote[]> {
    return safeArray(
      api
        .get<{ success: boolean; data: BackendQuote[] }>("/quote")
        .then((r) => (r.data.data ?? []).map(toQuote)),
    );
  },
  async listAdmin(): Promise<AdminQuote[]> {
    return safeArray(
      api
        .get<{ success: boolean; data: BackendQuote[] }>("/quote")
        .then((r) => (r.data.data ?? []).map(toAdminQuote)),
    );
  },
  async get(id: string): Promise<AdminQuote> {
    const { data } = await api.get<{ success: boolean; data: BackendQuote }>(
      `/quote/${id}`,
    );
    return toAdminQuote(data.data);
  },
  async patch(id: string, patch: Partial<{ status: QuoteStatus; notes: string }>): Promise<AdminQuote> {
    const { data } = await api.patch<{ success: boolean; data: BackendQuote }>(
      `/quote/${id}`,
      patch,
    );
    return toAdminQuote(data.data);
  },
};