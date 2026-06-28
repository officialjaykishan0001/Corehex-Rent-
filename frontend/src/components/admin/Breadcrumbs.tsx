import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

const LABELS: Record<string, string> = {
  admin: "Admin",
  dashboard: "Dashboard",
  equipment: "Equipment",
  bookings: "Bookings",
  quotes: "Quotes",
  inventory: "Inventory",
  customers: "Customers",
  analytics: "Analytics",
  notifications: "Notifications",
  settings: "Settings",
  new: "New",
  edit: "Edit",
};

export function Breadcrumbs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const parts = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
      {parts.map((p, i) => {
        const href = "/" + parts.slice(0, i + 1).join("/");
        const label = LABELS[p] ?? decodeURIComponent(p);
        const isLast = i === parts.length - 1;
        return (
          <span key={href} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3" />}
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link to={href} className="hover:text-foreground">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}