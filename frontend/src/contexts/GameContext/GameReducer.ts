import type { GameOverState, GameState, MessageType } from "./GameContextType";

export const initialState = {
	gameId: null as string | null,
	color: "w" as "w" | "b" | null,
	fen: "start",
	currentTurn: "w" as "w" | "b",
	gameOver: null as GameOverState,
	messages: [] as MessageType[],
	drawProposal: false,
	rematchProposal: false,
	opponentId: null as string | null,
	lastFinishedGameId: null as string | null,
	whiteTimeLeft: 10,
	blackTimeLeft: 10,
};

export type GameAction =
	| { type: "START_GAME"; payload: any }
	| { type: "MOVE"; payload: any }
	| { type: "GAME_OVER"; payload: any; lastGameId: string | null }
	| { type: "SET_DRAW_PROPOSAL"; payload: boolean }
	| { type: "SET_REMATCH_PROPOSAL"; payload: boolean }
	| { type: "SET_MESSAGES"; payload: MessageType[] }
	| { type: "TICK_CLOCK"; payload: { turn: "w" | "b" } }
	| { type: "UNEXPECTED_DISCONNECT" }
	| { type: "RESET_CONTEXT" };

export function gameReducer(state: GameState, action: GameAction): GameState {
	switch (action.type) {
		case "START_GAME":
			return {
				...state,
				gameId: action.payload.gameId,
				lastFinishedGameId: null,
				color: action.payload.color,
				fen: action.payload.fen,
				currentTurn: action.payload.currentTurn,
				opponentId: action.payload.opponentId,
				messages: action.payload.chatHistory ?? [],
				whiteTimeLeft: action.payload.whiteTimeLeft ?? 10,
				blackTimeLeft: action.payload.blackTimeLeft ?? 10,
				gameOver: null,
			};

		case "MOVE":
			return {
				...state,
				fen: action.payload.fen,
				currentTurn: action.payload.currentTurn,
				whiteTimeLeft: action.payload.whiteTimeLeft ?? state.whiteTimeLeft,
				blackTimeLeft: action.payload.blackTimeLeft ?? state.blackTimeLeft,
			};

		case "GAME_OVER":
			return {
				...state,
				lastFinishedGameId: action.lastGameId,
				gameOver: action.payload.gameOver,
				whiteTimeLeft: action.payload.gameOver.whiteTimeLeft ?? 10,
				blackTimeLeft: action.payload.gameOver.blackTimeLeft ?? 10,
			};

		case "TICK_CLOCK":
			const isWhite = action.payload.turn === "w";
			return {
				...state,
				whiteTimeLeft: isWhite ? Math.max(0, state.whiteTimeLeft - 1) : state.whiteTimeLeft,
				blackTimeLeft: !isWhite ? Math.max(0, state.blackTimeLeft - 1) : state.blackTimeLeft,
			};

		case "SET_DRAW_PROPOSAL":
			return { ...state, drawProposal: action.payload };

		case "SET_REMATCH_PROPOSAL":
			return { ...state, rematchProposal: action.payload };

		case "SET_MESSAGES":
			return { ...state, messages: action.payload };

		case "UNEXPECTED_DISCONNECT":
			return { ...state, gameId: null, gameOver: null };

		case "RESET_CONTEXT":
			return { ...initialState };

		default:
			return state;
	}
}
