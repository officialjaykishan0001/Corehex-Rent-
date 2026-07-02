import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Package, Plus, Search, Trash2, Pencil, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { LoadingState } from "@/components/admin/LoadingState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { equipmentService } from "@/services/admin/equipment.service";
import { categories } from "@/data/equipment";

const searchSchema = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/admin/equipment/")({
  validateSearch: searchSchema,
  component: AdminEquipmentPage,
});

const PAGE_SIZE = 10;

function AdminEquipmentPage() {
  const { q: initialQ } = Route.useSearch();
  const [q, setQ] = useState(initialQ ?? "");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "equipment"],
    queryFn: () => equipmentService.list(),
  });

  const filtered = useMemo(() => {
    const items = data ?? [];
    const term = q.trim().toLowerCase();
    return items.filter((e) => {
      if (category !== "all" && e.category !== category) return false;
      if (status !== "all" && e.status !== status) return false;
      if (!term) return true;
      return (
        e.name.toLowerCase().includes(term) ||
        e.slug.toLowerCase().includes(term) ||
        (e.brand ?? "").toLowerCase().includes(term)
      );
    });
  }, [data, q, category, status]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function onDelete() {
    if (!pendingDelete) return;
    try {
      await equipmentService.remove(pendingDelete);
      toast.success("Equipment deleted");
      qc.invalidateQueries({ queryKey: ["admin"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setPendingDelete(null);
    }
  }

  return (
    <AdminLayout>
      <PageHeader
        title="Equipment"
        description="Manage your rental catalog, pricing, and availability"
        actions={
          <Button onClick={() => navigate({ to: "/admin/equipment/new" })}>
            <Plus className="mr-1.5 h-4 w-4" /> Add equipment
          </Button>
        }
      />

      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, slug, brand…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="w-full md:w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="out-of-stock">Out of stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 overflow-x-auto">
          {isLoading ? (
            <LoadingState />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No equipment found"
              description="Try adjusting your filters or add a new item to the catalog."
              action={
                <Button onClick={() => navigate({ to: "/admin/equipment/new" })}>
                  <Plus className="mr-1.5 h-4 w-4" /> Add equipment
                </Button>
              }
            />
          ) : (
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Item</th>
                  <th className="py-2 pr-3 font-medium">Category</th>
                  <th className="py-2 pr-3 font-medium">Daily</th>
                  <th className="py-2 pr-3 font-medium">Stock</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 pr-3 font-medium">Updated</th>
                  <th className="py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageItems.map((e) => (
                  <tr key={e.id} className="hover:bg-accent/20">
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Package className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{e.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{e.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-3 capitalize">{e.category.replace("-", " ")}</td>
                    <td className="py-3 pr-3">
                      <span className="flex items-center">
                        <IndianRupee size={14} className="inline" />
                        {e.dailyRate}
                      </span>
                    </td>
                    <td className="py-3 pr-3">{e.availableQuantity}/{e.totalQuantity}</td>
                    <td className="py-3 pr-3"><StatusBadge status={e.status} /></td>
                    <td className="py-3 pr-3 text-xs text-muted-foreground">{new Date(e.updatedAt).toLocaleDateString()}</td>
                    <td className="py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          to="/admin/equipment/$id/edit"
                          params={{ id: e.id }}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setPendingDelete(e.id)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-rose-500/15 hover:text-rose-300"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {filtered.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Page {page} of {pages} · {filtered.length} items
            </span>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this equipment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the listing from the public catalog. Existing bookings remain intact.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-rose-500 hover:bg-rose-500/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}