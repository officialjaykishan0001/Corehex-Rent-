import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Boxes, Wrench, AlertTriangle, Plus, Minus, RotateCcw } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { KpiCard } from "@/components/admin/KpiCard";
import { LoadingState } from "@/components/admin/LoadingState";
import { Button } from "@/components/ui/button";
import { inventoryService } from "@/services/admin/inventory.service";
import { equipmentService } from "@/services/admin/equipment.service";
import type { AdminEquipment } from "@/types/admin";

export const Route = createFileRoute("/admin/inventory")({
  component: AdminInventoryPage,
});

function AdminInventoryPage() {
  const qc = useQueryClient();
  const sum = useQuery({ queryKey: ["admin", "inv"], queryFn: () => inventoryService.summary() });
  const items = useQuery({ queryKey: ["admin", "equipment"], queryFn: () => equipmentService.list() });
  const [busy, setBusy] = useState<string | null>(null);

  async function adjust(item: AdminEquipment, delta: number) {
    setBusy(item.id);
    try {
      const next = Math.max(0, item.availableQuantity + delta);
      await equipmentService.adjustInventory(item.id, {
        availableQuantity: next,
        totalQuantity: Math.max(item.totalQuantity, next + item.rentedQuantity + item.maintenanceQuantity),
        status: next === 0 ? "out-of-stock" : "active",
      });
      qc.invalidateQueries({ queryKey: ["admin"] });
      toast.success(`Inventory updated for ${item.name}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function toggleMaintenance(item: AdminEquipment) {
    setBusy(item.id);
    try {
      const isMaint = item.maintenanceQuantity > 0;
      await equipmentService.adjustInventory(item.id, {
        maintenanceQuantity: isMaint ? 0 : 1,
        availableQuantity: isMaint ? item.availableQuantity + 1 : Math.max(0, item.availableQuantity - 1),
      });
      qc.invalidateQueries({ queryKey: ["admin"] });
      toast.success(isMaint ? "Restored from maintenance" : "Marked under maintenance");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <AdminLayout>
      <PageHeader title="Inventory" description="Stock levels, maintenance, and availability alerts" />

      {sum.isLoading ? <LoadingState /> : (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <KpiCard label="Total stock" value={sum.data?.total ?? 0} icon={Boxes} />
          <KpiCard label="Available" value={sum.data?.available ?? 0} icon={Boxes} accent="success" />
          <KpiCard label="Rented" value={sum.data?.rented ?? 0} icon={Boxes} accent="primary" />
          <KpiCard label="Maintenance" value={sum.data?.maintenance ?? 0} icon={Wrench} accent="warning" />
        </div>
      )}

      {(sum.data?.outOfStock.length || sum.data?.lowStock.length) ? (
        <div className="glass-card mt-6 rounded-xl p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h3 className="font-display text-base font-semibold">Alerts</h3>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {sum.data!.outOfStock.map((e) => (
              <li key={e.id} className="flex justify-between"><span>{e.name}</span><span className="text-rose-300">Out of stock</span></li>
            ))}
            {sum.data!.lowStock.map((e) => (
              <li key={e.id} className="flex justify-between"><span>{e.name}</span><span className="text-amber-300">Only {e.availableQuantity} left</span></li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="glass-card mt-6 overflow-x-auto rounded-xl p-4">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-3 font-medium">Item</th>
              <th className="py-2 pr-3 font-medium">Total</th>
              <th className="py-2 pr-3 font-medium">Available</th>
              <th className="py-2 pr-3 font-medium">Rented</th>
              <th className="py-2 pr-3 font-medium">Maintenance</th>
              <th className="py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(items.data ?? []).map((e) => (
              <tr key={e.id} className="hover:bg-accent/20">
                <td className="py-3 pr-3 font-medium">{e.name}</td>
                <td className="py-3 pr-3">{e.totalQuantity}</td>
                <td className="py-3 pr-3">{e.availableQuantity}</td>
                <td className="py-3 pr-3">{e.rentedQuantity}</td>
                <td className="py-3 pr-3">{e.maintenanceQuantity}</td>
                <td className="py-3 text-right">
                  <div className="inline-flex items-center gap-1">
                    <Button size="icon" variant="outline" disabled={busy === e.id} onClick={() => adjust(e, +1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" disabled={busy === e.id || e.availableQuantity === 0} onClick={() => adjust(e, -1)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" disabled={busy === e.id} onClick={() => toggleMaintenance(e)}>
                      {e.maintenanceQuantity > 0 ? <><RotateCcw className="mr-1 h-4 w-4" /> Restore</> : <><Wrench className="mr-1 h-4 w-4" /> Maintenance</>}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}