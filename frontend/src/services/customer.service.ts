import { api, ApiError } from "./api";
import type { Customer } from "@/types/admin";
import { bookingApi } from "./booking.service";
import { quoteApi } from "./quote.service";

interface BackendCustomer {
  _id?: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  totalBookings?: number;
  lifetimeRevenue?: number;
  firstSeen?: string;
  lastSeen?: string;
}

function toCustomer(c: BackendCustomer): Customer {
  return {
    id: c._id ?? c.email.toLowerCase(),
    name: c.name,
    company: c.company ?? "",
    email: c.email,
    phone: c.phone ?? "",
    totalBookings: c.totalBookings ?? 0,
    lifetimeRevenue: c.lifetimeRevenue ?? 0,
    firstSeen: c.firstSeen ?? new Date().toISOString(),
    lastSeen: c.lastSeen ?? new Date().toISOString(),
  };
}

async function deriveFromBookings(): Promise<Customer[]> {
  const [bookings, quotes] = await Promise.all([bookingApi.listAdmin(), quoteApi.listAdmin()]);
  const map = new Map<string, Customer>();
  for (const b of bookings) {
    const key = b.email.toLowerCase();
    const c = map.get(key) ?? {
      id: key,
      name: b.name,
      company: b.company,
      email: b.email,
      phone: b.phone,
      totalBookings: 0,
      lifetimeRevenue: 0,
      firstSeen: b.createdAt,
      lastSeen: b.createdAt,
    };
    c.totalBookings += 1;
    c.lifetimeRevenue += b.estimatedCost;
    if (b.createdAt < c.firstSeen) c.firstSeen = b.createdAt;
    if (b.createdAt > c.lastSeen) c.lastSeen = b.createdAt;
    map.set(key, c);
  }
  for (const q of quotes) {
    const key = q.email.toLowerCase();
    if (map.has(key)) continue;
    map.set(key, {
      id: key,
      name: q.name,
      company: q.company,
      email: q.email,
      phone: q.phone,
      totalBookings: 0,
      lifetimeRevenue: 0,
      firstSeen: q.createdAt,
      lastSeen: q.createdAt,
    });
  }
  return [...map.values()].sort((a, b) => b.lifetimeRevenue - a.lifetimeRevenue);
}

export const customerApi = {
  async list(): Promise<Customer[]> {
    try {
      const { data } = await api.get<{ success: boolean; data: BackendCustomer[] }>(
        "/customer",
      );
      const arr = data.data ?? [];
      if (arr.length > 0) return arr.map(toCustomer);
      return await deriveFromBookings();
    } catch (err) {
      if (err instanceof ApiError && (err.status === 404 || err.status === 401)) {
        return deriveFromBookings();
      }
      throw err;
    }
  },
  async getByEmail(email: string): Promise<Customer | undefined> {
    try {
      const { data } = await api.get<{ success: boolean; data: BackendCustomer }>(
        `/customer/${encodeURIComponent(email)}`,
      );
      return data.data ? toCustomer(data.data) : undefined;
    } catch (err) {
      if (err instanceof ApiError && (err.status === 404 || err.status === 401)) {
        const all = await deriveFromBookings();
        return all.find((c) => c.email.toLowerCase() === email.toLowerCase());
      }
      throw err;
    }
  },
  async historyFor(email: string) {
    const [bookings, quotes] = await Promise.all([
      bookingApi.listAdmin(),
      quoteApi.listAdmin(),
    ]);
    const key = email.toLowerCase();
    return {
      bookings: bookings.filter((b) => b.email.toLowerCase() === key),
      quotes: quotes.filter((q) => q.email.toLowerCase() === key),
    };
  },
};