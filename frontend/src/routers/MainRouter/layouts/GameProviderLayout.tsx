import { Outlet } from "react-router-dom";

import { GameProvider } from "../../../context/Game/GameContext";

export function GameProviderLayout() {
  return (
    <GameProvider>
      <Outlet />
    </GameProvider>
  );
}