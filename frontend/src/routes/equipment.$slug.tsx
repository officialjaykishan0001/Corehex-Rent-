import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Check, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/layout/SiteNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CategoryIcon } from "@/components/equipment/EquipmentIcon";
import { AvailabilityBadge } from "@/components/equipment/AvailabilityBadge";
import { EquipmentCard } from "@/components/equipment/EquipmentCard";
import { getCategory, getEquipmentBySlug, relatedEquipment } from "@/data/equipment";
import type { Equipment, EquipmentSpec } from "@/types/rental";
import { useBooking } from "@/components/booking/BookingProvider";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

export const Route = createFileRoute("/equipment/$slug")({
  loader: ({ params }) => {
    const item = getEquipmentBySlug(params.slug);
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.item.name} — CoreHex Rental` },
          { name: "description", content: loaderData.item.tagline },
          { property: "og:title", content: `${loaderData.item.name} — CoreHex Rental` },
          { property: "og:description", content: loaderData.item.tagline },
        ]
      : [],
  }),
  notFoundComponent: NotFound,
  errorComponent: ErrorView,
  component: EquipmentDetail,
});

function EquipmentDetail() {
  const { item } = Route.useLoaderData();
  const category = getCategory(item.category);
  const related = relatedEquipment(item.slug);
  const { openBooking } = useBooking();
  const cart = useCart();
  const disabled = item.availability === "out-of-stock";

  return (
    <div className="min-h-screen text-foreground">
      <SiteNav />
      <main className="pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link to="/equipment" className="hover:text-foreground inline-flex items-center gap-1">
              <ArrowLeft className="size-3" /> Catalog
            </Link>
            {category && (
              <>
                <span>/</span>
                <Link to="/equipment/category/$slug" params={{ slug: category.slug }} className="hover:text-foreground">
                  {category.name}
                </Link>
              </>
            )}
          </div>

          <div className="mt-6 grid lg:grid-cols-2 gap-10">
            <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-grid opacity-40" />
              <div className="absolute -top-32 -right-32 size-72 rounded-full bg-primary/30 blur-3xl" />
              <div className="relative h-80 grid place-items-center">
                <CategoryIcon category={item.category} className="size-32 text-primary-glow" />
              </div>
              <div className="relative mt-6 grid grid-cols-3 gap-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="aspect-video rounded-xl border border-border/40 bg-card/40 grid place-items-center">
                    <CategoryIcon category={item.category} className="size-6 text-primary-glow/70" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-md bg-primary/15 text-primary-glow border border-primary/20">{item.tag}</span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="size-3 fill-primary-glow text-primary-glow" /> {item.rating}
                </div>
              </div>
              <h1 className="mt-4 text-4xl font-bold">{item.name}</h1>
              <p className="mt-3 text-muted-foreground">{item.tagline}</p>
              <div className="mt-5"><AvailabilityBadge availability={item.availability} /></div>

              <div className="mt-7 grid grid-cols-3 gap-3">
                <RateCard label="Daily" amount={item.dailyRate} highlight />
                <RateCard label="Weekly" amount={item.weeklyRate} />
                <RateCard label="Monthly" amount={item.monthlyRate} />
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  size="lg"
                  disabled={disabled}
                  onClick={() => openBooking(item.slug)}
                  className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-90 disabled:opacity-50"
                >
                  {disabled ? "Currently unavailable" : "Reserve now"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="glass-card border-border/60"
                  disabled={disabled}
                  onClick={() => { cart.add(item.slug, 1); toast.success(`${item.name} added to cart`); }}
                >
                  <ShoppingCart className="size-4" /> Add to cart
                </Button>
              </div>

              <div className="mt-8">
                <h2 className="font-display font-semibold text-lg">Description</h2>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>

              <div className="mt-8">
                <h2 className="font-display font-semibold text-lg">Specifications</h2>
                <dl className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
                  {item.specs.map((s: EquipmentSpec) => (
                    <div key={s.label} className="flex justify-between gap-3 py-2 px-3 rounded-lg border border-border/40 bg-card/30">
                      <dt className="text-muted-foreground">{s.label}</dt>
                      <dd className="text-right">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="mt-8 grid sm:grid-cols-2 gap-6">
                <div>
                  <h2 className="font-display font-semibold text-lg">Features</h2>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {item.features.map((f: string) => (
                      <li key={f} className="flex items-center gap-2"><Check className="size-4 text-primary-glow" />{f}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="font-display font-semibold text-lg">Included accessories</h2>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {item.accessories.map((a: string) => (
                      <li key={a} className="flex items-center gap-2"><Check className="size-4 text-primary-glow" />{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <section className="mt-20">
              <h2 className="font-display font-semibold text-2xl">Related equipment</h2>
              <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {related.map((e: Equipment) => <EquipmentCard key={e.slug} item={e} />)}
              </div>
            </section>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function RateCard({ label, amount, highlight }: { label: string; amount: number; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 border ${highlight ? "border-primary/40 bg-gradient-to-br from-primary/15 to-card" : "border-border/40 bg-card/30"}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-display font-bold mt-1">${amount.toLocaleString()}</div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen text-foreground">
      <SiteNav />
      <main className="pt-32 pb-24 text-center px-6">
        <h1 className="text-3xl font-bold">Equipment not found</h1>
        <p className="mt-3 text-muted-foreground">We couldn&apos;t find that item in the catalog.</p>
        <Link to="/equipment" className="inline-block mt-6 px-4 py-2 rounded-md bg-primary text-primary-foreground">Back to catalog</Link>
      </main>
      <SiteFooter />
    </div>
  );
}

function ErrorView({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="min-h-screen text-foreground">
      <SiteNav />
      <main className="pt-32 pb-24 text-center px-6">
        <h1 className="text-3xl font-bold">Something went wrong</h1>
        <Button className="mt-6" onClick={() => { router.invalidate(); reset(); }}>Try again</Button>
      </main>
      <SiteFooter />
    </div>
  );
}