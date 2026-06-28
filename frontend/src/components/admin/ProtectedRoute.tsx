import { useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import type { AdminRole } from "@/types/admin";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: AdminRole[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAdminAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate({ to: "/admin/login", search: { redirect: pathname } });
    } else if (roles && user && !roles.includes(user.role)) {
      navigate({ to: "/admin/dashboard" });
    }
  }, [loading, isAuthenticated, user, roles, navigate, pathname]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  return <>{children}</>;
}