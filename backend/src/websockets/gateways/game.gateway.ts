import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameInstance, GameService } from '../services/game.service';
import { v4 as uuidv4 } from 'uuid';
import { StockfishService } from 'src/stockfish/stockfish.service';
import { AchievementsService } from 'src/achievements/achievements.service';

@WebSocketGateway({ cors: true })
export class GameGateway {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly gameService: GameService,
    private readonly achievementsService: AchievementsService,
    private readonly stockfishAI: StockfishService,
  ) {}

  @SubscribeMessage('requestSurrender')
  handleSurrender(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
    const game = this.gameService.getGame(data.gameId);
    if (!game) return;

    const userId = client.data.user.userId;
    if (game.playerW !== userId && game.playerB !== userId) {
      client.emit('error', { message: "Don't belong to this game." });
      return;
    }

    const result = this.gameService.surrender(
      data.gameId,
      client.data.user.userId,
    );
    if (result) {
      this.server.to(data.gameId).emit('gameOver', { gameOver: result });
      this.checkAchievements(data.gameId, result.winnerId);

      if (game.mode === 'ai') {
        this.stockfishAI.stopEngine();
      }
    }
  }

  @SubscribeMessage('proposeDraw')
  handleDrawPropose(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
    const game = this.gameService.getGame(data.gameId);
    if (!game) return;

    const userId = client.data.user.userId;
    if (game.playerW !== userId && game.playerB !== userId) {
      client.emit('error', { message: "Don't belong to this game." });
      return;
    }

    client.to(data.gameId).emit('drawProposed', { from: client.id });
  }

  @SubscribeMessage('respondDraw')
  handleRespondDraw(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string; response: boolean },
  ) {
    const game = this.gameService.getGame(data.gameId);
    if (!game) return;

    const userId = client.data.user.userId;
    if (game.playerW !== userId && game.playerB !== userId) {
      client.emit('error', { message: "Don't belong to this game." });
      return;
    }

    if (data.response) {
      const result = this.gameService.forceDraw(data.gameId);
      if (result)
        this.server.to(data.gameId).emit('gameOver', { gameOver: result });
    } else {
      client.to(data.gameId).emit('drawRejected');
    }
  }

  @SubscribeMessage('proposeRematch')
  handleRematchPropose(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
    const game = this.gameService.getGame(data.gameId);
    if (!game) return;

    const userId = client.data.user.userId;
    if (game.playerW !== userId && game.playerB !== userId) {
      client.emit('error', { message: "Don't belong to this game." });
      return;
    }

    client
      .to(data.gameId)
      .emit('rematchProposed', { fromId: client.data.user.userId });
  }

  @SubscribeMessage('respondRematch')
  handleRespondRematch(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string; response: boolean },
  ) {
    const game = this.gameService.getGame(data.gameId);
    console.log(
      'Responding to rematch proposal:',
      data.response,
      'for gameId:',
      data.gameId,
    );
    if (!game) return;

    const userId = client.data.user.userId;
    if (game.playerW !== userId && game.playerB !== userId) {
      client.emit('error', { message: "Don't belong to this game." });
      return;
    }

    if (data.response) {
      const newGameId = uuidv4();

      let newGame: GameInstance | undefined;

      newGame = this.gameService.createGame(
        newGameId,
        game.mode,
        game.mode === 'online' ? game.playerB : game.playerW,
        game.mode === 'online' ? game.playerW : game.playerB,
        game.timeStamp,
      );
      if (newGame) {
        this.server
          .to(data.gameId)
          .emit('rematchStarted', { newGameId: newGameId });
        this.gameService.deleteGame(data.gameId);
      } else {
        client.emit('error', { message: 'Could not generate rematch room' });
      }
    } else {
      client.to(data.gameId).emit('rematchRejected');
      this.gameService.deleteGame(data.gameId);
    }
  }

  @SubscribeMessage('move')
  async handleMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string; move: any },
  ) {
    const game = this.gameService.getGame(data.gameId);
    if (!game) return;

    const userId = client.data.user.userId;
    const currentTurn = game.chess.turn();
    const expectedPlayerId = currentTurn === 'w' ? game.playerW : game.playerB;

    if (userId !== expectedPlayerId) {
      client.emit('error', {
        message: "Don't belong to this game or its not your turn",
      });
      return;
    }

    const validMove = this.gameService.makeMove(data.gameId, data.move);
    if (!validMove) {
      client.emit('error', { message: 'Invalid Movement' });
      return;
    }

    this.processGameState(data.gameId, validMove);

    if (game.mode === 'ai' && !game.chess.isGameOver()) {
      const aiMove = await this.stockfishAI.getBestMove(
        game.chess.fen(),
        game.level,
      );

      const humanizedDelay =
        Math.floor(Math.random() * (3200 - 1000 + 1)) + 1000;

      setTimeout(() => {
        const activeGame = this.gameService.getGame(data.gameId);
        if (
          !activeGame ||
          activeGame.chess.isGameOver() ||
          activeGame.chess.turn() !== 'b'
        ) {
          return;
        }

        const validAiMove = this.gameService.makeMove(data.gameId, aiMove);
        if (validAiMove) {
          this.processGameState(data.gameId, validAiMove);
        }
      }, humanizedDelay);
    } else if (game.mode === 'bot' && !game.chess.isGameOver()) {
      const humanizedDelay =
        Math.floor(Math.random() * (3500 - 1200 + 1)) + 1200;

      setTimeout(() => {
        const activeGame = this.gameService.getGame(data.gameId);
        if (
          !activeGame ||
          activeGame.chess.isGameOver() ||
          activeGame.chess.turn() !== 'b'
        )
          return;

        const botMove = this.gameService.generateBotMove(data.gameId);
        if (botMove) {
          this.processGameState(data.gameId, botMove);
        }
      }, humanizedDelay);
    }
  }

  @SubscribeMessage('timeOut')
  async handleTimeOut(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { gameId } = data;

    // Get the game information
    const game = this.gameService.getGame(data.gameId);
    if (!game) return;

    // Check who got timed out
    const loser = client.id === game.playerW ? 'w' : 'b';
    const winner = loser === 'w' ? 'b' : 'w';
    const result = this.gameService.handleTimeOut(
      data.gameId,
      String(client.data.user.userId),
    );
    // await this.matchesService.saveMatchResult(game.whiteUserId, game.blackUserId, resultReason);

    // Set that the game is over
    if (result) {
      this.server.to(data.gameId).emit('gameOver', { gameOver: result });
      this.checkAchievements(data.gameId, result.winnerId);
    }
  }

  private processGameState(gameId: string, move: any): boolean {
    const game = this.gameService.getGame(gameId);

    this.server.to(gameId).emit('move', {
      move: move,
      fen: game?.chess.fen(),
      currentTurn: game?.chess.turn(),
      whiteTimeLeft: move.whiteTimeLeft,
      blackTimeLeft: move.blackTimeLeft,
    });

    const gameOver = this.gameService.checkGameOver(gameId);
    if (gameOver) {
      this.server.to(gameId).emit('gameOver', {
        gameOver: gameOver,
      });
      return true;
    }
    return false;
  }

  // Check if we already have that achievement
  private async checkAchievements(gameId: string, winnerId?: number | null) {
    if (!winnerId) return;

    try {
      const newAchievement =
        await this.achievementsService.checkFirstWin(winnerId);

      if (newAchievement) {
        this.server.to(gameId).emit('achievementUnlocked', {
          winnerId: winnerId,
          achievement: newAchievement,
        });
      }
    } catch (error) {
      console.error('Error to register the achievement: ', error);
    }
  }

  // Request when we want to check our achievements
  @SubscribeMessage('requestAchievements')
  async handleRequestAchievements(@ConnectedSocket() client: Socket) {
    const userId = client.data.user.userId;
    const unlockedIds =
      await this.achievementsService.getUserUnlockedAchievements(userId);
    client.emit('loadAchievements', unlockedIds);
  }

  //Go watch a game. Get your popcorn...
  @SubscribeMessage('spectateGame')
  handleSpectateGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
    const game = this.gameService.getGame(data.gameId);
    if (!game) {
      client.emit('error', { message: 'Game not found' });
      return;
    }

    client.join(data.gameId);

    const state = this.gameService.getGameState(data.gameId);
    if (state) {
      client.emit('spectatorState', {
        gameId: data.gameId,
        ...state,
      });
    }
  }
}
