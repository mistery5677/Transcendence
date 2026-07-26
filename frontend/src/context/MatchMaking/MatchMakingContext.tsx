import React, { createContext, useContext, useEffect, useState } from "react";
import type { MatchMakingContextType } from "./MatchMakingType";
import { useGlobalSocket } from "../GlobalSocket/GlobalSocketContext";
import { useAuth } from "../auth";
import type { MatchStartOptions } from "../Game/GameContextType";
import { useNavigate } from "react-router-dom";
import { toastWrapper } from "../../adapters/toastWrapper";

const MatchMakingContext = createContext<MatchMakingContextType | undefined>(undefined);

export const MatchMakingProvider = ({ children }: { children: React.ReactNode }) => {
	const { socket } = useGlobalSocket();
	const { state: authState } = useAuth();
	const [isSearchingMatch, setIsSearchingMatch] = useState<boolean>(false);
	const navigate = useNavigate();

	const hasUser = !!authState.user;

	const inviteToPlay = (friendId: number) => {
		if (socket) {
			socket.emit("inviteToPlay", { friendId });
			console.log("invite to Play");
		}
	};

	const respondToGameInvite = (hostId: string, accept: boolean, notificationId: string) => {
		if (!socket || !hasUser) return;

		console.log(`[Matchmaking] Responding to invite from ${hostId}: ${accept ? "ACCEPT" : "REJECT"}`);

		socket.emit("respondToGameInvite", {
			hostId,
			accept,
			notificationId,
		});
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
	useEffect(() => {
		if (!socket) return;

		socket.on("matchInviteAccepted", (data: { gameId: string }) => {
			console.log("Invitation accepted: Redirect to game:", data.gameId);
			toastWrapper.success("Your challenge has been accepted ", {});

			setTimeout(() => {
				navigate(`/play`);
			}, 1500);
		});
		return () => {
			socket.off("matchInviteAccepted");
		};
	}, [socket, navigate]);

	return (
		<MatchMakingContext.Provider
			value={{
				isSearchingMatch,
				setIsSearchingMatch,
				startOnlineGame,
				startBotGame,
				startAIGame,
				inviteToPlay,
				respondToGameInvite,
			}}>
			{children}
		</MatchMakingContext.Provider>
	);
};

export const useMatchMaking = () => {
	const context = useContext(MatchMakingContext);
	if (!context) throw new Error("useMatchmaking must be used within a MatchmakingProvider");
	return context;
};
