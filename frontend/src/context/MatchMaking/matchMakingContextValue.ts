import { createContext } from "react";
import type { MatchMakingContextType } from "./MatchMakingType";

export const MatchMakingContext = createContext<MatchMakingContextType | undefined>(undefined);
