import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import { BookingDialog } from "./BookingDialog";
import { QuoteDialog } from "./QuoteDialog";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const PENDING_BOOKING_KEY = "corehex.pendingBooking";
const PENDING_QUOTE_KEY = "corehex.pendingQuote";

interface BookingContextValue {
  openBooking: (slug: string) => void;
  openQuote: (slugs?: string[]) => void;
}

const Ctx = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookingSlug, setBookingSlug] = useState<string | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteSeed, setQuoteSeed] = useState<string[] | undefined>(undefined);
  const { isAuthenticated, loading } = useAdminAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const openBooking = useCallback((slug: string) => {
    if (!isAuthenticated) {
      try {
        sessionStorage.setItem(PENDING_BOOKING_KEY, JSON.stringify({ slug, ts: Date.now() }));
      } catch { /* ignore */ }
      toast.message("Please sign in to continue with your booking.");
      const redirect = pathname && pathname !== "/login" && pathname !== "/register"
        ? pathname
        : `/equipment/${slug}`;
      navigate({ to: "/login", search: { redirect } });
      return;
    }
    setBookingSlug(slug);
  }, [isAuthenticated, navigate, pathname]);

  const openQuote = useCallback((slugs?: string[]) => {
    if (!isAuthenticated) {
      try {
        sessionStorage.setItem(PENDING_QUOTE_KEY, JSON.stringify({ slugs: slugs ?? [], ts: Date.now() }));
      } catch { /* ignore */ }
      toast.message("Please sign in to request a quote.");
      const redirect = pathname && pathname !== "/login" && pathname !== "/register" ? pathname : "/equipment";
      navigate({ to: "/login", search: { redirect } });
      return;
    }
    setQuoteSeed(slugs);
    setQuoteOpen(true);
  }, [isAuthenticated, navigate, pathname]);

  // After login, restore any pending booking / quote intent
  useEffect(() => {
    if (loading || !isAuthenticated) return;
    try {
      const raw = sessionStorage.getItem(PENDING_BOOKING_KEY);
      if (raw) {
        const { slug } = JSON.parse(raw) as { slug: string };
        sessionStorage.removeItem(PENDING_BOOKING_KEY);
        if (slug) setBookingSlug(slug);
        return;
      }
      const rawQ = sessionStorage.getItem(PENDING_QUOTE_KEY);
      if (rawQ) {
        const { slugs } = JSON.parse(rawQ) as { slugs: string[] };
        sessionStorage.removeItem(PENDING_QUOTE_KEY);
        setQuoteSeed(slugs.length ? slugs : undefined);
        setQuoteOpen(true);
      }
    } catch { /* ignore */ }
  }, [isAuthenticated, loading]);

  return (
    <Ctx.Provider value={{ openBooking, openQuote }}>
      {children}
      <BookingDialog
        slug={bookingSlug}
        open={!!bookingSlug}
        onOpenChange={(o) => !o && setBookingSlug(null)}
      />
      <QuoteDialog open={quoteOpen} onOpenChange={setQuoteOpen} seedSlugs={quoteSeed} />
    </Ctx.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}