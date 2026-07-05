import type { Socket } from "socket.io-client";

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

export type GameContextType = {
	socket: Socket | null;
	gameId: string | null;
	color: "w" | "b" | null;
	isConnected: boolean;
	fen: string;
	currentTurn: "w" | "b";
	opponentId: string | null;
	isSearchingMatch: boolean;
	gameOver: GameOverState;
	drawProposal: boolean;
	rematchProposal: boolean;

	// Timer variables
	whiteTimeLeft: number;
	blackTimeLeft: number;
	handleTimeOut: () => void;
	inviteToPlay: (friendId: number) => void;

	//Messages
	messages: MessageType[];
	setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;

	surrender: () => void;
	proposeDraw: () => void;
	proposeRematch: () => void;
	resetGameContextToDefault: () => void;
	startOnlineGame: (options: MatchStartOptions) => void;
	startBotGame: (options: MatchStartOptions) => void;
	startAIGame: (options: MatchStartOptions) => void;
	handleDrawResponse: (accept: boolean) => void;
	handleRematchResponse: (accept: boolean) => void;
};
