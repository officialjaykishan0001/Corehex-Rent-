import { useState, type ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { ProtectedRoute } from "./ProtectedRoute";
import { cn } from "@/lib/utils";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-background/70 backdrop-blur"
              onClick={() => setOpen(false)}
            />
            <div className="absolute inset-y-0 left-0">
              <AdminSidebar onNavigate={() => setOpen(false)} />
            </div>
          </div>
        )}
        <div className={cn("flex min-w-0 flex-1 flex-col")}>
          <AdminTopbar onOpenSidebar={() => setOpen(true)} />
          <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}