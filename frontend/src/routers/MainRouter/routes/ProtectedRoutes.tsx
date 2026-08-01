import { Route } from "react-router-dom";

import { RouterPaths } from "../RouterPath";

import { Friends, Settings } from "../../../pages";

import { Play } from "../../../pages/Play/Play";
import { LiveGames } from "../../../pages/LiveGames/LiveGames";

import { GameProviderLayout } from "../layouts/GameProviderLayout";

export const  ProtectedRoutes = (
  <>
      <Route
        path={RouterPaths.FRIENDS}
        element={<Friends />}
      />

      <Route
        path={RouterPaths.SETTINGS}
        element={<Settings tabOpt="profile" />}
      />

      <Route element={<GameProviderLayout />}>
        <Route
          path={RouterPaths.PLAY}
          element={<Play />}
        />

        <Route
          path={RouterPaths.LIVEGAMES}
          element={<LiveGames />}
        />
      </Route>
    </>
);