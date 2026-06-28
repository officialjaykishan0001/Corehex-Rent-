import { notificationApi } from "@/services/notification.service";
import type { AdminNotification } from "@/types/admin";

export const notificationService = {
  async list(): Promise<AdminNotification[]> {
    return notificationApi.list();
  },
  async unreadCount(): Promise<number> {
    return notificationApi.unreadCount();
  },
  async markRead(id: string): Promise<void> {
    return notificationApi.markRead(id);
  },
  async markAllRead(): Promise<void> {
    return notificationApi.markAllRead();
  },
};
