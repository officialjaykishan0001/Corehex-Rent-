import { analyticsApi, type Granularity } from "@/services/analytics.service";
import type { AnalyticsPoint, CategoryPerformance } from "@/types/admin";

export type { Granularity };

export const analyticsService = {
  async overview() {
    return analyticsApi.overview();
  },
  async trends(g: Granularity = "monthly"): Promise<AnalyticsPoint[]> {
    return analyticsApi.trends(g);
  },
  async categoryPerformance(): Promise<CategoryPerformance[]> {
    return analyticsApi.categoryPerformance();
  },
  async mostRented(): Promise<{ name: string; count: number }[]> {
    return analyticsApi.mostRented();
  },
};
