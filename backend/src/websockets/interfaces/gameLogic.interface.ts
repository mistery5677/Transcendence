import { Chess } from "chess.js";

export interface GameOverResult {
  winnerColor: 'w' | 'b' | null;
  winnerId: number | null;
  reason:
    | 'CHECKMATE'
    | 'DRAW'
    | 'STALEMATE'
    | 'THREEFOLD_REPETITION'
    | 'RESIGNATION'
    | 'DISCONNECTION_TIMEOUT'
    | 'TIMEOUT';
}

export interface ChatRoomMessage {
  from: string;
  avatarUrl?: string;
  message: string;
  timeStamp: string;
}

export interface GameInstance {
  chess: Chess;
  mode: 'online' | 'bot' | 'ai';
  level: number | undefined;
  playerW: string;
  playerB: string;
  isFinished?: boolean;
  disconnectTimeout?: NodeJS.Timeout;

  // Timer variables
  timeStamp: '3 min' | '5 min' | '10 min'; // Time when the game started
  whiteTimeLeft: number;
  blackTimeLeft: number;
  lastMoveTimestamp: number; // Time of the last move
  chatHistory: ChatRoomMessage[];
}

export type GameState = {
  fen: string;
  turn: 'w' | 'b';
  gameHistory: string[];
  mode: 'online' | 'bot' | 'ai';
  chatHistory: ChatRoomMessage[];
  whiteTimeLeft: number;
  blackTimeLeft: number;
};

export interface ChessMoveDetails {
  from: string;
  to: string;
  piece: string;
  san: string;
  lan: string;
  flags: string;
  promotion?: string;
}

export interface MoveResult {
  result: ChessMoveDetails;
  fen: string;
  currentTurn: 'w' | 'b';
  whiteTimeLeft: number;
  blackTimeLeft: number;
}
