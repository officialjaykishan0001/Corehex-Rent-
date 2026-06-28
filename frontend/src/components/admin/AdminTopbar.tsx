import { useEffect, useState } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Bell, Menu, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { notificationService } from "@/services/admin/notification.service";
import { Breadcrumbs } from "./Breadcrumbs";

export function AdminTopbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const [unread, setUnread] = useState(0);
  const [q, setQ] = useState("");
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    notificationService.unreadCount().then((c) => alive && setUnread(c));
    return () => {
      alive = false;
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <button
        onClick={onOpenSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-border lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>
      <div className="hidden flex-1 md:block">
        <Breadcrumbs />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) navigate({ to: "/admin/equipment", search: { q } });
        }}
        className="relative ml-auto hidden w-72 md:block"
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search equipment, bookings…"
          className="h-9 pl-9"
        />
      </form>
      <Link
        to="/admin/notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Link>
    </header>
  );
}