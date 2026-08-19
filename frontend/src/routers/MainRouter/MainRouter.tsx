import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AppProviders } from "./providers/AppProviders";
import { AppLayout } from "./layouts/AppLayout";
import { ProtectedRoute } from "./guards/ProtectedRoute";
import { PublicRoutes } from "./routes/PublicRoutes";
import { ProtectedRoutes } from "./routes/ProtectedRoutes";

export function MainRouter() {
  return (
    <BrowserRouter>
      <AppProviders>
        <Routes>
          <Route element={<AppLayout />}>
            {PublicRoutes}

            <Route element={<ProtectedRoute />}>
            {ProtectedRoutes}
            </Route>
          </Route>
        </Routes>
      </AppProviders>
    </BrowserRouter>
  );
}