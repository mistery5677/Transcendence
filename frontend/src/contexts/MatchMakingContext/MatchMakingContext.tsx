import React, { createContext, useContext, useState } from "react";
import type { MatchMakingContextType } from "./MatchMakingType";
import { useGlobalSocket } from "../GlobalSocketContext/GlobalSocketContext";
import { useAuth } from "../UserContext";
import type { MatchStartOptions } from "../GameContext/GameContextType";

const MatchMakingContext = createContext<MatchMakingContextType | undefined>(undefined);

export const MatchMakingProvider = ({ children }: { children: React.ReactNode }) => {
	const { socket } = useGlobalSocket();
	const { state: authState } = useAuth();
	const [isSearchingMatch, setIsSearchingMatch] = useState<boolean>(false);

	const hasUser = !!authState.user;

	const inviteToPlay = (friendId: number) => {
		if (socket) {
			socket.emit("inviteToPlay", { friendId });
			console.log("invite to Play");
		}
	};

	const startOnlineGame = (options: MatchStartOptions) => {
		if (!socket || !hasUser) return;
		console.log("[Matchmaking] Joining the Queue", options);
		setIsSearchingMatch(true);
		socket.emit("joinQueue", options);
	};

	const startBotGame = (options: MatchStartOptions) => {
		if (!socket || !hasUser) return;
		console.log("[Matchmaking] Starting game with bot", options);
		setIsSearchingMatch(false);
		socket.emit("startBotGame", options);
	};

	const startAIGame = (options: MatchStartOptions) => {
		if (!socket || !hasUser) return;
		setIsSearchingMatch(false);
		socket.emit("startAIGame", options);
	};

	return (
		<MatchMakingContext.Provider
			value={{ isSearchingMatch, setIsSearchingMatch, startOnlineGame, startBotGame, startAIGame, inviteToPlay }}>
			{children}
		</MatchMakingContext.Provider>
	);
};

export const useMatchMaking = () => {
	const context = useContext(MatchMakingContext);
	if (!context) throw new Error("useMatchmaking must be used within a MatchmakingProvider");
	return context;
};
