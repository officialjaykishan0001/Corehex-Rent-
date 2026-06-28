import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { EquipmentForm } from "@/components/admin/EquipmentForm";
import { equipmentService } from "@/services/admin/equipment.service";
import type { EquipmentInput } from "@/types/admin";

export const Route = createFileRoute("/admin/equipment/new")({
  component: NewEquipmentPage,
});

function NewEquipmentPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  async function save(input: EquipmentInput) {
    setSubmitting(true);
    try {
      await equipmentService.create(input);
      qc.invalidateQueries({ queryKey: ["admin"] });
      toast.success(input.status === "draft" ? "Draft saved" : "Equipment published");
      navigate({ to: "/admin/equipment" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminLayout>
      <PageHeader title="Add equipment" description="Create a new rental listing for your catalog" />
      <EquipmentForm onSubmit={save} onSaveDraft={save} submitting={submitting} />
    </AdminLayout>
  );
}