import heroImage from "@/assets/hero-equipment.jpg";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useState, forwardRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { categories as catalogCategories, equipment as allEquipment } from "@/data/equipment";
import { CategoryIcon } from "@/components/equipment/EquipmentIcon";
import { EquipmentCard } from "@/components/equipment/EquipmentCard";
import { useBooking } from "@/components/booking/BookingProvider";
import { SiteNav } from "@/components/layout/SiteNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { rentalApi } from "@/services/rentalApi";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  Check,
  Shield,
  Zap,
  Clock,
  Headphones,
  Star,
  PackageSearch,
  CalendarClock,
  Truck,
  Wrench,
} from "lucide-react";

const featured = allEquipment.slice(0, 6);
const COUNTS: Record<string, string> = {
  laptops: "120+ models",
  desktops: "80+ models",
  projectors: "40+ models",
  "sound-systems": "60+ models",
  networking: "200+ devices",
  printers: "50+ models",
  displays: "30+ panels",
  servers: "Edge & GPU",
};

const steps = [
  { icon: PackageSearch, title: "Browse & configure", desc: "Pick from 1,000+ enterprise-grade SKUs with live availability." },
  { icon: CalendarClock, title: "Schedule delivery", desc: "Choose a window. We coordinate logistics and on-site timing." },
  { icon: Truck, title: "We deploy on-site", desc: "Pre-configured, tested, and racked by certified technicians." },
  { icon: Wrench, title: "24/7 support & swap", desc: "Same-day replacements. Telemetry and SLA dashboards included." },
];

const stats = [
  { value: "12,000+", label: "Devices in fleet" },
  { value: "98.7%", label: "On-time SLA" },
  { value: "850+", label: "Enterprise clients" },
  { value: "24/7", label: "Support coverage" },
];

const testimonials = [
  {
    quote: "CoreHex deployed 400 laptops across three offices in 48 hours. Their logistics and provisioning are unmatched.",
    name: "Priya Nair",
    role: "Head of IT, Northwind Labs",
  },
  {
    quote: "We rented the full AV stack for our 5,000-person summit. Flawless show, zero downtime. The team is genuinely world-class.",
    name: "Marcus Hale",
    role: "Director of Events, Helios Group",
  },
  {
    quote: "Transparent pricing, beautiful dashboard, and gear that actually arrives configured. Replaced two vendors with CoreHex.",
    name: "Sofia Reyes",
    role: "VP Operations, Vector Cloud",
  },
];

const plans = [
  {
    name: "Project",
    price: "Pay as you go",
    desc: "Short-term rentals for one-off events and pilots.",
    features: ["Per-day pricing", "Standard delivery", "Business-hours support", "Insurance add-on"],
    cta: "Start a quote",
  },
  {
    name: "Business",
    price: "$2,400/mo",
    desc: "Flexible monthly fleet for growing teams.",
    features: ["Up to 50 devices", "Next-day swap SLA", "24/7 priority support", "MDM & provisioning", "Dedicated success manager"],
    cta: "Talk to sales",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "Global deployments with dedicated infrastructure.",
    features: ["Unlimited fleet size", "Multi-region logistics", "Custom SLA & SOC 2", "Procurement API", "On-site engineers"],
    cta: "Contact us",
  },
];

const faqs = [
  { q: "What's the minimum rental period?", a: "One day for events and AV. Three days for IT hardware. Monthly plans start at 30 days with full flexibility to scale up or down." },
  { q: "How fast can you deliver?", a: "Same-day in 18 metros, next-day nationwide. For large fleet deployments, we typically coordinate a 48–72 hour rollout window." },
  { q: "Is equipment pre-configured?", a: "Yes. We image laptops with your gold image, enroll into your MDM, and ship racked & cabled for AV and networking gear." },
  { q: "What if equipment fails on-site?", a: "We commit to same-day replacement under our SLA. Telemetry alerts our NOC before most failures impact your operations." },
  { q: "Do you handle international shipments?", a: "Yes — we operate hubs across North America, EMEA, and APAC with customs and carnet support for events." },
  { q: "How is pricing structured?", a: "Transparent per-device daily or monthly rates with volume tiers. No hidden setup, support, or insurance fees on Business and Enterprise plans." },
];

export function Landing() {
  return (
    <div className="min-h-screen text-foreground">
      <SiteNav />
      <Hero />
      <Stats />
      <Categories />
      <Featured />
      <Process />
      <Testimonials />
      <Pricing />
      <Faq />
      <Contact />
      <SiteFooter />
    </div>
  );
}

