import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteNav } from "@/components/layout/SiteNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { EquipmentCard } from "@/components/equipment/EquipmentCard";
import { CategoryIcon } from "@/components/equipment/EquipmentIcon";
import { Button } from "@/components/ui/button";
import { categories, getCategory, getEquipmentByCategory } from "@/data/equipment";
import type { Equipment } from "@/types/rental";

export const Route = createFileRoute("/equipment/category/$slug")({
  loader: ({ params }) => {
    const category = getCategory(params.slug);
    if (!category) throw notFound();
    return { category, items: getEquipmentByCategory(params.slug) };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.category.name} Rentals — CoreHex` },
          { name: "description", content: `Rent ${loaderData.category.name.toLowerCase()} — ${loaderData.category.description}.` },
          { property: "og:title", content: `${loaderData.category.name} Rentals — CoreHex` },
          { property: "og:description", content: loaderData.category.description },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen text-foreground">
      <SiteNav />
      <main className="pt-32 pb-24 text-center px-6">
        <h1 className="text-3xl font-bold">Category not found</h1>
        <Link to="/equipment" className="inline-block mt-6 px-4 py-2 rounded-md bg-primary text-primary-foreground">Browse catalog</Link>
      </main>
      <SiteFooter />
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="min-h-screen text-foreground">
      <SiteNav />
      <main className="pt-32 pb-24 text-center px-6">
        <h1 className="text-3xl font-bold">Something went wrong</h1>
        <Button className="mt-6" onClick={reset}>Try again</Button>
      </main>
    </div>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { category, items } = Route.useLoaderData();

  return (
    <div className="min-h-screen text-foreground">
      <SiteNav />
      <main className="pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <Link to="/equipment" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="size-3" /> All equipment
          </Link>

          <div className="mt-6 flex items-start gap-5">
            <div className="size-14 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 grid place-items-center shadow-[var(--shadow-glow)]">
              <CategoryIcon category={category.slug} className="size-6 text-primary-glow" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-primary-glow font-medium">Category</div>
              <h1 className="mt-1 text-4xl md:text-5xl font-bold">{category.name}</h1>
              <p className="mt-2 text-muted-foreground">{category.description}</p>
            </div>
          </div>

          <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
            {categories.map((c) => (
              <Link
                key={c.slug}
                to="/equipment/category/$slug"
                params={{ slug: c.slug }}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition ${
                  c.slug === category.slug
                    ? "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground border-transparent shadow-[var(--shadow-glow)]"
                    : "glass-card text-muted-foreground hover:text-foreground border-border/60"
                }`}
              >
                <CategoryIcon category={c.slug} className="size-3.5" />
                {c.name}
              </Link>
            ))}
          </div>

          {items.length === 0 ? (
            <div className="mt-16 text-center py-16 glass-card rounded-2xl">
              <div className="text-lg font-display font-semibold">No equipment listed yet</div>
              <p className="mt-2 text-sm text-muted-foreground">Check back soon or request a custom quote.</p>
            </div>
          ) : (
            <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((e: Equipment) => <EquipmentCard key={e.slug} item={e} />)}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}