import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { LoadingState } from "@/components/admin/LoadingState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { settingsService } from "@/services/admin/settings.service";
import type { AdminSettings } from "@/types/admin";

const schema = z.object({
  companyName: z.string().trim().min(2).max(120),
  contactEmail: z.string().trim().email(),
  phone: z.string().trim().min(5).max(40),
  address: z.string().trim().min(2).max(200),
  taxPercentage: z.coerce.number().min(0).max(100),
  securityDeposit: z.coerce.number().min(0),
  rentalTerms: z.string().trim().min(10).max(2000),
  notifyBookings: z.boolean(),
  notifyQuotes: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => settingsService.get(),
  });

  const {
    register, handleSubmit, reset, setValue, watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => { if (data) reset(data); }, [data, reset]);

  async function onSubmit(values: FormValues) {
    await settingsService.update(values as Partial<AdminSettings>);
    qc.invalidateQueries({ queryKey: ["admin", "settings"] });
    toast.success("Settings saved");
  }

  if (isLoading || !data) return (<AdminLayout><LoadingState /></AdminLayout>);

  return (
    <AdminLayout>
      <PageHeader title="Settings" description="Company, rental, and notification preferences" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card title="Company">
          <F label="Company name" error={errors.companyName?.message}><Input {...register("companyName")} /></F>
          <F label="Contact email" error={errors.contactEmail?.message}><Input type="email" {...register("contactEmail")} /></F>
          <F label="Phone" error={errors.phone?.message}><Input {...register("phone")} /></F>
          <F label="Address" error={errors.address?.message}><Input {...register("address")} /></F>
        </Card>

        <Card title="Rental">
          <F label="Tax %" error={errors.taxPercentage?.message}><Input type="number" step="0.1" {...register("taxPercentage")} /></F>
          <F label="Security deposit ($)" error={errors.securityDeposit?.message}><Input type="number" {...register("securityDeposit")} /></F>
          <F label="Rental terms" error={errors.rentalTerms?.message} full><Textarea rows={4} {...register("rentalTerms")} /></F>
        </Card>

        <Card title="Email notifications">
          <ToggleRow
            label="Booking notifications"
            description="Email when a new booking is created"
            checked={!!watch("notifyBookings")}
            onChange={(v) => setValue("notifyBookings", v)}
          />
          <ToggleRow
            label="Quote notifications"
            description="Email when a customer requests a quote"
            checked={!!watch("notifyQuotes")}
            onChange={(v) => setValue("notifyQuotes", v)}
          />
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}
function F({ label, error, children, full }: { label: string; error?: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
}
function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="md:col-span-2 flex items-center justify-between rounded-lg border border-border p-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}