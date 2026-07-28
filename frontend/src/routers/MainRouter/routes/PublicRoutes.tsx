import { Route } from "react-router-dom";

import { RouterPaths } from "../RouterPath";

import {
  Error,
  Friends,
  HistoryPage,
  Home,
  LeaderBoards,
  Privacy,
  Settings,
  Terms,
  Ze,
} from "../../../pages";

import { ProfilePage } from "../../../pages/Profile/ProfilePage";
import { Rules } from "../../../pages/Rules/Rules";

import { MultiRoute } from "../../../components";

export const PublicRoutes = (
  
    <>
      {MultiRoute(RouterPaths.HOME, <Home />)}

      <Route
        path={RouterPaths.ERROR}
        element={<Error />}
      />

      <Route
        path={RouterPaths.ZE}
        element={<Ze />}
      />

      <Route
        path={RouterPaths.RULES}
        element={<Rules />}
      />

      <Route
        path={RouterPaths.LEADERBOARDS}
        element={<LeaderBoards />}
      /> 

      <Route
        path={RouterPaths.HISTORY}
        element={<HistoryPage />}
      />

      <Route
        path={`${RouterPaths.HISTORY}/:username`}
        element={<HistoryPage />}
      />

      <Route
        path={`${RouterPaths.PROFILE}/:username`}
        element={<ProfilePage />}
      />

      <Route
        path={RouterPaths.PRIVACY}
        element={<Privacy />}
      />

      <Route
        path={RouterPaths.TERMS}
        element={<Terms />}
      />
    </>
  );