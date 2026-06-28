import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FileText, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
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
import { quoteService } from "@/services/admin/quote.service";
import type { QuoteStatus } from "@/types/admin";

export const Route = createFileRoute("/admin/quotes")({
  component: AdminQuotesPage,
});

const STATUSES: QuoteStatus[] = ["new", "contacted", "quoted", "converted", "closed"];

function AdminQuotesPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "quotes"],
    queryFn: () => quoteService.list(),
  });

  const filtered = (data ?? []).filter((x) => {
    if (status !== "all" && x.status !== status) return false;
    const t = q.trim().toLowerCase();
    if (!t) return true;
    return x.name.toLowerCase().includes(t) || x.company.toLowerCase().includes(t) || x.email.toLowerCase().includes(t);
  });

  async function setStatusFor(id: string, s: QuoteStatus) {
    try {
      await quoteService.setStatus(id, s);
      qc.invalidateQueries({ queryKey: ["admin"] });
      toast.success(`Marked ${s}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <AdminLayout>
      <PageHeader title="Quote requests" description="Track and convert customer quote inquiries" />

      <div className="glass-card rounded-xl p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px]">
          <Input placeholder="Search by name, company, email…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : filtered.length === 0 ? (
          <EmptyState icon={FileText} title="No quotes" description="Customer quote requests will land here." />
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((q) => (
              <div key={q.id} className="glass-card rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{q.name}</p>
                    <p className="text-xs text-muted-foreground">{q.company} · {q.reference}</p>
                  </div>
                  <StatusBadge status={q.status} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{q.requirements || "No additional notes"}</p>
                <ul className="mt-3 space-y-1 text-xs">
                  {q.items.slice(0, 3).map((it) => (
                    <li key={it.slug} className="flex justify-between">
                      <span className="truncate">{quoteService.resolveItemName(it.slug)}</span>
                      <span className="text-muted-foreground">×{it.quantity}</span>
                    </li>
                  ))}
                  {q.items.length > 3 && (
                    <li className="text-muted-foreground">+ {q.items.length - 3} more</li>
                  )}
                </ul>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <a href={`mailto:${q.email}`} className="inline-flex items-center gap-1 hover:text-foreground"><Mail className="h-3 w-3" /> {q.email}</a>
                  <a href={`tel:${q.phone}`} className="inline-flex items-center gap-1 hover:text-foreground"><Phone className="h-3 w-3" /> {q.phone}</a>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold">~${q.estimatedTotal.toLocaleString()}</span>
                  <Select value={q.status} onValueChange={(v) => setStatusFor(q.id, v as QuoteStatus)}>
                    <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}