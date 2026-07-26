import { useCallback, useEffect, useRef, useState } from "react";
import { loadMoveEffect } from "../../utils/loadMoveEffect";
import { Chess, type Square } from "chess.js";
import { useGame } from "../../context/GameContext/GameContext";
import { analyzePosition } from "../../api/stockfish";

type PieceColor = "w" | "b";

type PendingPromotion = {
	from: string;
	to: string;
	color: PieceColor;
};

type DraggingPieceDataType = {
	isSparePiece: boolean;
	position: string; // e.g. "a8" or "wP"
	pieceType: string; // e.g. "wP" for white pawn, "bK" for black king
};

type PieceDropHandlerArgs = {
	piece: DraggingPieceDataType;
	sourceSquare: string;
	targetSquare: string | null;
};

type PromotionPiece = "q" | "r" | "b" | "n";

type UseBoardControllerParams = {
	onTurnChange?: (color: PieceColor) => void;
	darkSquareBackground: string;
	enableHelperMode?: boolean;
	learnLevel?: number;
};

const getKingSquare = (game: Chess, color: "w" | "b"): Square | null => {
	for (let r = 0; r < 8; r++) {
		const row = game.board()[r];
		for (let c = 0; c < 8; c++) {
			const piece = row[c];
			if (piece && piece.type === "k" && piece.color === color) {
				const file = String.fromCharCode(97 + c);
				const rank = 8 - r;
				return `${file}${rank}` as Square;
			}
		}
	}
	return null;
};

const getLastMoveSquares = (gameHistory: string[] | null | undefined): { from: string; to: string } | null => {
	if (!gameHistory || gameHistory.length === 0) return null;

	try {
		const tempGame = new Chess();

		for (const move of gameHistory) {
			tempGame.move(move);
		}

		const history = tempGame.history({ verbose: true });
		const last = history[history.length - 1];

		if (last) {
			return { from: last.from, to: last.to };
		}
	} catch (e) {
		console.error("Error getting lastMove:", e);
	}
	return null;
};

