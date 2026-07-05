import { Injectable } from '@nestjs/common';
import { Chess } from 'chess.js';
import { MatchesService } from 'src/matches/matches.service';
import { v4 as uuidv4 } from 'uuid';
import { PresenceService } from './presence.service';

interface GameOverResult {
  winnerColor: 'w' | 'b' | null;
  winnerId?: number | null;
  reason:
    | 'CHECKMATE'
    | 'DRAW'
    | 'STALEMATE'
    | 'THREEFOLD_REPETITION'
    | 'RESIGNATION'
    | 'DISCONNECTION_TIMEOUT'
    | 'TIMEOUT';
}

interface ChatMessage {
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
  chatHistory: ChatMessage[];
}

@Injectable()
export class GameService {
  private games = new Map<string, GameInstance>();
  private readonly ABANDON_TIME = 60000;
  constructor(
    private readonly matchesService: MatchesService,
    private readonly presenceService: PresenceService,
  ) {}

  private getTimeControlInSeconds(timeControl: string): number {
    const timeMap: Record<string, number> = {
      '3 min': 180,
      '5 min': 300,
      '10 min': 600,
    };

    return timeMap[timeControl] ?? 300;
  }

  createGame(
    gameId: string,
    mode: 'online' | 'bot' | 'ai',
    playerWId: string,
    playerBId: string = 'bot',
    timeControl: string = '5 min',
    level?: number,
  ) {
    const newGame: GameInstance = {
      chess: new Chess(),
      mode: mode,
      level: level,
      playerW: playerWId,
      playerB: playerBId,

      // Start the timer
      timeStamp: timeControl as '3 min' | '5 min' | '10 min',
      whiteTimeLeft: this.getTimeControlInSeconds(timeControl),
      blackTimeLeft: this.getTimeControlInSeconds(timeControl),
      lastMoveTimestamp: Date.now(),
      chatHistory: [],
    };
    this.presenceService.updateStatus(playerBId, 'playing');
    this.presenceService.updateStatus(playerWId, 'playing');
    this.games.set(gameId, newGame);
    return newGame;
  }

  getGame(gameId: string): GameInstance | undefined {
    return this.games.get(gameId);
  }

  makeMove(gameId: string, move: any) {
    const game = this.games.get(gameId);
    if (!game) return null;

    try {
      // Before moving we have to calculate the wasted time to make the move
      const currentTurn = game.chess.turn();
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - game.lastMoveTimestamp) / 1000);

      // Discount the time
      if (currentTurn === 'w') {
        game.whiteTimeLeft = Math.max(0, game.whiteTimeLeft - elapsedSeconds);
      } else {
        game.blackTimeLeft = Math.max(0, game.blackTimeLeft - elapsedSeconds);
      }

      // Make the move
      const result = game.chess.move(move);

      // If the play is valid, restart the clock
      if (result) {
        game.lastMoveTimestamp = now;
      }

