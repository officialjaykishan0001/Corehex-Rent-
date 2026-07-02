import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Loader2, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/data/equipment";
import type { CategorySlug } from "@/types/rental";
import type { EquipmentInput, EquipmentStatus } from "@/types/admin";

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes"),
  category: z.string().min(1),
  brand: z.string().max(80).optional(),
  model: z.string().max(80).optional(),
  tagline: z.string().max(160).optional(),
  description: z.string().trim().min(10, "Description is too short").max(1000),
  dailyRate: z.coerce.number().min(0),
  weeklyRate: z.coerce.number().min(0),
  monthlyRate: z.coerce.number().min(0),
  totalQuantity: z.coerce.number().int().min(0),
  availableQuantity: z.coerce.number().int().min(0),
  thumbnail: z.string().url().optional().or(z.literal("")),
  status: z.enum(["active", "draft", "out-of-stock"]),
  specs: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) })),
  accessories: z.array(z.object({ value: z.string().min(1) })),
});
type FormValues = z.infer<typeof schema>;

export interface EquipmentFormProps {
  initial?: Partial<EquipmentInput> & { specs?: { label: string; value: string }[]; accessories?: string[] };
  submitting?: boolean;
  onSubmit: (input: EquipmentInput) => void | Promise<void>;
  onSaveDraft?: (input: EquipmentInput) => void | Promise<void>;
}

export function EquipmentForm({ initial, submitting, onSubmit, onSaveDraft }: EquipmentFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? "",
      slug: initial?.slug ?? "",
      category: initial?.category ?? "laptops",
      brand: initial?.brand ?? "",
      model: initial?.model ?? "",
      tagline: initial?.tagline ?? "",
      description: initial?.description ?? "",
      dailyRate: initial?.dailyRate ?? 0,
      weeklyRate: initial?.weeklyRate ?? 0,
      monthlyRate: initial?.monthlyRate ?? 0,
      totalQuantity: initial?.totalQuantity ?? 0,
      availableQuantity: initial?.availableQuantity ?? 0,
      thumbnail: initial?.thumbnail ?? "",
      status: initial?.status ?? "active",
      specs: initial?.specs?.length ? initial.specs : [{ label: "", value: "" }],
      accessories: (initial?.accessories ?? []).length
        ? (initial!.accessories!).map((value) => ({ value }))
        : [{ value: "" }],
    },
  });

  const specsArr = useFieldArray({ control, name: "specs" });
  const accArr = useFieldArray({ control, name: "accessories" });

  function toInput(v: FormValues): EquipmentInput {
    return {
      name: v.name,
      slug: v.slug,
      category: v.category as CategorySlug,
      brand: v.brand || undefined,
      model: v.model || undefined,
      tagline: v.tagline || undefined,
      description: v.description,
      dailyRate: v.dailyRate,
      weeklyRate: v.weeklyRate,
      monthlyRate: v.monthlyRate,
      totalQuantity: v.totalQuantity,
      availableQuantity: v.availableQuantity,
      thumbnail: v.thumbnail || undefined,
      specs: v.specs.filter((s) => s.label && s.value),
      accessories: v.accessories.map((a) => a.value).filter(Boolean),
      status: v.status as EquipmentStatus,
    };
  }

  const name = watch("name");
  function autoSlug() {
    setValue(
      "slug",
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
      { shouldValidate: true },
    );
  }

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(toInput(v)))} className="space-y-6">
      <div className="glass-card rounded-xl p-5">
        <h3 className="font-display text-base font-semibold">Basic information</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Name" error={errors.name?.message}>
            <Input {...register("name")} onBlur={() => !getValues("slug") && autoSlug()} />
          </Field>
          <Field label="Slug" error={errors.slug?.message}>
            <div className="flex gap-2">
              <Input {...register("slug")} />
              <Button type="button" variant="outline" onClick={autoSlug}>Auto</Button>
            </div>
          </Field>
          <Field label="Category" error={errors.category?.message}>
            <Select value={watch("category")} onValueChange={(v) => setValue("category", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={watch("status")} onValueChange={(v) => setValue("status", v as EquipmentStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="out-of-stock">Out of stock</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Brand"><Input {...register("brand")} /></Field>
          <Field label="Model"><Input {...register("model")} /></Field>
          <Field label="Tagline" className="md:col-span-2"><Input {...register("tagline")} /></Field>
          <Field label="Description" error={errors.description?.message} className="md:col-span-2">
            <Textarea rows={4} {...register("description")} />
          </Field>
        </div>
      </div>

      <div className="glass-card rounded-xl p-5">
        <h3 className="font-display text-base font-semibold">Pricing & inventory</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field
            label={
              <span className="flex items-center gap-1">
                Daily price (<IndianRupee size={14} />)
              </span>
            } error={errors.dailyRate?.message}
          >
            <Input type="number" min={0} {...register("dailyRate")} />
          </Field>
          <Field
            label={
              <span className="flex items-center gap-1">
                Weekly price (<IndianRupee size={14} />)
              </span>
            }
            error={errors.weeklyRate?.message}
          >
            <Input type="number" min={0} {...register("weeklyRate")} />
          </Field>
          <Field
            label={
              <span className="flex items-center gap-1">
                Monthly price (<IndianRupee size={14} />)
              </span>
            }
            error={errors.monthlyRate?.message}
          >
            <Input type="number" min={0} {...register("monthlyRate")} />
          </Field>
          <Field label="Total quantity" error={errors.totalQuantity?.message}>
            <Input type="number" min={0} {...register("totalQuantity")} />
          </Field>
          <Field label="Available quantity" error={errors.availableQuantity?.message}>
            <Input type="number" min={0} {...register("availableQuantity")} />
          </Field>
          <Field label="Thumbnail URL" error={errors.thumbnail?.message}>
            <Input type="url" placeholder="https://" {...register("thumbnail")} />
          </Field>
        </div>
      </div>

      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-semibold">Specifications</h3>
          <Button type="button" variant="outline" size="sm" onClick={() => specsArr.append({ label: "", value: "" })}>
            <Plus className="mr-1 h-3 w-3" /> Add spec
          </Button>
        </div>
        <div className="mt-3 space-y-2">
          {specsArr.fields.map((f, i) => (
            <div key={f.id} className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_2fr_auto]">
              <Input placeholder="Label (e.g. CPU)" {...register(`specs.${i}.label`)} />
              <Input placeholder="Value" {...register(`specs.${i}.value`)} />
              <Button type="button" variant="ghost" size="icon" onClick={() => specsArr.remove(i)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-semibold">Accessories</h3>
          <Button type="button" variant="outline" size="sm" onClick={() => accArr.append({ value: "" })}>
            <Plus className="mr-1 h-3 w-3" /> Add accessory
          </Button>
        </div>
        <div className="mt-3 space-y-2">
          {accArr.fields.map((f, i) => (
            <div key={f.id} className="flex items-center gap-2">
              <Input placeholder="Accessory" {...register(`accessories.${i}.value`)} />
              <Button type="button" variant="ghost" size="icon" onClick={() => accArr.remove(i)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {onSaveDraft && (
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={handleSubmit((v) => onSaveDraft({ ...toInput(v), status: "draft" }))}
          >
            Save draft
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Publish
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
}