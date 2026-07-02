import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Users, Mail, Phone } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { LoadingState } from "@/components/admin/LoadingState";
import { Input } from "@/components/ui/input";
import { customerService } from "@/services/admin/customer.service";
import type { Customer } from "@/types/admin";

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomersPage,
});

function AdminCustomersPage() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: () => customerService.list(),
  });
  const history = useQuery({
    enabled: !!selected,
    queryKey: ["admin", "customer-history", selected?.email],
    queryFn: () => customerService.historyFor(selected!.email),
  });

  const filtered = useMemo(() => {
    const items = data ?? [];
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter((c) =>
      c.name.toLowerCase().includes(t) || c.company.toLowerCase().includes(t) || c.email.toLowerCase().includes(t),
    );
  }, [data, q]);

  
  function fmtMoney(n: number) {
  return new Intl.NumberFormat("en-IN", { 
    style: "currency", 
    currency: "INR", 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  }).format(n);
}

  return (
    <AdminLayout>
      <PageHeader title="Customers" description="Your customer book and lifetime value" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="glass-card rounded-xl p-4">
          <Input placeholder="Search customers…" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="mt-4 overflow-x-auto">
            {isLoading ? <LoadingState /> : filtered.length === 0 ? (
              <EmptyState icon={Users} title="No customers yet" description="Customers appear once they book or request a quote." />
            ) : (
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Customer</th>
                    <th className="py-2 pr-3 font-medium">Company</th>
                    <th className="py-2 pr-3 font-medium">Bookings</th>
                    <th className="py-2 pr-3 font-medium">LTV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((c) => (
                    <tr key={c.id} onClick={() => setSelected(c)} className="cursor-pointer hover:bg-accent/20">
                      <td className="py-3 pr-3">
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                      </td>
                      <td className="py-3 pr-3">{c.company}</td>
                      <td className="py-3 pr-3">{c.totalBookings}</td>
                      <td className="py-3 pr-3">{fmtMoney(c.lifetimeRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="glass-card rounded-xl p-5">
          {!selected ? (
            <p className="text-sm text-muted-foreground">Select a customer to view profile.</p>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-base font-semibold text-primary">
                  {selected.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="font-display text-lg font-semibold">{selected.name}</p>
                  <p className="text-xs text-muted-foreground">{selected.company}</p>
                </div>
              </div>
              <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                <p className="inline-flex items-center gap-2"><Mail className="h-4 w-4" />{selected.email}</p>
                <p className="inline-flex items-center gap-2"><Phone className="h-4 w-4" />{selected.phone}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md border border-border p-3"><p className="text-xs text-muted-foreground">Bookings</p><p className="font-semibold">{selected.totalBookings}</p></div>
                <div className="rounded-md border border-border p-3"><p className="text-xs text-muted-foreground">Lifetime</p>
                <p className="font-semibold">{fmtMoney(selected.lifetimeRevenue)}</p></div>
              </div>

              <div className="mt-4">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground">Booking history</h4>
                <ul className="mt-2 space-y-1 text-sm">
                  {(history.data?.bookings ?? []).slice(0, 5).map((b) => (
                    <li key={b.id} className="flex justify-between"><span className="font-mono text-xs">{b.id}</span><span>{fmtMoney(b.estimatedCost)}</span></li>
                  ))}
                  {(history.data?.bookings ?? []).length === 0 && <li className="text-xs text-muted-foreground">No bookings yet</li>}
                </ul>
              </div>

              <div className="mt-4">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground">Quote history</h4>
                <ul className="mt-2 space-y-1 text-sm">
                  {(history.data?.quotes ?? []).slice(0, 5).map((q) => (
                    <li key={q.id} className="flex justify-between"><span>{q.reference}</span><span>{q.items.length} items</span></li>
                  ))}
                  {(history.data?.quotes ?? []).length === 0 && <li className="text-xs text-muted-foreground">No quotes yet</li>}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}