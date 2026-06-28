import type { Availability } from "@/types/rental";

const STYLES: Record<Availability, { label: string; cls: string; dot: string }> = {
  available: {
    label: "Available",
    cls: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  limited: {
    label: "Limited stock",
    cls: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    dot: "bg-amber-400",
  },
  "out-of-stock": {
    label: "Out of stock",
    cls: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    dot: "bg-rose-400",
  },
};

export function AvailabilityBadge({ availability }: { availability: Availability }) {
  const s = STYLES[availability];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border ${s.cls}`}>
      <span className={`size-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}