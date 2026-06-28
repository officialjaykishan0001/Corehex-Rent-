import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, PackageCheck } from "lucide-react";
import { SiteNav } from "@/components/layout/SiteNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { rentalApi } from "@/services/rentalApi";
import { getEquipmentBySlug } from "@/data/equipment";
import type { Booking } from "@/types/rental";
import { RequireAuth } from "@/components/auth/RequireAuth";

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "My bookings — CoreHex Rental" },
      { name: "description", content: "View your reservations and rental history." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <BookingsPage />
    </RequireAuth>
  ),
});

function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);

  useEffect(() => {
    rentalApi.listBookings().then(setBookings);
    function onStorage() {
      rentalApi.listBookings().then(setBookings);
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <div className="min-h-screen text-foreground">
      <SiteNav />
      <main className="pt-28 pb-24">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-4xl font-bold">My bookings</h1>
          <p className="mt-2 text-muted-foreground">All your confirmed reservations in one place.</p>

          {bookings === null ? (
            <div className="mt-8 space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="glass-card rounded-xl h-24 animate-pulse" />
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
                return (
                  <div key={b.id} className="glass-card rounded-xl p-5 flex flex-wrap items-center gap-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <code className="font-mono">{b.id}</code>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1 text-emerald-300"><span className="size-1.5 rounded-full bg-emerald-400" /> {b.status}</span>
                      </div>
                      <Link to="/equipment/$slug" params={{ slug: b.equipmentSlug }} className="mt-1 font-display font-semibold text-lg hover:text-primary-glow block">
                        {eq?.name ?? b.equipmentSlug}
                      </Link>
                      <div className="mt-1 text-xs text-muted-foreground flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1"><CalendarDays className="size-3" /> {b.startDate} → {b.endDate}</span>
                        <span>Qty {b.quantity}</span>
                        <span>{b.projectType}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-bold text-xl">${b.estimatedCost.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">estimate</div>
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