import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  Calendar,
  FileText,
  Boxes,
  Users,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Hexagon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/equipment", label: "Equipment", icon: Package },
  { to: "/admin/bookings", label: "Bookings", icon: Calendar },
  { to: "/admin/quotes", label: "Quotes", icon: FileText },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { logout, user } = useAdminAuth();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-sidebar/95 backdrop-blur">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
          <Hexagon className="h-5 w-5" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-display text-sm font-semibold">CoreHex</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Admin Console
          </span>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {NAV.map((item) => {
          const active =
            pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/15 text-foreground"
                  : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              {item.label}
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
            {user?.avatarInitials ?? "AD"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name ?? "Admin"}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}