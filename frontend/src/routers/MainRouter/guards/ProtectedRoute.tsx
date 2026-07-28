import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../../context/auth";

export function ProtectedRoute() {
  const { state } = useAuth();


  if (!state.user) {
    return <Navigate to={"/"} replace />;
  }


  return <Outlet />;
}