import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  Calendar,
  Clock,
  DollarSign,
  Gauge,
  Boxes,
  ArrowRight,
  AlertTriangle,
  FileText,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { KpiCard } from "@/components/admin/KpiCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { LoadingState } from "@/components/admin/LoadingState";
import { analyticsService } from "@/services/admin/analytics.service";
import { bookingService } from "@/services/admin/booking.service";
import { quoteService } from "@/services/admin/quote.service";
import { inventoryService } from "@/services/admin/inventory.service";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboardPage,
});

function fmtMoney(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function AdminDashboardPage() {
  const overview = useQuery({ queryKey: ["admin", "overview"], queryFn: () => analyticsService.overview() });
  const trends = useQuery({ queryKey: ["admin", "trends", "monthly"], queryFn: () => analyticsService.trends("monthly") });
  const cats = useQuery({ queryKey: ["admin", "cats"], queryFn: () => analyticsService.categoryPerformance() });
  const bookings = useQuery({ queryKey: ["admin", "bookings"], queryFn: () => bookingService.list() });
  const quotes = useQuery({ queryKey: ["admin", "quotes"], queryFn: () => quoteService.list() });
  const inv = useQuery({ queryKey: ["admin", "inv"], queryFn: () => inventoryService.summary() });

  return (
    <AdminLayout>
      <PageHeader title="Dashboard" description="Live overview of your rental operations" />

      {overview.isLoading ? (
        <LoadingState />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <KpiCard label="Total Equipment" value={overview.data?.totalEquipment ?? 0} icon={Package} hint="Active listings" />
          <KpiCard label="Active Rentals" value={overview.data?.activeRentals ?? 0} icon={Calendar} accent="success" />
          <KpiCard label="Pending Requests" value={overview.data?.pendingBookings ?? 0} icon={Clock} accent="warning" />
          <KpiCard label="Monthly Revenue" value={fmtMoney(overview.data?.monthlyRevenue ?? 0)} icon={DollarSign} trend={{ value: 12, positive: true }} />
          <KpiCard label="Utilization" value={`${overview.data?.utilization ?? 0}%`} icon={Gauge} accent="primary" />
          <KpiCard label="Available Inventory" value={overview.data?.availableInventory ?? 0} icon={Boxes} accent="success" />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="glass-card xl:col-span-2 rounded-xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold">Revenue trend</h3>
            <span className="text-xs text-muted-foreground">Last 12 months</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={trends.data ?? []}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(220 90% 60%)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(220 90% 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "oklch(0.21 0.025 262)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(220 90% 60%)" fill="url(#rev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold">Category performance</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={cats.data ?? []}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="category" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-25} textAnchor="end" height={50} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "oklch(0.21 0.025 262)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Bar dataKey="bookings" fill="hsl(220 90% 60%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="glass-card xl:col-span-2 rounded-xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold">Recent bookings</h3>
            <Link to="/admin/bookings" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {(bookings.data ?? []).slice(0, 5).map((b) => (
              <Link
                key={b.id}
                to="/admin/bookings/$id"
                params={{ id: b.id }}
                className="flex items-center justify-between gap-3 py-3 text-sm hover:bg-accent/30 -mx-2 px-2 rounded-md transition-colors"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{b.name} · <span className="text-muted-foreground">{b.company}</span></p>
                  <p className="truncate text-xs text-muted-foreground">{b.id} · {fmtMoney(b.estimatedCost)}</p>
                </div>
                <StatusBadge status={b.status} />
              </Link>
            ))}
            {(bookings.data ?? []).length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No bookings yet</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card rounded-xl p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-base font-semibold">Recent quotes</h3>
              <Link to="/admin/quotes" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {(quotes.data ?? []).slice(0, 4).map((q) => (
                <div key={q.id} className="flex items-start gap-2 text-sm">
                  <FileText className="mt-0.5 h-4 w-4 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{q.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{q.company} · {q.items.length} items</p>
                  </div>
                  <StatusBadge status={q.status} />
                </div>
              ))}
              {(quotes.data ?? []).length === 0 && (
                <p className="py-2 text-center text-xs text-muted-foreground">No quote requests yet</p>
              )}
            </div>
          </div>

          <div className="glass-card rounded-xl p-5">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <h3 className="font-display text-base font-semibold">Inventory alerts</h3>
            </div>
            <div className="space-y-2 text-sm">
              {[...(inv.data?.outOfStock ?? []).slice(0, 2), ...(inv.data?.lowStock ?? []).slice(0, 3)].map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-2">
                  <span className="truncate">{e.name}</span>
                  <StatusBadge status={e.availableQuantity === 0 ? "out-of-stock" : "pending"} />
                </div>
              ))}
              {(inv.data?.outOfStock.length ?? 0) + (inv.data?.lowStock.length ?? 0) === 0 && (
                <p className="text-xs text-muted-foreground">All inventory healthy.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}