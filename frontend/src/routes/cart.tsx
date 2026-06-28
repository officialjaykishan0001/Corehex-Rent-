import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/layout/SiteNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useCart } from "@/hooks/useCart";
import { useBooking } from "@/components/booking/BookingProvider";
import { CategoryIcon } from "@/components/equipment/EquipmentIcon";
import { getEquipmentBySlug } from "@/data/equipment";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your rental cart — CoreHex Rental" },
      { name: "description", content: "Review your selected rental equipment and request a quote or proceed to reservation." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const { openQuote, openBooking } = useBooking();

  return (
    <div className="min-h-screen text-foreground">
      <SiteNav />
      <main className="pt-28 pb-24">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-4xl font-bold">Your rental cart</h1>
          <p className="mt-2 text-muted-foreground">Review items, then request a quote or reserve individually.</p>

          {cart.items.length === 0 ? (
            <div className="mt-12 glass-card rounded-2xl p-16 text-center">
              <ShoppingCart className="size-10 text-muted-foreground mx-auto" />
              <div className="mt-4 font-display font-semibold text-lg">Your cart is empty</div>
              <p className="mt-2 text-sm text-muted-foreground">Browse the catalog and add equipment to get started.</p>
              <Link to="/equipment" className="inline-block mt-6 px-4 py-2 rounded-md bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
                Browse catalog
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-3">
                {cart.items.map((i) => {
                  const eq = getEquipmentBySlug(i.slug);
                  if (!eq) return null;
                  return (
                    <div key={i.slug} className="glass-card rounded-xl p-4 flex items-center gap-4">
                      <div className="size-14 rounded-lg bg-gradient-to-br from-primary/20 to-card border border-border/40 grid place-items-center shrink-0">
                        <CategoryIcon category={eq.category} className="size-6 text-primary-glow" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link to="/equipment/$slug" params={{ slug: eq.slug }} className="font-display font-semibold hover:text-primary-glow truncate block">
                          {eq.name}
                        </Link>
                        <div className="text-xs text-muted-foreground">${eq.dailyRate}/day</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="outline" className="size-7" onClick={() => cart.setQuantity(i.slug, i.quantity - 1)}><Minus className="size-3" /></Button>
                        <span className="w-8 text-center text-sm">{i.quantity}</span>
                        <Button size="icon" variant="outline" className="size-7" onClick={() => cart.setQuantity(i.slug, i.quantity + 1)}><Plus className="size-3" /></Button>
                      </div>
                      <div className="hidden sm:block text-right w-24">
                        <div className="font-display font-semibold">${(eq.dailyRate * i.quantity).toLocaleString()}</div>
                        <div className="text-[10px] text-muted-foreground">per day</div>
                      </div>
                      <Button size="icon" variant="ghost" aria-label="Remove" onClick={() => cart.remove(i.slug)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>

              <aside className="glass-card rounded-2xl p-6 h-fit">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Estimate</div>
                <div className="mt-2 text-3xl font-display font-bold">${cart.estimatedDailyTotal.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">per day, before delivery & installation</div>

                <div className="mt-6 space-y-2">
                  <Button className="w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground" onClick={() => openQuote(cart.items.map((i) => i.slug))}>
                    Request quote for cart
                  </Button>
                  <Button variant="outline" className="w-full glass-card border-border/60" onClick={() => { if (cart.items[0]) openBooking(cart.items[0].slug); }}>
                    Reserve first item
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={cart.clear}>Clear cart</Button>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}