function Hero() {
  const { openQuote } = useBooking();
  return (
    <section className="relative pt-32 pb-24 overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      <div className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-primary/20 blur-3xl animate-pulse-glow" />
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary-glow animate-pulse" />
              Trusted by 850+ enterprise teams
            </div>
            <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05]">
              Enterprise tech, <span className="text-gradient">rented in hours.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              CoreHex Rental delivers configured laptops, AV systems, networking, and full event setups to your door — with 24/7 SLAs and a dashboard that just works.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-90">
                <Link to="/equipment">Browse the fleet <ArrowRight /></Link>
              </Button>
              <Button size="lg" variant="outline" className="glass-card border-border/60 hover:bg-accent/40" onClick={() => openQuote()}>
                Request a quote
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              {[
                { icon: Shield, label: "SOC 2 Type II" },
                { icon: Zap, label: "Same-day swap" },
                { icon: Clock, label: "24/7 NOC" },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <b.icon className="size-4 text-primary-glow" />
                  {b.label}
                </div>
              ))}
            </div>
          </div>
          <div className="relative animate-float">
            <div className="absolute -inset-6 bg-gradient-to-br from-primary/40 to-transparent blur-3xl rounded-[3rem]" />
            <div className="relative glass-card rounded-3xl overflow-hidden border border-border/50">
              <img src={heroImage} alt="Premium IT equipment available for rental" className="w-full h-auto" loading="eager" />
            </div>
            <div className="absolute -bottom-6 -left-6 glass-card rounded-2xl p-4 w-56 hidden sm:block">
              <div className="text-xs text-muted-foreground">Fleet utilization</div>
              <div className="text-2xl font-display font-semibold mt-1">94.2%</div>
              <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-[94%] bg-gradient-to-r from-primary to-primary-glow" />
              </div>
            </div>
            <div className="absolute -top-4 -right-4 glass-card rounded-2xl p-4 w-52 hidden sm:block">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> SLA healthy
              </div>
              <div className="text-lg font-display font-semibold mt-1">12,041 active</div>
              <div className="text-xs text-muted-foreground">devices in field</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="border-y border-border/40 bg-card/30">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s) => (
          <div key={s.label} className="text-center md:text-left">
            <div className="text-3xl md:text-4xl font-display font-bold text-gradient">{s.value}</div>
            <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className="max-w-2xl">
      <div className="text-xs uppercase tracking-[0.2em] text-primary-glow font-medium">{eyebrow}</div>
      <h2 className="mt-3 text-4xl md:text-5xl font-bold leading-tight">{title}</h2>
      <p className="mt-4 text-muted-foreground">{desc}</p>
    </div>
  );
}

