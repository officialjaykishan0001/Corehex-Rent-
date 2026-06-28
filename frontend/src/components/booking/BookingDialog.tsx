import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, CalendarDays, Check } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getEquipmentBySlug } from "@/data/equipment";
import { rentalApi, estimateCost } from "@/services/rentalApi";
import { AvailabilityBadge } from "@/components/equipment/AvailabilityBadge";

const schema = z
  .object({
    startDate: z.string().min(1, "Start date required"),
    endDate: z.string().min(1, "End date required"),
    quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").max(500),
    deliveryRequired: z.boolean(),
    installationRequired: z.boolean(),
    specialRequirements: z.string().max(500).optional(),
    name: z.string().trim().min(2, "Name required").max(80),
    company: z.string().trim().min(2, "Company required").max(120),
    email: z.string().trim().email("Valid email required").max(160),
    phone: z.string().trim().min(6, "Phone required").max(32),
    projectType: z.string().min(1, "Select a project type"),
  })
  .refine((v) => new Date(v.endDate) >= new Date(v.startDate), {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

type FormValues = z.infer<typeof schema>;

const PROJECT_TYPES = [
  "Corporate event",
  "Conference / Summit",
  "Office deployment",
  "Film / Production",
  "Training / Workshop",
  "Pop-up office",
  "Disaster recovery",
  "Other",
];

function today() {
  return new Date().toISOString().slice(0, 10);
}
function plusDays(d: string, n: number) {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date.toISOString().slice(0, 10);
}

interface Props {
  slug: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingDialog({ slug, open, onOpenChange }: Props) {
  const item = slug ? getEquipmentBySlug(slug) : undefined;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      startDate: today(),
      endDate: plusDays(today(), 3),
      quantity: 1,
      deliveryRequired: true,
      installationRequired: false,
      specialRequirements: "",
      name: "",
      company: "",
      email: "",
      phone: "",
      projectType: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        startDate: today(),
        endDate: plusDays(today(), 3),
        quantity: 1,
        deliveryRequired: true,
        installationRequired: false,
        specialRequirements: "",
        name: "",
        company: "",
        email: "",
        phone: "",
        projectType: "",
      });
    }
  }, [open, slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const values = form.watch();
  const days = useMemo(() => {
    const ms = new Date(values.endDate).getTime() - new Date(values.startDate).getTime();
    return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)) || 1);
  }, [values.startDate, values.endDate]);

  const baseCost = item ? estimateCost(item.dailyRate, item.weeklyRate, item.monthlyRate, days, values.quantity || 1) : 0;
  const extras = (values.deliveryRequired ? 150 : 0) + (values.installationRequired ? 250 : 0);
  const estimate = baseCost + extras;

  async function onSubmit(v: FormValues) {
    if (!item) return;
    try {
      const booking = await rentalApi.createBooking({ ...v, equipmentSlug: item.slug });
      toast.success("Booking confirmed", {
        description: `Reference ${booking.id} · Est. $${booking.estimatedCost.toLocaleString()}`,
      });
      onOpenChange(false);
    } catch (e) {
      toast.error("Could not complete booking", {
        description: e instanceof Error ? e.message : "Please try again",
      });
    }
  }

  const submitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-border/60 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Reserve equipment</DialogTitle>
          <DialogDescription>
            We&apos;ll confirm availability and send a calendar invite within the hour.
          </DialogDescription>
        </DialogHeader>

        {item && (
          <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-card/40">
            <div>
              <div className="font-display font-semibold">{item.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">${item.dailyRate}/day · {item.tag}</div>
            </div>
            <AvailabilityBadge availability={item.availability} />
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-2">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Start date" error={form.formState.errors.startDate?.message}>
              <Input type="date" min={today()} {...form.register("startDate")} />
            </Field>
            <Field label="End date" error={form.formState.errors.endDate?.message}>
              <Input type="date" min={values.startDate || today()} {...form.register("endDate")} />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Quantity" error={form.formState.errors.quantity?.message}>
              <Input type="number" min={1} max={500} {...form.register("quantity")} />
            </Field>
            <Field label="Project type" error={form.formState.errors.projectType?.message}>
              <Select value={values.projectType} onValueChange={(v) => form.setValue("projectType", v, { shouldValidate: true })}>
                <SelectTrigger><SelectValue placeholder="Select project type" /></SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl border border-border/60 bg-card/30">
            <ToggleRow label="Delivery required" hint="+$150 logistics" checked={values.deliveryRequired} onChange={(c) => form.setValue("deliveryRequired", c)} />
            <ToggleRow label="On-site installation" hint="+$250 setup" checked={values.installationRequired} onChange={(c) => form.setValue("installationRequired", c)} />
          </div>

          <Field label="Special requirements (optional)" error={form.formState.errors.specialRequirements?.message}>
            <Textarea rows={3} placeholder="Loading dock access, specific configuration, etc." {...form.register("specialRequirements")} />
          </Field>

          <div className="pt-4 border-t border-border/40 space-y-4">
            <div className="text-sm font-medium text-foreground/80">Your details</div>
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
          </div>

          <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/15 to-card p-5">
            <div className="flex items-center gap-2 text-xs text-primary-glow font-medium">
              <CalendarDays className="size-3.5" /> Estimate
            </div>
            <div className="mt-2 flex items-end justify-between">
              <div>
                <div className="text-3xl font-display font-bold">${estimate.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {item?.name ?? "—"} · {days} day{days === 1 ? "" : "s"} · qty {values.quantity || 1}
                </div>
              </div>
              <div className="text-xs text-muted-foreground text-right">
                {values.deliveryRequired && <div className="flex items-center gap-1 justify-end"><Check className="size-3" /> Delivery</div>}
                {values.installationRequired && <div className="flex items-center gap-1 justify-end"><Check className="size-3" /> Installation</div>}
              </div>
            </div>
          </div>

          <Button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-90" size="lg">
            {submitting ? <><Loader2 className="size-4 animate-spin" /> Confirming…</> : "Confirm reservation"}
          </Button>
        </form>
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

function ToggleRow({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (c: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer">
      <div>
        <div className="text-sm">{label}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}