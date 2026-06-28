import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { EquipmentForm } from "@/components/admin/EquipmentForm";
import { LoadingState } from "@/components/admin/LoadingState";
import { equipmentService } from "@/services/admin/equipment.service";
import type { EquipmentInput } from "@/types/admin";

export const Route = createFileRoute("/admin/equipment/$id/edit")({
  component: EditEquipmentPage,
});

function EditEquipmentPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "equipment", id],
    queryFn: () => equipmentService.get(id),
  });

  async function save(input: EquipmentInput) {
    setSubmitting(true);
    try {
      await equipmentService.update(id, input);
      qc.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Equipment updated");
      navigate({ to: "/admin/equipment" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminLayout>
      <PageHeader title="Edit equipment" description={data?.name} />
      {isLoading || !data ? (
        <LoadingState />
      ) : (
        <EquipmentForm
          submitting={submitting}
          onSubmit={save}
          onSaveDraft={save}
          initial={{
            name: data.name,
            slug: data.slug,
            category: data.category,
            brand: data.brand,
            model: data.model,
            tagline: data.tagline,
            description: data.description,
            dailyRate: data.dailyRate,
            weeklyRate: data.weeklyRate,
            monthlyRate: data.monthlyRate,
            totalQuantity: data.totalQuantity,
            availableQuantity: data.availableQuantity,
            thumbnail: data.thumbnail,
            specs: data.specs,
            accessories: data.accessories,
            status: data.status,
          }}
        />
      )}
    </AdminLayout>
  );
}