import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Play, Flag, MessageSquarePlus } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { LoadingState } from "@/components/admin/LoadingState";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { bookingService } from "@/services/admin/booking.service";
import type { BookingStatus } from "@/types/admin";

export const Route = createFileRoute("/admin/bookings/$id")({
  component: BookingDetailPage,
});

function fmt(d: string) {
  return new Date(d).toLocaleString();
}

function BookingDetailPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const [note, setNote] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "booking", id],
    queryFn: () => bookingService.get(id),
  });

  async function setStatus(s: BookingStatus) {
    try {
      await bookingService.setStatus(id, s);
      qc.invalidateQueries({ queryKey: ["admin"] });
      toast.success(`Marked ${s}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  async function addNote() {
    if (!note.trim()) return;
    try {
      await bookingService.addNote(id, note.trim());
      qc.invalidateQueries({ queryKey: ["admin"] });
      setNote("");
      toast.success("Note added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  if (isLoading || !data)
    return (
      <AdminLayout>
        <LoadingState />
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <PageHeader
        title={`Booking ${data.id}`}
        description={`Created ${fmt(data.createdAt)}`}
        actions={<StatusBadge status={data.status} />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Section title="Customer information">
            <Row label="Name" value={data.name} />
            <Row label="Company" value={data.company} />
            <Row label="Email" value={data.email} />
            <Row label="Phone" value={data.phone} />
            <Row label="Project type" value={data.projectType} />
          </Section>

          <Section title="Rental information">
            <Row label="Equipment" value={data.equipmentSlug} />
            <Row label="Quantity" value={String(data.quantity)} />
            <Row label="Start" value={data.startDate} />
            <Row label="End" value={data.endDate} />
            <Row label="Estimated cost" value={`$${data.estimatedCost.toLocaleString()}`} />
          </Section>

          <Section title="Delivery">
            <Row label="Delivery" value={data.deliveryRequired ? "Required" : "Pickup"} />
            <Row label="Installation" value={data.installationRequired ? "Required" : "Self-setup"} />
            <Row label="Notes" value={data.specialRequirements ?? "—"} />
          </Section>

          <Section title="Admin notes">
            <p className="text-sm text-muted-foreground">{data.notes ?? "No notes yet."}</p>
            <div className="mt-3 flex gap-2">
              <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add an internal note…" />
              <Button onClick={addNote}><MessageSquarePlus className="mr-1.5 h-4 w-4" /> Add</Button>
            </div>
          </Section>
        </div>

        <div className="space-y-4">
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-display text-base font-semibold">Actions</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setStatus("approved")}><CheckCircle2 className="mr-1 h-4 w-4" /> Approve</Button>
              <Button variant="ghost" onClick={() => setStatus("rejected")}><XCircle className="mr-1 h-4 w-4" /> Reject</Button>
              <Button variant="outline" onClick={() => setStatus("active")}><Play className="mr-1 h-4 w-4" /> Mark active</Button>
              <Button variant="outline" onClick={() => setStatus("completed")}><Flag className="mr-1 h-4 w-4" /> Complete</Button>
            </div>
          </div>

          <div className="glass-card rounded-xl p-5">
            <h3 className="font-display text-base font-semibold">Timeline</h3>
            <ol className="mt-3 space-y-3">
              {data.timeline.map((ev) => (
                <li key={ev.id} className="relative pl-5 text-sm">
                  <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-primary" />
                  <p className="font-medium">{ev.label}</p>
                  <p className="text-xs text-muted-foreground">{fmt(ev.at)} · {ev.by}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">{children}</div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}