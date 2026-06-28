import { customerApi } from "@/services/customer.service";
import type { Customer } from "@/types/admin";

export const customerService = {
  async list(): Promise<Customer[]> {
    return customerApi.list();
  },
  async get(id: string): Promise<Customer | undefined> {
    const all = await customerApi.list();
    return all.find((c) => c.id === id || c.email.toLowerCase() === id.toLowerCase());
  },
  async historyFor(email: string) {
    return customerApi.historyFor(email);
  },
};
