import type { Socket } from "socket.io-client";

type GameModes = "online" | "bot" | "ai";

export type GameOverState = {
	winnerColor: "w" | "b" | null;
	reason: string;
	resultString: string;
} | null;

export type MatchStartOptions = {
	time: string;
	level?: number;
};

export type MessageType = {
	from: string;
	message: string;
	timeStamp: string;
	avatarUrl?: string;
};

export type GameState = {
	gameId: string | null;
	color: "w" | "b" | null;
	fen: string;
	currentTurn: "w" | "b";
	mode: GameModes;
	gameOver: GameOverState;
	messages: MessageType[];
	gameHistory: string[];
	drawProposal: boolean;
	rematchProposal: boolean;
	opponentId: string | null;
	lastFinishedGameId: string | null;
	whiteTimeLeft: number;
	blackTimeLeft: number;
	spectatorPlayerWId: string | null;
	spectatorPlayerBId: string | null;
	spectatorPlayerWName: string | null;
	spectatorPlayerBName: string | null;
	spectatorPlayerWAvatar: string | null;
	spectatorPlayerBAvatar: string | null;
};

export type GameContextType = {
	socket: Socket | null;
	gameId: string | null;
	color: "w" | "b" | null;
	isConnected: boolean;
	mode: GameModes;
	fen: string;
	gameHistory: string[];
	currentTurn: "w" | "b";
	opponentId: string | null;
	isSpectator: boolean;
	spectateGame: (gameId: string) => void;
	gameOver: GameOverState;
	drawProposal: boolean;
	rematchProposal: boolean;

	spectatorPlayerWId: string | null;
	spectatorPlayerBId: string | null;
	spectatorPlayerWName: string | null;
	spectatorPlayerBName: string | null;
	spectatorPlayerWAvatar: string | null;
	spectatorPlayerBAvatar: string | null;

	// Timer variables
	whiteTimeLeft: number;
	blackTimeLeft: number;
	handleTimeOut: () => void;

	//Messages
	messages: MessageType[];
	setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
	addMessage: (msg: MessageType) => void;
	surrender: () => void;
	proposeDraw: () => void;
	proposeRematch: () => void;
	resetGameContextToDefault: () => void;
	handleDrawResponse: (accept: boolean) => void;
	handleRematchResponse: (accept: boolean) => void;
};
