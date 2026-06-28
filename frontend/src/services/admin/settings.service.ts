import type { AdminSettings } from "@/types/admin";
import { delay, readStore, writeStore } from "./storage";

const KEY = "corehex.admin.settings.v1";

const DEFAULTS: AdminSettings = {
  companyName: "CoreHex Rental",
  contactEmail: "hello@corehex.com",
  phone: "+1 (415) 555-0117",
  address: "350 Mission St, San Francisco, CA",
  taxPercentage: 8.5,
  securityDeposit: 500,
  rentalTerms:
    "Equipment must be returned in original condition. Late fees apply after 24 hours past return date.",
  notifyBookings: true,
  notifyQuotes: true,
};

export const settingsService = {
  async get(): Promise<AdminSettings> {
    await delay(100);
    return readStore<AdminSettings>(KEY, DEFAULTS);
  },
  async update(patch: Partial<AdminSettings>): Promise<AdminSettings> {
    await delay(200);
    const next = { ...(await this.get()), ...patch };
    writeStore(KEY, next);
    return next;
  },
};