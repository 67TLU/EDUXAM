import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user, ready } = useAuthStore();

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">Đang tải...</div>;
  }
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  if (allowedRoles?.length) {
    const ok = user.roles?.some((r) => allowedRoles.includes(r.code));
    if (!ok) return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
}