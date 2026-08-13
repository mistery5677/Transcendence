import React, { useCallback, useEffect, useReducer, useRef, useState } from "react";
import type { GameOverState, GameState, MessageType } from "./GameContextType";
import { useAuth } from "../auth";
import { useGlobalSocket } from "../GlobalSocket/useGlobalSocket";
import { toastWrapper } from "../../adapters/toastWrapper";
import { useMatchMaking } from "../MatchMaking/useMatchMaking";
import { gameReducer, initialState } from "./GameReducer";
import { GameContext } from "./gameContextValue";

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
	const { socket } = useGlobalSocket();
	const { state: authState } = useAuth();
	const { setIsSearchingMatch } = useMatchMaking();
	const [state, dispatch] = useReducer(gameReducer, initialState);
	const [isSpectator, setIsSpectator] = useState<boolean>(false);
	const [isSwitchingGame, setIsSwitchingGame] = useState<boolean>(false);

	const gameIdRef = useRef<string | null>(null);
	const hasUser = !!authState.user;

	const surrender = () => {
		if (socket && state.gameId) socket.emit("requestSurrender", { gameId: state.gameId });
	};

	const proposeDraw = () => {
		if (socket && state.gameId) socket.emit("proposeDraw", { gameId: state.gameId });
	};
	const proposeRematch = () => {
		const targetGameId = state.gameId ?? state.lastFinishedGameId ?? gameIdRef.current;
		if (socket && targetGameId) {
			console.log("Proposing rematch for game", targetGameId);
			socket.emit("proposeRematch", { gameId: targetGameId });
			if (state.mode !== "ai" && state.mode !== "bot") {
				toastWrapper.warn("Waiting for opponent...");
			}
			return;
		}

		toastWrapper.error("Unable to start rematch right now.");
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
		const targetGameId = state.gameId ?? state.lastFinishedGameId ?? gameIdRef.current;
		if (socket && targetGameId) {
			socket.emit("respondRematch", {
				gameId: targetGameId,
				response: accept,
			});
			dispatch({ type: "SET_REMATCH_PROPOSAL", payload: false });
			return;
		}

		toastWrapper.error("Unable to respond to rematch right now.");
	};

	const handleTimeOut = useCallback(() => {
		if (socket && state.gameId) {
			console.log("Time is over");
			socket.emit("timeOut", { gameId: state.gameId });
		}
	}, [socket, state.gameId]);

	const spectateGame = (targetGameId: string) => {
		if (!socket) return;
		socket.emit("spectateGame", { gameId: targetGameId });
	};

	const resetGameContextToDefault = () => {
		dispatch({ type: "RESET_CONTEXT" });
		setIsSearchingMatch(false);
	};

	const markSwitchingGame = () => {
		setIsSwitchingGame(true);
	};

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
	}, [
		handleTimeOut,
		state.gameId,
		state.currentTurn,
		state.color,
		state.gameOver,
		state.whiteTimeLeft,
		state.blackTimeLeft,
	]);

	useEffect(() => {
		if (!socket || !hasUser) return;

		console.log("[Game] Checking for active games");
		socket.emit("checkActiveGame");

		const onGameState = (data: {
			gameId: string;
			color: "w" | "b";
			mode: GameState["mode"];
			fen: string;
			currentTurn: "w" | "b";
			opponentId: string | null;
			gameHistory?: string[];
			chatHistory?: MessageType[];
			whiteTimeLeft?: number;
			blackTimeLeft?: number;
		}) => {
			gameIdRef.current = data.gameId;
			setIsSpectator(false);
			setIsSearchingMatch(false);
			setIsSwitchingGame(false);
			dispatch({ type: "START_GAME", payload: data });
		};

		const onNoActiveGame = () => {
			console.log("There is no active Game, you can start on lateral buttons");
		};

		const onMove = (data: {
			fen: string;
			currentTurn: "w" | "b";
			gameHistory?: string[];
			whiteTimeLeft?: number;
			blackTimeLeft?: number;
		}) => dispatch({ type: "MOVE", payload: data });

		const onGameOver = (data: { gameOver: GameOverState }) => {
			setIsSearchingMatch(false);
			const finishedGameId = state.gameId ?? gameIdRef.current;
			dispatch({ type: "GAME_OVER", payload: data, lastGameId: finishedGameId });
		};

		const onActiveGameNotFound = () => {
			alert("Your match finish on unexpected way");
			setIsSearchingMatch(false);
			dispatch({ type: "UNEXPECTED_DISCONNECT" });
		};

		const onError = (data: { message?: string }) => {
			if (data.message === "Game not Found") {
				setIsSearchingMatch(false);
				alert("The match doesn't exist anymore");
			}
		};
		const onOpponentDisconnected = () => toastWrapper.warn("Player has left, have 1 Minute to come back");

		const onOpponentReconnected = () => toastWrapper.success("Opponent has reconnected, ready to play");

		const onSpectatorState = (data: {
			gameId: string;
			fen: string;
			turn: "w" | "b";
			history?: string[];
			chatHistory?: MessageType[];
			playerW?: number | string | null;
			playerB?: number | string | null;
			playerWName?: string | null;
			playerBName?: string | null;
			playerWAvatar?: string | null;
			playerBAvatar?: string | null;
			whiteTimeLeft?: number;
			blackTimeLeft?: number;
		}) => {
			setIsSpectator(true);
			gameIdRef.current = data.gameId;
			dispatch({ type: "SPECTATE", payload: data });
		};

		socket.on("gameState", onGameState);
		socket.on("spectatorState", onSpectatorState);
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
			socket.off("spectatorState", onSpectatorState);
			socket.off("move", onMove);
			socket.off("gameOver", onGameOver);
			socket.off("activeGameNotFound", onActiveGameNotFound);
			socket.off("error", onError);
			socket.off("opponentDisconnected", onOpponentDisconnected);
			socket.off("opponentReconnected", onOpponentReconnected);
		};
	}, [hasUser, setIsSearchingMatch, socket, state.gameId]);

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
				addMessage: (msg: MessageType) => dispatch({ type: "ADD_MESSAGE", payload: msg }),
				handleRematchResponse,
				proposeDraw,
				proposeRematch,
				setMessages: (action) =>
					dispatch({
						type: "SET_MESSAGES",
						payload: typeof action === "function" ? action(state.messages) : action,
					}),
				resetGameContextToDefault,
				isSpectator,
				spectateGame,
				isSwitchingGame,
				markSwitchingGame,
				handleTimeOut,
			}}>
			{children}
		</GameContext.Provider>
	);
};
