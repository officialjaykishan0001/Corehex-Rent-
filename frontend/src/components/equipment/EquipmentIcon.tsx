import {
  Laptop,
  Monitor,
  Speaker,
  Projector,
  Network,
  Printer,
  Tv,
  Server,
  type LucideIcon,
} from "lucide-react";
import type { CategorySlug } from "@/types/rental";

const map: Record<CategorySlug, LucideIcon> = {
  laptops: Laptop,
  desktops: Monitor,
  "sound-systems": Speaker,
  projectors: Projector,
  networking: Network,
  printers: Printer,
  displays: Tv,
  servers: Server,
};

export function CategoryIcon({ category, className }: { category: CategorySlug; className?: string }) {
  const Icon = map[category] ?? Laptop;
  return <Icon className={className} />;
}