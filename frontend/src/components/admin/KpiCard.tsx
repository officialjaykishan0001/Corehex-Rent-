import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  icon: Icon,
  hint,
  trend,
  accent = "primary",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  trend?: { value: number; positive?: boolean };
  accent?: "primary" | "success" | "warning" | "danger";
}) {
  const accentMap = {
    primary: "from-primary/30 to-primary/0 text-primary",
    success: "from-emerald-500/30 to-emerald-500/0 text-emerald-400",
    warning: "from-amber-500/30 to-amber-500/0 text-amber-400",
    danger: "from-rose-500/30 to-rose-500/0 text-rose-400",
  } as const;
  return (
    <div className="glass-card relative overflow-hidden rounded-xl p-5">
      <div
        className={cn(
          "absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br opacity-50 blur-2xl",
          accentMap[accent],
        )}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-display text-2xl font-semibold">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg bg-background/40 border border-border", accentMap[accent].split(" ").pop())}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend && (
        <p
          className={cn(
            "relative mt-3 text-xs font-medium",
            trend.positive ? "text-emerald-400" : "text-rose-400",
          )}
        >
          {trend.positive ? "▲" : "▼"} {Math.abs(trend.value)}% vs. last period
        </p>
      )}
    </div>
  );
}