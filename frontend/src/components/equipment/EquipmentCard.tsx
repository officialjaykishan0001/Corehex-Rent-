import { Link } from "@tanstack/react-router";
import { Star, Check, ShoppingCart, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "./EquipmentIcon";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { useCart } from "@/hooks/useCart";
import { useBooking } from "@/components/booking/BookingProvider";
import type { Equipment } from "@/types/rental";
import { toast } from "sonner";


export function EquipmentCard({ item }: { item: Equipment }) {
  const cart = useCart();
  const { openBooking } = useBooking();
  const disabled = item.availability === "out-of-stock";

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col hover:border-primary/40 transition group">
      <div className="flex items-center justify-between">
        <span className="text-xs px-2 py-1 rounded-md bg-primary/15 text-primary-glow border border-primary/20">
          {item.tag}
        </span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3 fill-primary-glow text-primary-glow" /> {item.rating}
        </div>
      </div>
      <Link
        to="/equipment/$slug"
        params={{ slug: item.slug }}
        className="mt-6 h-32 rounded-xl bg-gradient-to-br from-primary/15 via-card to-background border border-border/40 grid place-items-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid opacity-50" />
        <CategoryIcon category={item.category} className="size-10 text-primary-glow relative" />
      </Link>
      <Link
        to="/equipment/$slug"
        params={{ slug: item.slug }}
        className="mt-5 font-display font-semibold text-lg hover:text-primary-glow transition"
      >
        {item.name}
      </Link>
      <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground flex-1">
        {item.specs.slice(0, 3).map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <Check className="size-3.5 text-primary-glow shrink-0" />
            <span className="truncate">{s.value}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <AvailabilityBadge availability={item.availability} />
      </div>
      <div className="mt-5 pt-5 border-t border-border/40 flex items-center justify-between gap-3">
        <div>
          <div className="text-2xl font-display font-semibold flex gap-0 items-center">
             <IndianRupee size={24} color="white" />
            {item.dailyRate}
          </div>
          <div className="text-xs text-muted-foreground">per day</div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            className="glass-card border-border/60"
            aria-label="Add to cart"
            disabled={disabled}
            onClick={() => {
              cart.add(item.slug, 1);
              toast.success(`${item.name} added to cart`);
            }}
          >
            <ShoppingCart className="size-4" />
          </Button>
          <Button
            size="sm"
            disabled={disabled}
            onClick={() => openBooking(item.slug)}
            className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {disabled ? "Unavailable" : "Reserve"}
          </Button>
        </div>
      </div>
    </div>
  );
}