import { api, ApiError } from "./api";
import type { AnalyticsPoint, CategoryPerformance } from "@/types/admin";

export type Granularity = "weekly" | "monthly" | "quarterly" | "yearly";

export interface AnalyticsOverview {
  totalEquipment: number;
  activeRentals: number;
  pendingBookings: number;
  monthlyRevenue: number;
  utilization: number;
  availableInventory: number;
}

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 401)) return fallback;
    throw err;
  }
}

export const analyticsApi = {
  async overview(): Promise<AnalyticsOverview> {
    return safe(
      api.get<AnalyticsOverview>("/analytics/overview").then((r) => r.data),
      {
        totalEquipment: 0,
        activeRentals: 0,
        pendingBookings: 0,
        monthlyRevenue: 0,
        utilization: 0,
        availableInventory: 0,
      },
    );
  },
  async trends(g: Granularity = "monthly"): Promise<AnalyticsPoint[]> {
    return safe(
      api
        .get<AnalyticsPoint[]>("/analytics/trends", { params: { granularity: g } })
        .then((r) => r.data),
      [],
    );
  },
  async categoryPerformance(): Promise<CategoryPerformance[]> {
    return safe(
      api
        .get<CategoryPerformance[]>("/analytics/category-performance")
        .then((r) => r.data),
      [],
    );
  },
  async mostRented(): Promise<{ name: string; count: number }[]> {
    return safe(
      api
        .get<{ name: string; count: number }[]>("/analytics/most-rented")
        .then((r) => r.data),
      [],
    );
  },
};