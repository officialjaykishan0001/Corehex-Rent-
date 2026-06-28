import type { Category, Equipment } from "@/types/rental";

export const categories: Category[] = [
  { slug: "laptops", name: "Laptops", description: "Ultrabooks, workstations, MacBooks", iconKey: "Laptop" },
  { slug: "desktops", name: "Desktops", description: "Towers, all-in-ones, mini PCs", iconKey: "Monitor" },
  { slug: "sound-systems", name: "Sound Systems", description: "PA, line array, conference", iconKey: "Speaker" },
  { slug: "projectors", name: "Projectors", description: "4K, short-throw, laser", iconKey: "Projector" },
  { slug: "networking", name: "Networking", description: "Routers, switches, access points", iconKey: "Network" },
  { slug: "printers", name: "Printers", description: "Laser, inkjet, multifunction", iconKey: "Printer" },
  { slug: "displays", name: "LED Displays", description: "Indoor, outdoor, video walls", iconKey: "Tv" },
  { slug: "servers", name: "Servers", description: "Rack, edge, GPU compute", iconKey: "Server" },
];

// Equipment is hydrated from the API at app boot. Accessors read from this
// mutable module-level cache so existing synchronous loaders keep working.
export const equipment: Equipment[] = [];

let hydratePromise: Promise<Equipment[]> | null = null;

export function setEquipmentCache(items: Equipment[]) {
  equipment.length = 0;
  equipment.push(...items);
}

export async function hydrateEquipment(force = false): Promise<Equipment[]> {
  if (!force && equipment.length > 0) return equipment;
  if (!hydratePromise) {
    // Dynamic import to avoid a circular dependency at module load.
    hydratePromise = import("@/services/equipment.service")
      .then(({ equipmentApi }) => equipmentApi.listEquipment())
      .then((items) => {
        setEquipmentCache(items);
        return equipment;
      })
      .catch((err) => {
        console.error("[equipment] hydrate failed", err);
        return equipment;
      })
      .finally(() => {
        hydratePromise = null;
      });
  }
  return hydratePromise;
}

export function getEquipmentBySlug(slug: string): Equipment | undefined {
  return equipment.find((e) => e.slug === slug);
}

export function getEquipmentByCategory(slug: string): Equipment[] {
  return equipment.filter((e) => e.category === slug);
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function searchEquipment(query: string): Equipment[] {
  const q = query.trim().toLowerCase();
  if (!q) return equipment;
  return equipment.filter((e) => {
    if (e.name.toLowerCase().includes(q)) return true;
    if (e.category.toLowerCase().includes(q)) return true;
    if (e.tag.toLowerCase().includes(q)) return true;
    if (e.tagline.toLowerCase().includes(q)) return true;
    if (e.specs.some((s) => `${s.label} ${s.value}`.toLowerCase().includes(q))) return true;
    return false;
  });
}

export function relatedEquipment(slug: string, limit = 3): Equipment[] {
  const item = getEquipmentBySlug(slug);
  if (!item) return [];
  return equipment.filter((e) => e.category === item.category && e.slug !== slug).slice(0, limit);
}
