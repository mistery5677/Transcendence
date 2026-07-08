import { Chess } from 'chess.js';

export type TimeControl = '3 min' | '5 min' | '10 min';

export type GameModes = 'online' | 'bot' | 'ai';

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

export interface CreateGameDto {
  mode: GameModes;
  playerWId: string;
  playerBId?: string;
  timeStamp: TimeControl;
  level?: number;
}

export interface GameInstance {
  chess: Chess;
  mode: GameModes;
  level: number | undefined;
  playerW: string;
  playerB: string;
  isFinished?: boolean;
  disconnectTimeout?: NodeJS.Timeout;

  // Timer variables
  timeStamp: TimeControl; // Time when the game started
  whiteTimeLeft: number;
  blackTimeLeft: number;
  lastMoveTimestamp: number; // Time of the last move
  chatHistory: ChatRoomMessage[];
}

export type GameState = {
  fen: string;
  turn: 'w' | 'b';
  gameHistory: string[];
  mode: GameModes;
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
  moveDetails: ChessMoveDetails;
  fen: string;
  currentTurn: 'w' | 'b';
  whiteTimeLeft: number;
  blackTimeLeft: number;
}
