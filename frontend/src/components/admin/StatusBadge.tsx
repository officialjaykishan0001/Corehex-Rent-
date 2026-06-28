import { cn } from "@/lib/utils";
import type { BookingStatus, QuoteStatus, EquipmentStatus } from "@/types/admin";

type Status = BookingStatus | QuoteStatus | EquipmentStatus | string;

const STYLES: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  approved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  active: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  completed: "bg-primary/15 text-primary border-primary/30",
  rejected: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  cancelled: "bg-muted text-muted-foreground border-border",
  new: "bg-primary/15 text-primary border-primary/30",
  contacted: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  quoted: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  converted: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  closed: "bg-muted text-muted-foreground border-border",
  draft: "bg-muted text-muted-foreground border-border",
  "out-of-stock": "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize",
        STYLES[status] ?? "bg-muted text-muted-foreground border-border",
      )}
    >
      {String(status).replace(/-/g, " ")}
    </span>
  );
}