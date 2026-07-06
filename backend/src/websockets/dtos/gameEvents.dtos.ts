import { ChessMoveDetails } from '../interfaces/gameLogic.interface';

export interface ServerToClientEvents {
  move: (payload: MoveEventPayload) => void;
  gameOver: (payload: { gameOver: any }) => void;
  error: (payload: { message: string }) => void;
  drawProposed: (payload: { from: string }) => void;
  drawRejected: () => void;
  rematchProposed: (payload: { fromId: number }) => void;
  rematchRejected: () => void;
  rematchStarted: (payload: { newGameId: string }) => void;
  loadAchievements: (unlockedIds: number[]) => void;
  achievementUnlocked: (payload: {
    winnerId: number;
    achievement: any;
  }) => void;
}

export class GameIdDto {
  gameId!: string;
}

export class RespondDrawDto extends GameIdDto {
  response!: boolean;
}

export class RespondRematchDto extends GameIdDto {
  response!: boolean;
}

export class MoveInput {
  from!: string;
  to!: string;
  promotion?: string;
}

export class MoveDto extends GameIdDto {
  move!: MoveInput;
}

export interface MoveEventPayload {
  move: ChessMoveDetails;
  fen: string;
  currentTurn: 'w' | 'b';
  gameHistory: string[];
  whiteTimeLeft: number;
  blackTimeLeft: number;
}
