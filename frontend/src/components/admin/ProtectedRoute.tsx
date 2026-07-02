import { useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAdminAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isAdmin = !!user && user.role === "admin";

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate({ to: "/admin/login", search: { redirect: pathname } });
    } else if (!isAdmin) {
      toast.error("Admin access required.");
      navigate({ to: "/" });
    }
  }, [loading, isAuthenticated, isAdmin, navigate, pathname]);

  if (loading || !isAuthenticated || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  return <>{children}</>;
}