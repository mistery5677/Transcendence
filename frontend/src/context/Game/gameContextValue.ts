import { createContext } from "react";
import type { GameContextType } from "./GameContextType";

export const GameContext = createContext<GameContextType | undefined>(undefined);
