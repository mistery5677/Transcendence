import { Navigate, Outlet } from "react-router-dom";
import { FallBack } from "../../../components";
import { useAuth } from "../../../context/auth";

export function ProtectedRoute() {
  const { state } = useAuth();

  if (state.isLoading) {
    return <FallBack />;
  }

  if (!state.user) {
    return <Navigate to={"/"} replace />;
  }


  return <Outlet />;
}