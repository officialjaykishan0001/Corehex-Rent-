import { bookingApi } from "@/services/booking.service";
import type { AdminBooking, BookingStatus, TimelineEvent } from "@/types/admin";

export const bookingService = {
  async list(): Promise<AdminBooking[]> {
    return bookingApi.listAdmin();
  },
  async get(id: string): Promise<AdminBooking | undefined> {
    try {
      return await bookingApi.get(id);
    } catch {
      const all = await bookingApi.listAdmin();
      return all.find((b) => b.id === id);
    }
  },
  async setStatus(id: string, status: BookingStatus): Promise<AdminBooking> {
    const updated = await bookingApi.patch(id, { status });
    const ev: TimelineEvent = {
      id: `ev-${Date.now()}`,
      label: `Status changed to ${status}`,
      at: new Date().toISOString(),
      by: "Admin",
    };
    return { ...updated, timeline: [...updated.timeline, ev] };
  },
  async addNote(id: string, note: string): Promise<AdminBooking> {
    const updated = await bookingApi.patch(id, { notes: note });
    const ev: TimelineEvent = {
      id: `ev-${Date.now()}`,
      label: "Admin note added",
      at: new Date().toISOString(),
      by: "Admin",
    };
    return { ...updated, timeline: [...updated.timeline, ev] };
  },
};
