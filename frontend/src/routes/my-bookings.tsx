import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, PackageCheck, Printer } from "lucide-react";
import { SiteNav } from "@/components/layout/SiteNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { rentalApi } from "@/services/rentalApi";
import { getEquipmentBySlug } from "@/data/equipment";
import type { Booking } from "@/types/rental";
import { RequireAuth } from "@/components/auth/RequireAuth";

export const Route = createFileRoute("/my-bookings")({
  head: () => ({
    meta: [
      { title: "My bookings — CoreHex Rental" },
      { name: "description", content: "Track your rental bookings and status." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <MyBookingsPage />
    </RequireAuth>
  ),
});

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-300 border-amber-400/30",
  approved: "bg-sky-500/10 text-sky-300 border-sky-400/30",
  active: "bg-emerald-500/10 text-emerald-300 border-emerald-400/30",
  completed: "bg-zinc-500/10 text-zinc-300 border-zinc-400/30",
  rejected: "bg-rose-500/10 text-rose-300 border-rose-400/30",
  cancelled: "bg-rose-500/10 text-rose-300 border-rose-400/30",
  confirmed: "bg-emerald-500/10 text-emerald-300 border-emerald-400/30",
};

function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);

  useEffect(() => {
    rentalApi.listBookings().then(setBookings);
  }, []);

  return (
    <div className="min-h-screen text-foreground">
      <SiteNav />
      <main className="pt-28 pb-24">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-4xl font-bold">My bookings</h1>
          <p className="mt-2 text-muted-foreground">Track the status of every reservation you&apos;ve made.</p>

          {bookings === null ? (
            <div className="mt-8 space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="glass-card rounded-xl h-28 animate-pulse" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="mt-12 glass-card rounded-2xl p-16 text-center">
              <PackageCheck className="size-10 text-muted-foreground mx-auto" />
              <div className="mt-4 font-display font-semibold text-lg">No bookings yet</div>
              <p className="mt-2 text-sm text-muted-foreground">Reserve any item to see it here.</p>
              <Link to="/equipment" className="inline-block mt-6 px-4 py-2 rounded-md bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
                Browse catalog
              </Link>
            </div>
          ) : (
            <div className="mt-8 space-y-3">
              {bookings.map((b) => {
                const eq = getEquipmentBySlug(b.equipmentSlug);
                const statusKey = (b.status || "pending").toLowerCase();
                const badge = STATUS_STYLES[statusKey] ?? STATUS_STYLES.pending;
                return (
                  <div key={b.id} className="glass-card rounded-xl p-5">
                    <div className="flex flex-wrap items-start gap-5">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <code className="font-mono">{b.id}</code>
                          <span>·</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border capitalize ${badge}`}>
                            {statusKey}
                          </span>
                          {b.createdAt && (
                            <>
                              <span>·</span>
                              <span>Booked {new Date(b.createdAt).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                        <Link
                          to="/equipment/$slug"
                          params={{ slug: b.equipmentSlug }}
                          className="mt-1 font-display font-semibold text-lg hover:text-primary-glow block"
                        >
                          {eq?.name ?? b.equipmentSlug}
                        </Link>
                        <div className="mt-1 text-xs text-muted-foreground flex flex-wrap items-center gap-3">
                          <span className="inline-flex items-center gap-1"><CalendarDays className="size-3" /> {b.startDate} → {b.endDate}</span>
                          <span>Qty {b.quantity}</span>
                          {b.projectType && <span>{b.projectType}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-display font-bold text-xl">${b.estimatedCost.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">estimate</div>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Printer className="size-3" /> Print
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}