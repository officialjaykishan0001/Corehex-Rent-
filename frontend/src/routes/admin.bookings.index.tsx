import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Calendar, Eye, Search } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { LoadingState } from "@/components/admin/LoadingState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bookingService } from "@/services/admin/booking.service";
import type { BookingStatus } from "@/types/admin";

export const Route = createFileRoute("/admin/bookings/")({
  component: AdminBookingsPage,
});

function fmtMoney(n: number) {
  return new Intl.NumberFormat("en-IN", { 
    style: "currency", 
    currency: "INR", 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  }).format(n);
}

function AdminBookingsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: () => bookingService.list(),
  });

  const filtered = useMemo(() => {
    const items = data ?? [];
    const term = q.trim().toLowerCase();
    return items.filter((b) => {
      if (status !== "all" && b.status !== status) return false;
      if (from && new Date(b.createdAt) < new Date(from)) return false;
      if (to && new Date(b.createdAt) > new Date(to + "T23:59:59")) return false;
      if (!term) return true;
      return (
        b.name.toLowerCase().includes(term) ||
        b.company.toLowerCase().includes(term) ||
        b.email.toLowerCase().includes(term) ||
        b.id.toLowerCase().includes(term)
      );
    });
  }, [data, q, status, from, to]);

  async function setStatusFor(id: string, s: BookingStatus) {
    try {
      await bookingService.setStatus(id, s);
      toast.success(`Booking ${s}`);
      qc.invalidateQueries({ queryKey: ["admin"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <AdminLayout>
      <PageHeader title="Bookings" description="Review and manage all rental bookings" />

      <div className="glass-card rounded-xl p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_160px_160px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, company, ID…"
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              {["all","pending","approved","active","completed","rejected","cancelled"].map((s) => (
                <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>

        <div className="mt-4 overflow-x-auto">
          {isLoading ? (
            <LoadingState />
          ) : filtered.length === 0 ? (
            <EmptyState icon={Calendar} title="No bookings" description="Bookings will appear here once customers reserve equipment." />
          ) : (
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">ID</th>
                  <th className="py-2 pr-3 font-medium">Customer</th>
                  <th className="py-2 pr-3 font-medium">Equipment</th>
                  <th className="py-2 pr-3 font-medium">Period</th>
                  <th className="py-2 pr-3 font-medium">Qty</th>
                  <th className="py-2 pr-3 font-medium">Total</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-accent/20">
                    <td className="py-3 pr-3 font-mono text-xs">{b.id}</td>
                    <td className="py-3 pr-3">
                      <div className="font-medium">{b.name}</div>
                      <div className="text-xs text-muted-foreground">{b.company}</div>
                    </td>
                    <td className="py-3 pr-3">{b.equipmentSlug}</td>
                    <td className="py-3 pr-3 text-xs">{b.startDate} → {b.endDate}</td>
                    <td className="py-3 pr-3">{b.quantity}</td>
                    <td className="py-3 pr-3">{fmtMoney(b.estimatedCost)}</td>
                    <td className="py-3 pr-3"><StatusBadge status={b.status} /></td>
                    <td className="py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        {b.status === "pending" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => setStatusFor(b.id, "approved")}>Approve</Button>
                            <Button size="sm" variant="ghost" onClick={() => setStatusFor(b.id, "rejected")}>Reject</Button>
                          </>
                        )}
                        <Link
                          to="/admin/bookings/$id"
                          params={{ id: b.id }}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}