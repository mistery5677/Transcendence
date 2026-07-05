import React, { createContext, useContext, useEffect, useState } from "react";
import type { GameContextType, GameOverState, MatchStartOptions, MessageType } from "./GameContextType";
import { useAuth } from "../UserContext";
import { useGlobalSocket } from "../GlobalSocketContext/GlobalSocketContext";
import { toastWrapper } from "../../adapters/toastWrapper";

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
	const { socket } = useGlobalSocket();
	const { state: authState } = useAuth();

	const [gameId, setGameId] = useState<string | null>(null);
	const [color, setColor] = useState<"w" | "b" | null>("w");
	const [fen, setFen] = useState("start");
	const [currentTurn, setCurrentTurn] = useState<"w" | "b">("w");
	const [gameOver, setGameOver] = useState<GameOverState>(null);
	const [messages, setMessages] = useState<MessageType[]>([]);
	const [drawProposal, setDrawProposal] = useState<boolean>(false);
	const [rematchProposal, setRematchProposal] = useState<boolean>(false);
	const [opponentId, setOpponentId] = useState<string | null>(null);
	const [lastFinishedGameId, setLastFinishedGameId] = useState<string | null>(null);
	const [isSearchingMatch, setIsSearchingMatch] = useState<boolean>(false);

	const gameIdRef = React.useRef<string | null>(null);
	const hasUser = !!authState.user;
	//Timer variables
	//TODO: Make the timer choose by the room mode created
	const [whiteTimeLeft, setWhiteTimeLeft] = useState<number>(10);
	const [blackTimeLeft, setBlackTimeLeft] = useState<number>(10);

	if (!authState.user) return null;

	const inviteToPlay = (friendId: number) => {
		if (socket) {
			socket.emit("inviteToPlay", { friendId });
			console.log("invite to Play");
		}
	};

	const surrender = () => {
		if (socket && gameId) {
			socket.emit("requestSurrender", { gameId });
		}
	};

	const proposeDraw = () => {
		if (socket && gameId) {
			socket.emit("proposeDraw", { gameId });
		}
	};
	const proposeRematch = () => {
		const targetGameId = gameId ?? lastFinishedGameId;
		if (socket && targetGameId) {
			socket.emit("proposeRematch", { gameId: targetGameId });
		}
	};

	const handleDrawResponse = (accept: boolean) => {
		if (socket && gameId) {
			socket.emit("respondDraw", {
				gameId: gameId,
				response: accept,
			});
		}
		setDrawProposal(false);
	};

	const handleRematchResponse = (accept: boolean) => {
		const targetGameId = gameId ?? lastFinishedGameId;
		if (socket && targetGameId) {
			socket.emit("respondRematch", {
				gameId: targetGameId,
				response: accept,
			});
			setRematchProposal(false);
		}
	};

	const handleTimeOut = () => {
		if (socket && gameId) {
			console.log("Time is over");
			socket.emit("timeOut", { gameId });
		}
	};

	const startOnlineGame = (options: MatchStartOptions) => {
		if (!socket || !hasUser) return;

		console.log("[Game] Joining the Queue", options);
		setIsSearchingMatch(true);
		setGameOver(null);
		setGameId(null);
		setOpponentId(null);
		setMessages([]);
		socket.emit("joinQueue", options);
	};

	const startBotGame = (options: MatchStartOptions) => {
		if (!socket || !hasUser) return;

		console.log("[Game] Starting game with bot", options);
		setIsSearchingMatch(false);
		setGameOver(null);
		setGameId(null);
		setOpponentId(null);
		setMessages([]);
		socket.emit("startBotGame", options);
	};

	const startAIGame = (options: MatchStartOptions) => {
		if (!socket || !hasUser) return;

		setIsSearchingMatch(false);
		setGameOver(null);
		setGameId(null);
		setOpponentId(null);
		socket.emit("startAIGame", options);
	};

	const resetGameContextToDefault = () => {
		setGameOver(null);
		setFen("start");
		setCurrentTurn("w");
		setGameId(null);
		gameIdRef.current = null;
		setOpponentId(null);
		setWhiteTimeLeft(10);
		setBlackTimeLeft(10);
	};

	useEffect(() => {
		if (!gameId || gameOver || !color) return;

		const interval = setInterval(() => {
			if (currentTurn === "w") {
				setWhiteTimeLeft((prev) => {
					if (prev <= 1) {
						clearInterval(interval);
						if (color === "w") handleTimeOut();
						return 0;
					}
					return prev - 1;
				});
			} else {
				setBlackTimeLeft((prev) => {
					if (prev <= 1) {
						clearInterval(interval);
						if (color === "b") handleTimeOut();
						return 0;
					}
					return prev - 1;
				});
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [gameId, currentTurn, color, gameOver]);

	useEffect(() => {
		if (!socket || !hasUser) return;

		console.log("[Game] Checking for active games");
		socket.emit("checkActiveGame");

		const onGameState = (data: any) => {
			setIsSearchingMatch(false);
			setGameId(data.gameId);
			gameIdRef.current = data.gameId;
			setLastFinishedGameId(null);
			setColor(data.color);
			setFen(data.fen);
			setCurrentTurn(data.currentTurn);
			setOpponentId(data.opponentId);

			if (data.chatHistory) {
				setMessages(data.chatHistory);
			}

			// Read the timer came from the server
			setWhiteTimeLeft(data.whiteTimeLeft ?? 10);
			setBlackTimeLeft(data.blackTimeLeft ?? 10);
		};

		const onNoActiveGame = () => {
			console.log("There is no active Game, you can start on lateral buttons");
		};

		const onMove = (data: any) => {
			setFen(data.fen);
			setCurrentTurn(data.currentTurn);
			setWhiteTimeLeft(data.whiteTimeLeft ?? whiteTimeLeft);
			setBlackTimeLeft(data.blackTimeLeft ?? blackTimeLeft);
		};

		const onGameOver = (data: any) => {
			setLastFinishedGameId(gameIdRef.current);
			setIsSearchingMatch(false);
			setGameOver(data.gameOver);
			setWhiteTimeLeft(data.gameOver.whiteTimeLeft ?? 10);
			setBlackTimeLeft(data.gameOver.blackTimeLeft ?? 10);
		};

		const onActiveGameNotFound = () => {
			alert("Your match finish on unexpected way");
			setIsSearchingMatch(false);
			setGameId(null);
			gameIdRef.current = null;
		};

		const onError = (data: any) => {
			if (data.message === "Game not Found") {
				setIsSearchingMatch(false);
				alert("The match doesn't exist anymore");
			}
		};
		const onOpponentDisconnected = () => {
			toastWrapper.warn("Player has left, have 1 Minute to come back");
		};
		const onOpponentReconnected = () => {
			toastWrapper.success("Opponent has reconnected, ready to play");
		};

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

		const onDrawProposed = () => setDrawProposal(true);
		const onRematchProposed = () => setRematchProposal(true);
		const onDrawRejected = () => {
			toastWrapper.warn("The draw proposal was rejected.");
		};

		const onRematchRejected = () => {
			toastWrapper.error("The Rematch proposal was rejected.");
		};
		const onRematchStarted = (data: { newGameId: string }) => {
			toastWrapper.success("Rematch started! Good luck.");
			setGameOver(null);
			setDrawProposal(false);
			setRematchProposal(false);
			setLastFinishedGameId(null);
			setGameId(data.newGameId);
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
				socket,
				gameId,
				color,
				isConnected: !!socket?.connected,
				fen,
				currentTurn,
				gameOver,
				surrender,
				drawProposal,
				rematchProposal,
				handleDrawResponse,
				handleRematchResponse,
				proposeDraw,
				proposeRematch,
				startOnlineGame,
				startBotGame,
				startAIGame,
				opponentId,
				isSearchingMatch,
				messages,
				setMessages,
				resetGameContextToDefault,
				inviteToPlay,
				// Timer variables
				whiteTimeLeft,
				blackTimeLeft,
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
