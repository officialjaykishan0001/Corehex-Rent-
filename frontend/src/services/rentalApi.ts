import { getEquipmentBySlug, hydrateEquipment, searchEquipment } from "@/data/equipment";
import type { Booking, BookingInput, Equipment, Quote, QuoteInput } from "@/types/rental";
import { bookingApi } from "./booking.service";
import { quoteApi } from "./quote.service";
import { equipmentApi } from "./equipment.service";

export const rentalApi = {
  async listEquipment(query?: string): Promise<Equipment[]> {
    await hydrateEquipment();
    return query ? searchEquipment(query) : (await equipmentApi.listEquipment());
  },

  async getEquipment(slug: string): Promise<Equipment | undefined> {
    await hydrateEquipment();
    return getEquipmentBySlug(slug);
  },

  async createBooking(input: BookingInput): Promise<Booking> {
    return bookingApi.create(input);
  },

  async listBookings(): Promise<Booking[]> {
    return bookingApi.list();
  },

  async createQuote(input: QuoteInput): Promise<Quote> {
    return quoteApi.create(input);
  },
};

export function estimateCost(
  daily: number,
  weekly: number,
  monthly: number,
  days: number,
  quantity: number,
): number {
  let perUnit: number;
  if (days >= 30) {
    const months = Math.floor(days / 30);
    const remainder = days - months * 30;
    perUnit = months * monthly + Math.min(remainder * daily, weekly * Math.ceil(remainder / 7));
  } else if (days >= 7) {
    const weeks = Math.floor(days / 7);
    const remainder = days - weeks * 7;
    perUnit = weeks * weekly + remainder * daily;
  } else {
    perUnit = days * daily;
  }
  return perUnit * quantity;
}
