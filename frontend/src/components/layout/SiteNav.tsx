import { Link, useNavigate } from "@tanstack/react-router";
import { Sparkles, ShoppingCart, Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useBooking } from "@/components/booking/BookingProvider";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from  '@/assets/logo.png';


export function SiteNav() {
  const cart = useCart();
  const { openQuote } = useBooking();
  const { isAuthenticated, user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const initials = (user?.name || user?.email || "?")
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleLogout() {
    try {
      await logout();
      toast.success("Signed out");
      navigate({ to: "/" });
    } catch {
      toast.error("Could not sign out");
    }
  }

  return (
    <header className="fixed top-0 inset-x-0 z-40 border-b border-border/40 backdrop-blur-xl bg-background/60">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
         <Link to="/" className="flex items-center gap-1">  
            <img src={logo} alt="CoreHex Rental" className="size-12 rounded-lg" />
          <span className="font-display font-semibold tracking-tight">CoreHex Rental</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <Link to="/equipment" className="hover:text-foreground transition" activeProps={{ className: "text-foreground" }}>
            Catalog
          </Link>
          <Link to="/" hash="categories" className="hover:text-foreground transition">Categories</Link>
          <Link to="/" hash="process" className="hover:text-foreground transition">How it works</Link>
          {isAuthenticated && (
            <Link to="/my-bookings" className="hover:text-foreground transition" activeProps={{ className: "text-foreground" }}>
              My bookings
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/cart" aria-label="Open cart" className="relative inline-flex items-center justify-center size-9 rounded-md border border-border/60 hover:bg-accent/40 transition">
            <ShoppingCart className="size-4" />
            {cart.count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground text-[10px] font-semibold grid place-items-center">
                {cart.count}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden sm:inline-flex items-center gap-2 h-9 pl-1 pr-3 rounded-md border border-border/60 hover:bg-accent/40 transition">
                  <span className="size-7 rounded-md bg-gradient-to-br from-primary to-primary-glow text-primary-foreground grid place-items-center text-[11px] font-semibold">
                    {initials}
                  </span>
                  <span className="text-sm max-w-[8rem] truncate">{user?.name || user?.email}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/my-bookings"><UserIcon className="size-4" /> My bookings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openQuote()}>Request a quote</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center justify-center h-9 px-3 rounded-md text-sm text-muted-foreground hover:text-foreground transition"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center h-9 px-3 rounded-md text-sm bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-90"
              >
                Register
              </Link>
            </div>
          )}
          <button
            className="md:hidden inline-flex size-9 items-center justify-center rounded-md border border-border/60"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
          <div className="px-6 py-4 flex flex-col gap-3 text-sm">
            <Link to="/equipment" onClick={() => setOpen(false)}>Catalog</Link>
            <Link to="/" hash="categories" onClick={() => setOpen(false)}>Categories</Link>
            <Link to="/" hash="pricing" onClick={() => setOpen(false)}>Pricing</Link>
            {isAuthenticated && (
              <Link to="/my-bookings" onClick={() => setOpen(false)}>My bookings</Link>
            )}
            <Link to="/cart" onClick={() => setOpen(false)}>Cart ({cart.count})</Link>
            {isAuthenticated ? (
              <>
                <div className="text-xs text-muted-foreground truncate">Signed in as {user?.email}</div>
                <Button size="sm" variant="outline" onClick={() => { setOpen(false); openQuote(); }}>
                  Request a quote
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setOpen(false); handleLogout(); }}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="text-muted-foreground">Sign in</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="inline-flex items-center justify-center h-9 px-3 rounded-md text-sm bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}