import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { categories } from "@/data/equipment";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 py-12 mt-12">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-gradient-to-br from-primary to-primary-glow grid place-items-center">
              <Sparkles className="size-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-foreground">CoreHex Rental</span>
          </div>
          <p className="mt-3 text-muted-foreground text-xs">
            Enterprise IT & AV rentals with 24/7 SLAs and a dashboard that just works.
          </p>
        </div>
        <div>
          <div className="font-display font-medium text-foreground mb-3">Catalog</div>
          <ul className="space-y-2 text-muted-foreground">
            {categories.slice(0, 4).map((c) => (
              <li key={c.slug}>
                <Link to="/equipment/category/$slug" params={{ slug: c.slug }} className="hover:text-foreground transition">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-display font-medium text-foreground mb-3">More categories</div>
          <ul className="space-y-2 text-muted-foreground">
            {categories.slice(4).map((c) => (
              <li key={c.slug}>
                <Link to="/equipment/category/$slug" params={{ slug: c.slug }} className="hover:text-foreground transition">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-display font-medium text-foreground mb-3">Company</div>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/" hash="process" className="hover:text-foreground transition">How it works</Link></li>
            <li><Link to="/" hash="pricing" className="hover:text-foreground transition">Pricing</Link></li>
            <li><Link to="/" hash="faq" className="hover:text-foreground transition">FAQ</Link></li>
            <li><Link to="/" hash="contact" className="hover:text-foreground transition">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-border/40 flex flex-col md:flex-row gap-3 items-center justify-between text-xs text-muted-foreground">
        <div>© {new Date().getFullYear()} CoreHex Rental. All rights reserved.</div>
        <div className="flex gap-6">
          <Link to="/" hash="faq" className="hover:text-foreground transition">Privacy</Link>
          <Link to="/" hash="faq" className="hover:text-foreground transition">Terms</Link>
          <Link to="/" hash="faq" className="hover:text-foreground transition">Security</Link>
          <span>SOC 2 · ISO 27001 · GDPR</span>
        </div>
      </div>
    </footer>
  );
}