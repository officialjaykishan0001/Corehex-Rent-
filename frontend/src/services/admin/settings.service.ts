import type { AdminSettings } from "@/types/admin";

const DEFAULTS: AdminSettings = {
  companyName: "CoreHex Rental",
  contactEmail: "",
  phone: "",
  address: "",
  taxPercentage: 0,
  securityDeposit: 0,
  rentalTerms:
    "Equipment must be returned in original condition. Late fees apply after 24 hours past return date.",
  notifyBookings: true,
  notifyQuotes: true,
};

let current: AdminSettings = { ...DEFAULTS };

export const settingsService = {
  async get(): Promise<AdminSettings> {
    return { ...current };
  },
  async update(patch: Partial<AdminSettings>): Promise<AdminSettings> {
    current = { ...current, ...patch };
    return { ...current };
  },
};