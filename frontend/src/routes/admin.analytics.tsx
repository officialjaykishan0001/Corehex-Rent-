import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Area, AreaChart, BarChart, Bar, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Line, LineChart, PieChart, Pie, Cell,
} from "recharts";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { LoadingState } from "@/components/admin/LoadingState";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { analyticsService, type Granularity } from "@/services/admin/analytics.service";

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalyticsPage,
});

const COLORS = ["#2563EB", "#22d3ee", "#a855f7", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];

function AdminAnalyticsPage() {
  const [granularity, setG] = useState<Granularity>("monthly");
  const trends = useQuery({ queryKey: ["admin", "trends", granularity], queryFn: () => analyticsService.trends(granularity) });
  const cats = useQuery({ queryKey: ["admin", "cats"], queryFn: () => analyticsService.categoryPerformance() });
  const top = useQuery({ queryKey: ["admin", "topRented"], queryFn: () => analyticsService.mostRented() });

  return (
    <AdminLayout>
      <PageHeader
        title="Analytics"
        description="Revenue, bookings, and equipment performance"
        actions={
          <Select value={granularity} onValueChange={(v) => setG(v as Granularity)}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="Revenue trend">
          {trends.isLoading ? <LoadingState /> : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trends.data ?? []}>
                <defs>
                  <linearGradient id="a1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "oklch(0.21 0.025 262)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" fill="url(#a1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Booking trend">
          {trends.isLoading ? <LoadingState /> : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trends.data ?? []}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "oklch(0.21 0.025 262)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="bookings" stroke="#22d3ee" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Most rented equipment">
          {top.isLoading ? <LoadingState /> : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart layout="vertical" data={top.data ?? []}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} width={140} />
                <Tooltip contentStyle={{ background: "oklch(0.21 0.025 262)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Bar dataKey="count" fill="#2563EB" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Category split">
          {cats.isLoading ? <LoadingState /> : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={cats.data ?? []} dataKey="bookings" nameKey="category" innerRadius={60} outerRadius={100} paddingAngle={3}>
                  {(cats.data ?? []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "oklch(0.21 0.025 262)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="mb-3 font-display text-base font-semibold">{title}</h3>
      {children}
    </div>
  );
}