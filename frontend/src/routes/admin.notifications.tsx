import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Bell, Calendar, FileText, Boxes, Wrench, Check, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { LoadingState } from "@/components/admin/LoadingState";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { notificationService } from "@/services/admin/notification.service";
import type { NotificationKind } from "@/types/admin";

const ICONS: Record<NotificationKind, typeof Bell> = {
  booking: Calendar,
  quote: FileText,
  inventory: Boxes,
  maintenance: Wrench,
  system: Bell,
};

export const Route = createFileRoute("/admin/notifications")({
  component: AdminNotificationsPage,
});

function AdminNotificationsPage() {
  const [filter, setFilter] = useState<string>("all");
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "notifications"],
    queryFn: () => notificationService.list(),
  });

  const items = (data ?? []).filter((n) => filter === "all" || n.kind === filter);

  async function markRead(id: string) {
    await notificationService.markRead(id);
    qc.invalidateQueries({ queryKey: ["admin"] });
  }
  async function markAll() {
    await notificationService.markAllRead();
    qc.invalidateQueries({ queryKey: ["admin"] });
    toast.success("All marked as read");
  }

  return (
    <AdminLayout>
      <PageHeader
        title="Notifications"
        description="Latest activity across your operations"
        actions={
          <>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Filter" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="booking">Bookings</SelectItem>
                <SelectItem value="quote">Quotes</SelectItem>
                <SelectItem value="inventory">Inventory</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={markAll}><CheckCheck className="mr-1.5 h-4 w-4" /> Mark all read</Button>
          </>
        }
      />

      {isLoading ? <LoadingState /> : items.length === 0 ? (
        <EmptyState icon={Bell} title="You're all caught up" description="New alerts and activity will show up here." />
      ) : (
        <div className="glass-card divide-y divide-border rounded-xl">
          {items.map((n) => {
            const Icon = ICONS[n.kind];
            return (
              <div key={n.id} className={`flex items-start gap-3 px-4 py-3 ${n.read ? "opacity-70" : ""}`}>
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{n.title}</p>
                    <span className="text-[10px] text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                </div>
                {!n.read && (
                  <button onClick={() => markRead(n.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent/40 hover:text-foreground" aria-label="Mark read">
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}