      return {
        result,
        fen: game.chess.fen(),
        currentTurn: game.chess.turn(),
        whiteTimeLeft: game.whiteTimeLeft,
        blackTimeLeft: game.blackTimeLeft,
      };
    } catch (e) {
      return null;
    }
  }

  generateBotMove(gameId: string) {
    const game = this.games.get(gameId);
    if (!game || game.chess.isGameOver()) return null;

    const now = Date.now();
    const elapsedSeconds = Math.floor((now - game.lastMoveTimestamp) / 1000);

    const possibleMoves = game.chess.moves();
    const randomMove =
      possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

    game.blackTimeLeft = Math.max(0, game.blackTimeLeft - elapsedSeconds);
    game.chess.move(randomMove);

    game.lastMoveTimestamp = Date.now();

    return {
      randomMove,
      fen: game.chess.fen(),
      currentTurn: game.chess.turn(),
      whiteTimeLeft: game.whiteTimeLeft,
      blackTimeLeft: game.blackTimeLeft,
    };
  }

  getGameState(gameId: string) {
    const game = this.games.get(gameId);
    if (!game) return null;

    // Calculate the real time after a page refresh
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - game.lastMoveTimestamp) / 1000);

    let currentWTime = game.whiteTimeLeft;
    let currentBTime = game.blackTimeLeft;

    if (game.chess.turn() === 'w') {
      currentWTime = Math.max(0, currentWTime - elapsedSeconds);
    } else {
      currentBTime = Math.max(0, currentBTime - elapsedSeconds);
    }

    return {
      fen: game.chess.fen(),
      turn: game.chess.turn(),
      history: game.chess.history(),
      mode: game.mode,
      chatHistory: game.chatHistory,
      // Send the timer info
      whiteTimeLeft: currentWTime,
      blackTimeLeft: currentBTime,
    };
  }

  checkGameOver(gameId: string): GameOverResult | null {
    const game = this.getGame(gameId);
    if (!game || !game.chess.isGameOver()) return null;

    const chess = game.chess;
    let winnerColor: 'w' | 'b' | null = null;

    let reason: GameOverResult['reason'] = 'DRAW';

    if (chess.isCheckmate()) {
      reason = 'CHECKMATE';
      winnerColor = chess.turn() === 'w' ? 'b' : 'w';
    } else if (chess.isStalemate()) {
      reason = 'STALEMATE';
    } else if (chess.isThreefoldRepetition()) {
      reason = 'THREEFOLD_REPETITION';
    } else if (chess.isDraw()) {
      reason = 'DRAW';
    }

    let winnerId: number | null = null;
    if (winnerColor === 'w') winnerId = parseInt(game.playerW);
    if (winnerColor === 'b') winnerId = parseInt(game.playerB);

    if (game.mode === 'online') {
      this.matchesService.saveMatchResult(
        parseInt(game.playerW),
        parseInt(game.playerB),
        winnerId,
      );
    }
    this.markAsFinished(gameId);
    return {
      winnerColor,
      winnerId,
      reason,
    };
  }

  surrender(gameId: string, surrenderPlayerId: string): GameOverResult | null {
    const game = this.getGame(gameId);
    if (!game) return null;

    const winnerColor: 'w' | 'b' =
      surrenderPlayerId !== game.playerB ? 'b' : 'w';
    const winnerId = winnerColor === 'w' ? game.playerW : game.playerB;

    if (game.mode === 'online') {
      this.matchesService.saveMatchResult(
        parseInt(game.playerW),
        parseInt(game.playerB),
        parseInt(winnerId),
      );
    }
    this.markAsFinished(gameId);
    return { winnerColor, reason: 'RESIGNATION' };
  }

  forceDraw(gameId: string): GameOverResult | null {
    const game = this.getGame(gameId);
    if (!game) return null;

    if (game.mode === 'online') {
      this.matchesService.saveMatchResult(
        parseInt(game.playerW),
        parseInt(game.playerB),
        null,
      );
    }
    this.markAsFinished(gameId);
    return { winnerColor: null, reason: 'DRAW' };
  }

  handleTimeOut(gameId: string, loserPlayerId: string): GameOverResult | null {
    const game = this.getGame(gameId);
    if (!game || game.isFinished) return null;

    const isWhiteLoser = String(loserPlayerId) === String(game.playerW);

    // The winner is not the one that got timed out
    const winnerColor: 'w' | 'b' = isWhiteLoser ? 'b' : 'w';
    const winnerId = winnerColor === 'w' ? game.playerW : game.playerB;

    // Save the match history
    if (game.mode === 'online') {
      this.matchesService.saveMatchResult(
        parseInt(game.playerB),
        parseInt(game.playerW),
        parseInt(winnerId),
      );
    }
    this.markAsFinished(gameId);
    return { winnerColor, reason: 'TIMEOUT' };
  }

  deleteGame(gameId: string) {
    const game = this.getGame(gameId);
    if (!game) {
      return null;
    }
    this.games.delete(gameId);
  }
  markAsFinished(gameId: string) {
    const game = this.games.get(gameId);
    if (game) {
      game.isFinished = true;
      this.presenceService.updateStatus(game.playerB, 'online');
      this.presenceService.updateStatus(game.playerW, 'online');
    }
  }

  findActiveGameByUserId(userId: string): {
    gameId: string;
    game: GameInstance;
  } | null {
    for (const [gameId, game] of this.games.entries()) {
      if (
        !game.isFinished &&
        (game.playerW === userId || game.playerB === userId)
      ) {
        return { gameId, game };
      }
    }
    return null;
  }

  startAbandonTimeout(gameId: string, loserUserId: string, server: any) {
    const game = this.getGame(gameId);
    if (!game || game.isFinished || game.mode === 'bot') return;

    if (game.disconnectTimeout) clearTimeout(game.disconnectTimeout);

    console.log(
      `[Game] Starting the final countDown for ${loserUserId} in Game ${gameId}`,
    );

    game.disconnectTimeout = setTimeout(() => {
      if (game.isFinished) return;

      const isWhiteLoser = game.playerW === loserUserId;
      const winnerColor: 'w' | 'b' = isWhiteLoser ? 'b' : 'w';
      const winnerId = isWhiteLoser ? game.playerB : game.playerW;

      this.matchesService.saveMatchResult(
        parseInt(game.playerW),
        parseInt(game.playerB),
        parseInt(winnerId),
      );

      this.markAsFinished(gameId);

      server.to(gameId).emit('gameOver', {
        gameOver: {
          winnerColor,
          reason: 'DISCONNECTION_TIMEOUT',
        },
      });

      console.log(
        `[Game] ${gameId} has finished by disconnection TimeOut of user ${loserUserId}`,
      );

      this.deleteGame(gameId);
    }, this.ABANDON_TIME);
  }

  clearAbandonTimeout(gameId: string) {
    const game = this.games.get(gameId);
    if (game && game.disconnectTimeout) {
      clearTimeout(game.disconnectTimeout);
      game.disconnectTimeout = undefined;
      console.log(
        `[Game] Countdown has stopped ${gameId}. The player come back.`,
      );
    }
  }
}
