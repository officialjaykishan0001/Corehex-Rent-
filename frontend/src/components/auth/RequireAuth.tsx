import { useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAdminAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      toast.message("Please sign in to continue.");
      navigate({ to: "/login", search: { redirect: pathname } });
    }
  }, [isAuthenticated, loading, navigate, pathname]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  return <>{children}</>;
}