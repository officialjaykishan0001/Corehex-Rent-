import { api, ApiError } from "./api";
import type { AdminNotification, NotificationKind } from "@/types/admin";

interface BackendNotification {
  _id: string;
  kind?: string;
  title: string;
  message: string;
  href?: string;
  read?: boolean;
  createdAt: string;
}

function toNotif(n: BackendNotification): AdminNotification {
  const kind: NotificationKind =
    n.kind === "booking" ||
    n.kind === "quote" ||
    n.kind === "inventory" ||
    n.kind === "maintenance" ||
    n.kind === "system"
      ? (n.kind as NotificationKind)
      : "system";
  return {
    id: n._id,
    kind,
    title: n.title,
    message: n.message,
    href: n.href,
    read: !!n.read,
    createdAt: n.createdAt,
  };
}

async function safeJson<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 401)) return fallback;
    throw err;
  }
}

export const notificationApi = {
  async list(): Promise<AdminNotification[]> {
    return safeJson(
      api
        .get<{ success: boolean; data: BackendNotification[] }>("/notification")
        .then((r) => (r.data.data ?? []).map(toNotif)),
      [],
    );
  },
  async unreadCount(): Promise<number> {
    const data = await safeJson(
      api
        .get<{ success: boolean; count: number; unread?: number }>("/notification/unread-count")
        .then((r) => r.data),
      { success: true, count: 0 } as { success: boolean; count: number; unread?: number },
    );
    return data.count ?? data.unread ?? 0;
  },
  async markRead(id: string): Promise<void> {
    await safeJson(api.patch(`/notification/${id}`, { read: true }).then(() => undefined), undefined);
  },
  async markAllRead(): Promise<void> {
    await safeJson(api.patch("/notification/read-all").then(() => undefined), undefined);
  },
};