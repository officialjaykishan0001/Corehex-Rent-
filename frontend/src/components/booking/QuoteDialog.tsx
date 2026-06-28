import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus, Minus, X, CheckCircle2, Copy } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { equipment, getEquipmentBySlug } from "@/data/equipment";
import { rentalApi } from "@/services/rentalApi";
import type { Quote, QuoteItem } from "@/types/rental";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  company: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().min(6).max(32),
  requirements: z.string().trim().min(10, "Tell us a bit about your project").max(1000),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seedSlugs?: string[];
}

export function QuoteDialog({ open, onOpenChange, seedSlugs }: Props) {
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [adding, setAdding] = useState<string>("");
  const [submitted, setSubmitted] = useState<Quote | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", company: "", email: "", phone: "", requirements: "" },
  });

  useEffect(() => {
    if (open) {
      setSubmitted(null);
      setItems(seedSlugs?.map((s) => ({ slug: s, quantity: 1 })) ?? []);
      form.reset();
    }
  }, [open, seedSlugs]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = useMemo(
    () =>
      items.reduce((sum, i) => {
        const eq = getEquipmentBySlug(i.slug);
        return sum + (eq ? eq.dailyRate * i.quantity * 7 : 0);
      }, 0),
    [items],
  );

  function addItem(slug: string) {
    if (!slug) return;
    if (items.some((i) => i.slug === slug)) return;
    setItems((prev) => [...prev, { slug, quantity: 1 }]);
    setAdding("");
  }

  async function onSubmit(v: FormValues) {
    if (items.length === 0) {
      toast.error("Add at least one equipment item to your quote");
      return;
    }
    try {
      const quote = await rentalApi.createQuote({ ...v, items });
      setSubmitted(quote);
    } catch (e) {
      toast.error("Could not submit quote request", {
        description: e instanceof Error ? e.message : "Please try again",
      });
    }
  }

  const submitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-border/60 max-w-2xl max-h-[90vh] overflow-y-auto">
        {submitted ? (
          <div className="py-6 text-center">
            <div className="mx-auto size-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 grid place-items-center">
              <CheckCircle2 className="size-7 text-emerald-400" />
            </div>
            <h2 className="mt-5 text-2xl font-display font-bold">Quote request received</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Our team will respond within the hour with a configured quote.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-border/60 bg-card/40">
              <div className="text-xs text-muted-foreground">Reference</div>
              <code className="font-mono text-sm">{submitted.reference}</code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(submitted.reference);
                  toast.success("Reference copied");
                }}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Copy reference"
              >
                <Copy className="size-3.5" />
              </button>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Estimated weekly total: ${submitted.estimatedTotal.toLocaleString()}
            </div>
            <Button className="mt-6 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Request a quote</DialogTitle>
              <DialogDescription>Bundle multiple items and we&apos;ll respond within the hour.</DialogDescription>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-2">
              <div>
                <Label className="text-xs text-muted-foreground">Equipment</Label>
                <div className="mt-2 flex gap-2">
                  <Select value={adding} onValueChange={addItem}>
                    <SelectTrigger><SelectValue placeholder="Add equipment to quote…" /></SelectTrigger>
                    <SelectContent>
                      {equipment
                        .filter((e) => !items.some((i) => i.slug === e.slug))
                        .map((e) => (
                          <SelectItem key={e.slug} value={e.slug}>{e.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="mt-3 space-y-2">
                  {items.length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-6 border border-dashed border-border/60 rounded-xl">
                      No items yet. Add equipment above.
                    </div>
                  )}
                  {items.map((it) => {
                    const eq = getEquipmentBySlug(it.slug);
                    if (!eq) return null;
                    return (
                      <div key={it.slug} className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card/30">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate">{eq.name}</div>
                          <div className="text-xs text-muted-foreground">${eq.dailyRate}/day</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button type="button" size="icon" variant="outline" className="size-7" onClick={() => setItems((p) => p.map((i) => i.slug === it.slug ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i))}>
                            <Minus className="size-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{it.quantity}</span>
                          <Button type="button" size="icon" variant="outline" className="size-7" onClick={() => setItems((p) => p.map((i) => i.slug === it.slug ? { ...i, quantity: i.quantity + 1 } : i))}>
                            <Plus className="size-3" />
                          </Button>
                        </div>
                        <Button type="button" size="icon" variant="ghost" onClick={() => setItems((p) => p.filter((i) => i.slug !== it.slug))} aria-label="Remove">
                          <X className="size-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full name" error={form.formState.errors.name?.message}>
                  <Input placeholder="Jane Doe" {...form.register("name")} />
                </Field>
                <Field label="Company" error={form.formState.errors.company?.message}>
                  <Input placeholder="Acme Inc." {...form.register("company")} />
                </Field>
                <Field label="Work email" error={form.formState.errors.email?.message}>
                  <Input type="email" placeholder="jane@company.com" {...form.register("email")} />
                </Field>
                <Field label="Phone" error={form.formState.errors.phone?.message}>
                  <Input type="tel" placeholder="+1 415 555 0182" {...form.register("phone")} />
                </Field>
              </div>

              <Field label="Project requirements" error={form.formState.errors.requirements?.message}>
                <Textarea rows={4} placeholder="Describe scope, duration, location, and any constraints." {...form.register("requirements")} />
              </Field>

              <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/15 to-card p-4 flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Estimated weekly total</div>
                <div className="text-2xl font-display font-bold">${total.toLocaleString()}</div>
              </div>

              <Button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-90" size="lg">
                {submitting ? <><Loader2 className="size-4 animate-spin" /> Submitting…</> : "Submit quote request"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}