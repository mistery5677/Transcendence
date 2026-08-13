import { useContext } from "react";
import { MatchMakingContext } from "./matchMakingContextValue";

export function useMatchMaking() {
	const context = useContext(MatchMakingContext);
	if (!context) {
		throw new Error("useMatchmaking must be used within a MatchmakingProvider");
	}
	return context;
}
