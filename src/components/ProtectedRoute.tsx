import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { useEffect } from "react";

export default function ProtectedRoute() {
  const { user } = useAuthStore();
  const openLogin = useUiStore((s) => s.openLogin);

  useEffect(() => {
    if (!user) {
      openLogin();
    }
  }, [user, openLogin]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
