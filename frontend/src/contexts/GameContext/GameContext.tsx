import React, { createContext, useContext, useEffect, useReducer } from "react";
import type { GameContextType } from "./GameContextType";
import { useAuth } from "../UserContext";
import { useGlobalSocket } from "../GlobalSocketContext/GlobalSocketContext";
import { toastWrapper } from "../../adapters/toastWrapper";
import { useMatchMaking } from "../MatchMakingContext/MatchMakingContext";
import { gameReducer, initialState } from "./GameReducer";

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
	const { socket } = useGlobalSocket();
	const { state: authState } = useAuth();
	const { setIsSearchingMatch } = useMatchMaking();

	const [state, dispatch] = useReducer(gameReducer, initialState);

	const gameIdRef = React.useRef<string | null>(null);
	gameIdRef.current = state.gameId;
	const hasUser = !!authState.user;

	const surrender = () => {
		if (socket && state.gameId) socket.emit("requestSurrender", { gameId: state.gameId });
	};

	const proposeDraw = () => {
		if (socket && state.gameId) socket.emit("proposeDraw", { gameId: state.gameId });
	};
	const proposeRematch = () => {
		const targetGameId = state.gameId ?? state.lastFinishedGameId;
		if (socket && targetGameId) socket.emit("proposeRematch", { gameId: targetGameId });
	};

	const handleDrawResponse = (accept: boolean) => {
		if (socket && state.gameId) {
			socket.emit("respondDraw", {
				gameId: state.gameId,
				response: accept,
			});
		}
		dispatch({ type: "SET_DRAW_PROPOSAL", payload: false });
	};

	const handleRematchResponse = (accept: boolean) => {
		const targetGameId = state.gameId ?? state.lastFinishedGameId;
		if (socket && targetGameId) {
			socket.emit("respondRematch", {
				gameId: targetGameId,
				response: accept,
			});
			dispatch({ type: "SET_REMATCH_PROPOSAL", payload: false });
		}
	};

	const handleTimeOut = () => {
		if (socket && state.gameId) {
			console.log("Time is over");
			socket.emit("timeOut", { gameId: state.gameId });
		}
	};

	const resetGameContextToDefault = () => {
		dispatch({ type: "RESET_CONTEXT" });
		setIsSearchingMatch(false);
	};

	useEffect(() => {
		console.log("GameContext state changed:", state.gameHistory);
	}, [state.gameHistory]);

	useEffect(() => {
		if (!state.gameId || state.gameOver || !state.color) return;

		const interval = setInterval(() => {
			const currentLeft = state.currentTurn === "w" ? state.whiteTimeLeft : state.blackTimeLeft;

			if (currentLeft <= 1) {
				clearInterval(interval);
				if (state.currentTurn === state.color) handleTimeOut();
			} else {
				dispatch({ type: "TICK_CLOCK", payload: { turn: state.currentTurn } });
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [state.gameId, state.currentTurn, state.color, state.gameOver, state.whiteTimeLeft, state.blackTimeLeft]);

	useEffect(() => {
		if (!socket || !hasUser) return;

		console.log("[Game] Checking for active games");
		socket.emit("checkActiveGame");

		const onGameState = (data: any) => {
			setIsSearchingMatch(false);
			dispatch({ type: "START_GAME", payload: data });
		};

		const onNoActiveGame = () => {
			console.log("There is no active Game, you can start on lateral buttons");
		};

		const onMove = (data: any) => dispatch({ type: "MOVE", payload: data });

		const onGameOver = (data: any) => {
			setIsSearchingMatch(false);
			dispatch({ type: "GAME_OVER", payload: data, lastGameId: gameIdRef.current });
		};

		const onActiveGameNotFound = () => {
			alert("Your match finish on unexpected way");
			setIsSearchingMatch(false);
			dispatch({ type: "UNEXPECTED_DISCONNECT" });
		};

		const onError = (data: any) => {
			if (data.message === "Game not Found") {
				setIsSearchingMatch(false);
				alert("The match doesn't exist anymore");
			}
		};
		const onOpponentDisconnected = () => toastWrapper.warn("Player has left, have 1 Minute to come back");

		const onOpponentReconnected = () => toastWrapper.success("Opponent has reconnected, ready to play");

		socket.on("gameState", onGameState);
		socket.on("noActiveGame", onNoActiveGame);
		socket.on("move", onMove);
		socket.on("gameOver", onGameOver);
		socket.on("activeGameNotFound", onActiveGameNotFound);
		socket.on("error", onError);
		socket.on("opponentDisconnected", onOpponentDisconnected);
		socket.on("opponentReconnected", onOpponentReconnected);

		return () => {
			console.log("[Game] Exiting of game board. Removing all listeners");
			socket.off("noActiveGame", onNoActiveGame);
			socket.off("gameState", onGameState);
			socket.off("move", onMove);
			socket.off("gameOver", onGameOver);
			socket.off("activeGameNotFound", onActiveGameNotFound);
			socket.off("error", onError);
			socket.off("opponentDisconnected", onOpponentDisconnected);
			socket.off("opponentReconnected", onOpponentReconnected);
		};
	}, [socket]);

	useEffect(() => {
		if (!socket) {
			return;
		}

		const onDrawProposed = () => dispatch({ type: "SET_DRAW_PROPOSAL", payload: true });
		const onRematchProposed = () => dispatch({ type: "SET_REMATCH_PROPOSAL", payload: true });
		const onDrawRejected = () => toastWrapper.warn("The draw proposal was rejected.");

		const onRematchRejected = () => toastWrapper.error("The Rematch proposal was rejected.");

		const onRematchStarted = (data: { newGameId: string }) => {
			toastWrapper.success("Rematch started! Good luck.");
			dispatch({ type: "RESET_CONTEXT" });
			gameIdRef.current = data.newGameId;

			socket.emit("checkActiveGame");
		};

		socket.on("rematchProposed", onRematchProposed);
		socket.on("drawProposed", onDrawProposed);
		socket.on("drawRejected", onDrawRejected);
		socket.on("rematchRejected", onRematchRejected);
		socket.on("rematchStarted", onRematchStarted);

		return () => {
			socket.off("drawProposed", onDrawProposed);
			socket.off("rematchProposed", onRematchProposed);
			socket.off("drawRejected", onDrawRejected);
			socket.off("rematchRejected", onRematchRejected);
			socket.off("rematchStarted", onRematchStarted);
		};
	}, [socket]);
	if (!authState.user) return null;

	return (
		<GameContext.Provider
			value={{
				...state,
				socket,
				isConnected: !!socket?.connected,
				surrender,
				handleDrawResponse,
				handleRematchResponse,
				proposeDraw,
				proposeRematch,
				setMessages: (action) => dispatch({ type: "SET_MESSAGES", payload: action as any }),
				resetGameContextToDefault,
				handleTimeOut,
			}}>
			{children}
		</GameContext.Provider>
	);
};

export const useGame = () => {
	const context = useContext(GameContext);
	if (!context) {
		throw new Error("useGame must be used inside GameProvider");
	}
	return context;
};