export function useBoardController({
	onTurnChange,
	darkSquareBackground,
	enableHelperMode,
	learnLevel,
}: UseBoardControllerParams) {
	const playMoveEffect = useRef<ReturnType<typeof loadMoveEffect>>(null);
	const chessGameRef = useRef(new Chess());
	const chessGame = chessGameRef.current;

	const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion | null>(null);

	const { socket, gameId, color, fen, currentTurn, gameOver, isSpectator, gameHistory } = useGame();

	const [chessPosition, setChessPosition] = useState(() => {
		if (fen && fen != "start") return fen;
		return chessGame.fen();
	});

	const canDragPiece = useCallback(
		(args: any) => {
			if (isSpectator || currentTurn !== color || gameOver) return false;

			const pieceString = args?.piece?.pieceType;

			if (typeof pieceString !== "string") return false;

			return pieceString.startsWith(color || "");
		},
		[color, currentTurn, isSpectator, gameOver],
	);

	const [helper, setHelper] = useState({
		bestMove: "",
		bestLine: "",
		depth: 0,
		positionEvaluation: 0,
		possibleMate: "",
	});

	const isMyLocalTurn = Boolean(enableHelperMode && gameId && color && chessGame.turn() === color);

	/// Analyze the current position using Stockfish when it's the player's turn and helper mode is enabled.
	useEffect(() => {
		if (!enableHelperMode) return;
		if (!isMyLocalTurn) return;
		if (chessGame.isGameOver() || chessGame.isDraw()) return;

		const controller = new AbortController();
		const turnAtRequest = chessGame.turn();

		void analyzePosition(chessPosition, {
			level: learnLevel ?? 5,
			moveTimeMs: 500,
			signal: controller.signal,
		})
			.then(({ positionEvaluation, possibleMate, pv, depth, bestMove }) => {
				if (controller.signal.aborted) return;
				if (turnAtRequest !== chessGame.turn()) return;
				if (chessGame.turn() !== color) return;

				const parsedBestMove = pv?.split(" ")?.[0] ?? bestMove ?? "";
				const evalCp = positionEvaluation ? Number(positionEvaluation) / 100 : 0;
				const signedEval = (chessGame.turn() === "w" ? 1 : -1) * evalCp;

				setHelper({
					bestMove: parsedBestMove,
					bestLine: pv ?? "",
					depth: depth ?? 0,
					positionEvaluation: signedEval,
					possibleMate: possibleMate ?? "",
				});
			})
			.catch((error) => {
				if (error?.name !== "AbortError") console.error(error);
			});

		return () => controller.abort();
	}, [enableHelperMode, learnLevel, chessPosition, gameId, color, chessGame]);

	/// Reset the helper state when it's not the player's turn or when helper mode is disabled.
	useEffect(() => {
		if (!enableHelperMode) return;
		if (isMyLocalTurn) return;

		setHelper((prev) => ({
			...prev,
			bestMove: "",
			bestLine: "",
			possibleMate: "",
		}));
	}, [enableHelperMode, isMyLocalTurn]);

	useEffect(() => {
		playMoveEffect.current = loadMoveEffect();
	}, []);

	/// Update the chess position when the FEN changes, and notify the parent component of turn changes.
	useEffect(() => {
		if (!fen) return;

		if (fen === "start") {
			chessGame.reset();
			setChessPosition(chessGame.fen());
			if (onTurnChange) onTurnChange("w");
			return;
		}

		try {
			chessGame.load(fen);
			setChessPosition(fen);
		} catch {
			setChessPosition(chessGame.fen());
		}

		onTurnChange?.(currentTurn);
	}, [fen, currentTurn, chessGame, onTurnChange]);

	/// Check if a move is a promotion move.
	const isPromotionMove = useCallback(
		(sourceSquare: string, targetSquare: string) => {
			try {
				const sourcePiece = chessGame.get(sourceSquare as Square);
				if (!sourcePiece || sourcePiece.type !== "p") return false;

				const legalMoves = chessGame.moves({ square: sourceSquare as Square, verbose: true });
				return legalMoves.some((move) => move.to === targetSquare && move.flags.includes("p"));
			} catch {
				return false;
			}
		},
		[chessGame],
	);

	/// Submit a move to the server and update the local chess position.
	const submitMove = useCallback(
		(from: string, to: string, promotion?: PromotionPiece) => {
			if (!gameId || !socket || currentTurn !== color || gameOver) return false;
			if (chessGame.turn() !== color || chessGame.isGameOver()) return false;

			const moveData = promotion ? { from, to, promotion } : { from, to };

			try {
				const move = chessGame.move(moveData);
				if (!move) return false;

				if (playMoveEffect.current) {
					playMoveEffect.current();
				}

				socket.emit("move", { gameId, move: moveData });
				setChessPosition(chessGame.fen());
				return true;
			} catch {
				return false;
			}
		},
		[socket, gameId, color, currentTurn, chessGame],
	);

	/// Handle piece drop events on the chessboard, including promotion handling.
	const onPieceDrop = useCallback(
		({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
			if (!gameId || !socket || currentTurn !== color || gameOver) return false;
			if (chessGame.turn() !== color || chessGame.isGameOver()) return false;

			if (!targetSquare) {
				return false;
			}

			if (isPromotionMove(sourceSquare, targetSquare)) {
				setPendingPromotion({
					from: sourceSquare,
					to: targetSquare,
					color: color === "b" ? "b" : "w",
				});
				return false;
			}

			return submitMove(sourceSquare, targetSquare);
		},
		[socket, gameId, color, currentTurn, chessGame, isPromotionMove, submitMove],
	);

	/// Handle promotion selection by submitting the move with the selected promotion piece.
	const onPromotionSelect = useCallback(
		(piece: PromotionPiece) => {
			if (!pendingPromotion) return;

			submitMove(pendingPromotion.from, pendingPromotion.to, piece);
			setPendingPromotion(null);
		},
		[pendingPromotion, submitMove],
	);
	const isMyTurn = isMyLocalTurn;

	const bestMoveSquares =
		isMyTurn && helper.bestMove.length >= 4
			? {
					from: helper.bestMove.slice(0, 2),
					to: helper.bestMove.slice(2, 4),
				}
			: null;

	// Small green dot for target square + subtle ring on origin.
	const helperSquareStyles: Record<string, React.CSSProperties> = {};

	const lastMove = getLastMoveSquares(gameHistory);
	if (lastMove) {
		helperSquareStyles[lastMove.from] = {
			backgroundColor: "rgba(30, 144, 255, 0.25)",
			transition: "background-color 140ms ease",
		};

		helperSquareStyles[lastMove.to] = {
			backgroundColor: "rgba(30, 144, 255, 0.4)",
			transition: "background-color 140ms ease",
		};
	}

	if (chessGame.inCheck() && !gameOver) {
		const activeColor = chessGame.turn();
		const kingSquare = getKingSquare(chessGame, activeColor);

		if (kingSquare) {
			helperSquareStyles[kingSquare] = {
				background: "radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, rgba(239, 68, 68, 0.15) 70%)",
				boxShadow: "inset 0 0 0 4px rgba(239, 68, 68, 0.9)",
				transition: "all 140ms ease",
			};
		}
	}

	const showHint = Boolean(enableHelperMode && isMyTurn && bestMoveSquares);

	if (showHint && bestMoveSquares) {
		helperSquareStyles[bestMoveSquares.from] = {
			boxShadow: "inset 0 0 0 3px rgba(34, 197, 94, 0.9)",
			transition: "box-shadow 140ms ease",
		};
		helperSquareStyles[bestMoveSquares.to] = {
			background:
				"radial-gradient(circle, rgba(34,197,94,0.78) 0 22%, rgba(34,197,94,0.22) 23% 40%, transparent 41%)",
			transition: "background 140ms ease",
		};
	}

	if (showHint && bestMoveSquares) {
		helperSquareStyles[bestMoveSquares.from] = {
			boxShadow: "inset 0 0 0 5px rgba(250, 204, 21, 0.75)",
		};

		helperSquareStyles[bestMoveSquares.to] = {
			boxShadow: "inset 0 0 0 3px rgba(250, 204, 21, 0.75)",
			background:
				"radial-gradient(circle, rgba(250, 204, 21, 0.75) 0 22%, rgba(250, 204, 21, 0.75) 23% 40%, transparent 41%)",
		};
	}

	const chessboardOptions = {
		position: chessPosition,
		onPieceDrop,
		canDragPiece,
		allowDragging: Boolean(gameId),
		id: "play-vs-random",
		boardOrientation: color === "b" ? ("black" as const) : ("white" as const),
		lightSquareStyle: { backgroundColor: "var(--color-board-light)" },
		darkSquareStyle: { backgroundColor: darkSquareBackground },
		squareStyles: helperSquareStyles,
	};

	const idleBoardOptions = {
		id: "play-vs-random",
		boardOrientation: "white" as const,
		lightSquareStyle: {
			backgroundColor: "var(--color-board-light)",
		},
		darkSquareStyle: {
			backgroundColor: darkSquareBackground,
		},
	};

	return {
		isGameActive: Boolean(gameId) || gameOver !== null,
		pendingPromotion,
		onPromotionSelect,
		onPromotionCancel: () => setPendingPromotion(null),
		chessboardOptions,
		idleBoardOptions,
		helper,
	};
}
