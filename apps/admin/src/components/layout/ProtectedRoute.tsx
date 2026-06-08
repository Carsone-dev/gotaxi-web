import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { isSuperAdmin } from "@/lib/permissions";
import type { UserRole } from "@/types/domain";

interface Props {
  children: React.ReactNode;
  requireRole?: UserRole;
}

export function ProtectedRoute({ children, requireRole }: Props) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireRole && user?.role !== requireRole && !isSuperAdmin(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
