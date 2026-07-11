import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from '../services/game.service';
import { v4 as uuidv4 } from 'uuid';
import { StockfishService } from 'src/stockfish/stockfish.service';
import { AchievementsService } from 'src/achievements/achievements.service';
import { GameInstance, MoveResult } from '../interfaces/gameLogic.interface';
import {
  GameIdDto,
  MoveDto,
  RespondDrawDto,
  RespondRematchDto,
  ServerToClientEvents,
} from '../dtos/gameEvents.dtos';

@WebSocketGateway({ cors: true })
export class GameGateway {
  @WebSocketServer()
  server!: Server<any, ServerToClientEvents>;

  constructor(
    private readonly gameService: GameService,
    private readonly achievementsService: AchievementsService,
    private readonly stockfishAI: StockfishService,
  ) {}

  private validatePlayerAndGetGame(
    client: Socket,
    gameId: string,
  ): GameInstance | null {
    const game = this.gameService.getGame(gameId);
    if (!game) {
      client.emit('error', { message: 'Game not found.' });
      return null;
    }

    const userId = client.data.user?.userId;
    if (game.playerW !== userId && game.playerB !== userId) {
      client.emit('error', { message: "You don't belong to this game." });
      return null;
    }

    return game;
  }

  private async executeAiMove(gameId: string): Promise<void> {
    const game = this.gameService.getGame(gameId);
    if (!game || game.chess.isGameOver()) return;

    const aiMove = await this.stockfishAI.getBestMove(
      game.chess.fen(),
      game.level,
    );
    const humanizedDelay = Math.floor(Math.random() * (3200 - 1000 + 1)) + 1000;

    setTimeout(() => {
      const activeGame = this.gameService.getGame(gameId);
      if (
        !activeGame ||
        activeGame.chess.isGameOver() ||
        activeGame.chess.turn() !== 'b'
      ) {
        return;
      }

      const validAiMove = this.gameService.makeMove(gameId, aiMove);
      if (validAiMove) {
        this.processGameState(gameId, validAiMove);
      }
    }, humanizedDelay);
  }

  private executeBotMove(gameId: string): void {
    const humanizedDelay = Math.floor(Math.random() * (3500 - 1200 + 1)) + 1200;

    setTimeout(() => {
      const activeGame = this.gameService.getGame(gameId);
      if (
        !activeGame ||
        activeGame.chess.isGameOver() ||
        activeGame.chess.turn() !== 'b'
      ) {
        return;
      }

      const botMove = this.gameService.generateBotMove(gameId);
      if (botMove) {
        this.processGameState(gameId, botMove);
      }
    }, humanizedDelay);
  }

  @SubscribeMessage('requestSurrender')
  handleSurrender(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: GameIdDto,
  ): void {
    const game = this.validatePlayerAndGetGame(client, data.gameId);
    if (!game) return;

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
    @MessageBody() data: GameIdDto,
  ) {
    const game = this.validatePlayerAndGetGame(client, data.gameId);
    if (!game) return;

    client.to(data.gameId).emit('drawProposed', { from: client.id });
  }

  @SubscribeMessage('respondDraw')
  handleRespondDraw(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: RespondDrawDto,
  ) {
    const game = this.validatePlayerAndGetGame(client, data.gameId);
    if (!game) return;

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
    @MessageBody() data: GameIdDto,
  ) {
    const game = this.validatePlayerAndGetGame(client, data.gameId);
    if (!game) return;

    client
      .to(data.gameId)
      .emit('rematchProposed', { fromId: client.data.user.userId });
  }

  @SubscribeMessage('respondRematch')
  handleRespondRematch(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: RespondRematchDto,
  ) {
    const game = this.validatePlayerAndGetGame(client, data.gameId);
    if (!game) return;

    if (!data.response) {
      client.to(data.gameId).emit('rematchRejected');
      this.gameService.deleteGame(data.gameId);
      return;
    }

    const newGameId = uuidv4();
    const isOnline = game.mode === 'online';

    const playerW = isOnline ? game.playerB : game.playerW;
    const playerB = isOnline ? game.playerW : game.playerB;

    const { gameId, game: newGame } = this.gameService.createGame({
      mode: game.mode,
      playerWId: playerW,
      playerBId: playerB,
      timeStamp: game.timeStamp ?? '5 min',
      level: game.level,
    });

    if (newGame) {
      this.server.to(data.gameId).emit('rematchStarted', { newGameId: gameId });
      this.gameService.deleteGame(data.gameId);
    } else {
      client.emit('error', { message: 'Could not generate rematch room' });
    }
  }

  @SubscribeMessage('move')
  async handleMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: MoveDto,
  ) {
    const game = this.validatePlayerAndGetGame(client, data.gameId);
    if (!game) return;

    const userId = client.data.user.userId;
    const currentTurn = game.chess.turn() as 'w' | 'b';
    const expectedPlayerId = currentTurn === 'w' ? game.playerW : game.playerB;

    if (userId !== expectedPlayerId) {
      client.emit('error', { message: "It's not your turn." });
      return;
    }

    const validMove = this.gameService.makeMove(data.gameId, data.move);
    if (!validMove) {
      client.emit('error', { message: 'Invalid Movement' });
      return;
    }

    const isGameOver = this.processGameState(data.gameId, validMove);
    if (isGameOver) return;

    if (game.mode === 'ai') {
      await this.executeAiMove(data.gameId);
    } else if (game.mode === 'bot') {
      this.executeBotMove(data.gameId);
    }
  }

  @SubscribeMessage('timeOut')
  async handleTimeOut(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: GameIdDto,
  ): Promise<void> {
    const game = this.validatePlayerAndGetGame(client, data.gameId);
    if (!game) return;

    const result = this.gameService.handleTimeOut(
      data.gameId,
      String(client.data.user.userId),
    );

    if (result) {
      this.server.to(data.gameId).emit('gameOver', { gameOver: result });
      this.checkAchievements(data.gameId, result.winnerId);
    }
  }

  private processGameState(gameId: string, moveData: MoveResult): boolean {
    const game = this.gameService.getGame(gameId);
    if (!game) return false;
    this.server.to(gameId).emit('move', {
      move: moveData.moveDetails,
      fen: game.chess.fen(),
      currentTurn: game.chess.turn() as 'w' | 'b',
      gameHistory: game.chess.history(),
      whiteTimeLeft: moveData.whiteTimeLeft,
      blackTimeLeft: moveData.blackTimeLeft,
    });
    console.log(game.chess.history());
    const gameOver = this.gameService.checkGameOver(gameId);
    if (gameOver) {
      this.server.to(gameId).emit('gameOver', { gameOver });
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
  async handleSpectateGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
    const game = this.gameService.getGame(data.gameId);
    if (!game) {
      client.emit('error', { message: 'Game not found' });
      return;
    }

    client.join(data.gameId);

    const payload = await this.gameService.buildSpectatorPayload(data.gameId);
    if (payload) {
      client.emit('spectatorState', {
        gameId: data.gameId,
        ...payload,
      });
    }
  }
}