function Categories() {
  return (
    <section id="categories" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          eyebrow="Equipment categories"
          title="One catalog. Every category your stack needs."
          desc="From individual workstations to full event production, we maintain enterprise-grade gear across eight categories — ready to deploy."
        />
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {catalogCategories.map((c) => (
            <Link
              key={c.slug}
              to="/equipment/category/$slug"
              params={{ slug: c.slug }}
              className="group glass-card rounded-2xl p-6 hover:border-primary/40 transition-all hover:-translate-y-1 block"
            >
              <div className="size-11 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 grid place-items-center group-hover:shadow-[var(--shadow-glow)] transition">
                <CategoryIcon category={c.slug} className="size-5 text-primary-glow" />
              </div>
              <div className="mt-5 font-display font-semibold text-lg">{c.name}</div>
              <div className="text-xs text-primary-glow/80 mt-1">{COUNTS[c.slug]}</div>
              <div className="mt-2 text-sm text-muted-foreground">{c.description}</div>
              <div className="mt-4 flex items-center gap-1 text-sm text-foreground/80 group-hover:text-primary-glow transition">
                Browse <ArrowRight className="size-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Featured() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <SectionHeader
            eyebrow="Featured rentals"
            title="Most-requested this quarter."
            desc="Battle-tested configurations our enterprise customers reorder month after month."
          />
          <Button asChild variant="outline" className="glass-card border-border/60">
            <Link to="/equipment">View full catalog <ArrowRight /></Link>
          </Button>
        </div>
        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((f) => (
            <EquipmentCard key={f.slug} item={f} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section id="process" className="py-24 relative">
      <div className="absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
      <div className="max-w-7xl mx-auto px-6 relative">
        <SectionHeader
          eyebrow="How it works"
          title="From quote to deployed in 48 hours."
          desc="A purpose-built logistics layer wraps every rental — so you focus on shipping work, not chasing vendors."
        />
        <div className="mt-16 relative">
          <div className="hidden lg:block absolute left-0 right-0 top-6 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="size-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground grid place-items-center shadow-[var(--shadow-glow)] relative z-10">
                  <s.icon className="size-5" />
                </div>
                <div className="mt-5 text-xs text-primary-glow font-medium">Step {String(i + 1).padStart(2, "0")}</div>
                <h3 className="mt-1 font-display font-semibold text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          eyebrow="Customers"
          title="Teams that ship trust CoreHex."
          desc="From product launches to global summits, here's what operators say after working with us."
        />
        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <figure key={t.name} className="glass-card rounded-2xl p-7 flex flex-col">
              <div className="flex gap-0.5 text-primary-glow">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-primary-glow" />
                ))}
              </div>
              <blockquote className="mt-5 text-foreground/90 leading-relaxed">"{t.quote}"</blockquote>
              <figcaption className="mt-6 pt-5 border-t border-border/40">
                <div className="font-display font-semibold">{t.name}</div>
                <div className="text-sm text-muted-foreground">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          eyebrow="Pricing"
          title="Transparent plans that scale with you."
          desc="Pay only for what you deploy. Switch plans anytime — no termination fees, no hidden support tiers."
        />
        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl p-8 flex flex-col ${
                p.featured
                  ? "border border-primary/50 bg-gradient-to-b from-primary/15 to-card shadow-[var(--shadow-glow)]"
                  : "glass-card"
              }`}
            >
              {p.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-medium">
                  Most popular
                </div>
              )}
              <div className="font-display font-semibold text-lg">{p.name}</div>
              <div className="mt-3 text-3xl font-display font-bold">{p.price}</div>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
              <ul className="mt-6 space-y-3 text-sm flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="size-4 text-primary-glow shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <PricingCta featured={!!p.featured} label={p.cta} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingCta({ featured, label }: { featured: boolean; label: string }) {
  const { openQuote } = useBooking();
  return (
    <Button
      onClick={() => openQuote()}
      className={`mt-8 ${
        featured
          ? "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
      }`}
    >
      {label}
    </Button>
  );
}

function Faq() {
  return (
    <section id="faq" className="py-24">
      <div className="max-w-4xl mx-auto px-6">
        <SectionHeader
          eyebrow="FAQ"
          title="Questions, answered."
          desc="Can't find what you need? Our team responds to every inquiry within an hour."
        />
        <Accordion type="single" collapsible className="mt-12">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border/40 glass-card rounded-xl mb-3 px-5">
              <AccordionTrigger className="text-left font-display font-medium hover:no-underline py-5">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function Contact() {
  const contactSchema = z.object({
    name: z.string().trim().min(2, "Name required").max(80),
    email: z.string().trim().email("Valid email required").max(160),
    company: z.string().trim().min(2, "Company required").max(120),
    message: z.string().trim().min(10, "Tell us a bit more").max(1000),
  });
  type ContactValues = z.infer<typeof contactSchema>;
  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", company: "", message: "" },
  });

  async function onSubmit(v: ContactValues) {
    try {
      const quote = await rentalApi.createQuote({
        items: [],
        name: v.name,
        company: v.company,
        email: v.email,
        phone: "—",
        requirements: v.message,
      });
      toast.success("Quote request sent", { description: `Reference ${quote.reference}` });
      form.reset();
    } catch {
      toast.error("Could not send request");
    }
  }

  return (
    <section id="contact" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative overflow-hidden rounded-3xl glass-card p-10 md:p-16 border border-primary/30">
          <div className="absolute -top-40 -right-40 size-[500px] rounded-full bg-primary/30 blur-3xl" />
          <div className="grid lg:grid-cols-2 gap-10 relative">
            <div>
              <SectionHeader
                eyebrow="Talk to sales"
                title="Spin up your rental fleet today."
                desc="Tell us what you're deploying. We'll send a configured quote and availability window within the hour."
              />
              <div className="mt-8 space-y-3 text-sm">
                <div className="flex items-center gap-3"><Headphones className="size-4 text-primary-glow" /> sales@corehex.rentals</div>
                <div className="flex items-center gap-3"><Clock className="size-4 text-primary-glow" /> 24/7 NOC: +1 (415) 555-0182</div>
                <div className="flex items-center gap-3"><Shield className="size-4 text-primary-glow" /> SOC 2 · ISO 27001 · GDPR</div>
              </div>
            </div>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full name" placeholder="Jane Doe" error={form.formState.errors.name?.message} {...form.register("name")} />
                <Field label="Work email" placeholder="jane@company.com" error={form.formState.errors.email?.message} {...form.register("email")} />
              </div>
              <Field label="Company" placeholder="Acme Inc." error={form.formState.errors.company?.message} {...form.register("company")} />
              <div>
                <label className="text-sm text-muted-foreground">What do you need?</label>
                <textarea
                  rows={4}
                  placeholder="e.g. 120 MacBook Pros for a 3-month project across 2 offices"
                  className="mt-2 w-full rounded-xl bg-input/40 border border-border/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  {...form.register("message")}
                />
                {form.formState.errors.message && <p className="text-xs text-destructive mt-1">{form.formState.errors.message.message}</p>}
              </div>
              <Button type="submit" disabled={form.formState.isSubmitting} className="w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-90" size="lg">
                {form.formState.isSubmitting ? <><Loader2 className="size-4 animate-spin" /> Sending…</> : <>Request a quote <ArrowRight /></>}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string };
const Field = forwardRef<HTMLInputElement, FieldProps>(function Field({ label, error, className, ...rest }, ref) {
  return (
    <div>
      <label className="text-sm text-muted-foreground">{label}</label>
      <Input ref={ref} className={`mt-2 rounded-xl bg-input/40 border-border/60 h-11 ${className ?? ""}`} {...rest} />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
});