import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { SiteNav } from "@/components/layout/SiteNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { EquipmentCard } from "@/components/equipment/EquipmentCard";
import { CategoryIcon } from "@/components/equipment/EquipmentIcon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { categories, equipment, searchEquipment } from "@/data/equipment";
import type { CategorySlug } from "@/types/rental";

export const Route = createFileRoute("/equipment/")({
  head: () => ({
    meta: [
      { title: "Equipment Catalog — CoreHex Rental" },
      { name: "description", content: "Browse our complete catalog of laptops, desktops, AV, networking, displays, printers, and servers available to rent." },
      { property: "og:title", content: "Equipment Catalog — CoreHex Rental" },
      { property: "og:description", content: "Search and reserve enterprise-grade rental equipment." },
    ],
  }),
  component: CatalogPage,
});

function CatalogPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategorySlug | "all">("all");

  const filtered = useMemo(() => {
    const base = query ? searchEquipment(query) : equipment;
    return category === "all" ? base : base.filter((e) => e.category === category);
  }, [query, category]);

  return (
    <div className="min-h-screen text-foreground">
      <SiteNav />
      <main className="pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-xs uppercase tracking-[0.2em] text-primary-glow font-medium">Catalog</div>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold">Browse the fleet.</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Search by name, category, or specification. Reserve in seconds — we handle logistics, configuration, and on-site setup.
          </p>

          <div className="mt-8 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search laptops, projectors, Cisco, 4K…"
                className="pl-9 h-11 glass-card border-border/60"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <SlidersHorizontal className="size-4" /> {filtered.length} result{filtered.length === 1 ? "" : "s"}
            </div>
          </div>

          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
            <CategoryChip active={category === "all"} onClick={() => setCategory("all")} label="All" />
            {categories.map((c) => (
              <CategoryChip
                key={c.slug}
                active={category === c.slug}
                onClick={() => setCategory(c.slug)}
                label={c.name}
                icon={<CategoryIcon category={c.slug} className="size-3.5" />}
              />
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="mt-16 text-center py-16 glass-card rounded-2xl">
              <div className="text-lg font-display font-semibold">No equipment matched</div>
              <p className="mt-2 text-sm text-muted-foreground">Try a different search or clear filters.</p>
              <Button variant="outline" className="mt-4 glass-card border-border/60" onClick={() => { setQuery(""); setCategory("all"); }}>
                Reset filters
              </Button>
            </div>
          ) : (
            <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((e) => (
                <EquipmentCard key={e.slug} item={e} />
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function CategoryChip({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon?: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition ${
        active
          ? "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground border-transparent shadow-[var(--shadow-glow)]"
          : "glass-card text-muted-foreground hover:text-foreground border-border/60"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// Provided so the catalog header can link directly to a category page if needed
export { CategoryChip };
export const _categoriesLink = (slug: string) => `/equipment/category/${slug}`;
export function _categoryLinkComponent({ slug, children }: { slug: CategorySlug; children: React.ReactNode }) {
  return <Link to="/equipment/category/$slug" params={{ slug }}>{children}</Link>;
}