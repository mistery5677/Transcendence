import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MatchMakingService } from '../services/matchmaking.service';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { WsMiddleware } from '../middleware/ws.middleware';
import { v4 as uuidv4 } from 'uuid';
import { GameService } from '../services/game.service';
import { UsersService } from 'src/users/users.service';

@WebSocketGateway({ cors: true })
export class MatchGateway {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly matchMakingService: MatchMakingService,
    private readonly gameService: GameService,
    private readonly userService: UsersService,
  ) {}

  @SubscribeMessage('joinQueue')
  handleJoinQueue(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload?: { time?: string },
  ) {
    this.matchMakingService.addToQueue(client, this.server, payload);
  }

  @SubscribeMessage('startBotGame')
  handleStartBot(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { time: string },
  ) {
    const gameId = `bot_${uuidv4()}`;

    const newGame = this.gameService.createGame(
      gameId,
      'bot',
      client.data.user.userId,
      '',
      payload.time,
    );

    client.join(gameId);

    client.emit('gameState', {
      gameId: gameId,
      color: 'w',
      opponentId: 'bot',
      fen: newGame.chess.fen(),
      currentTurn: newGame.chess.turn(),
      mode: 'bot',
      whiteTimeLeft: newGame.whiteTimeLeft,
      blackTimeLeft: newGame.blackTimeLeft,
    });
  }

  @SubscribeMessage('startAIGame')
  handleStartAI(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { time: string; level?: number },
  ) {
    const gameId = `ai_${uuidv4()}`;


    const newGame = this.gameService.createGame(
      gameId,
      'ai',
      client.data.user.userId,
      'stockfish',
      payload.time ?? '5 min',
      payload.level ?? 5,
    );

    client.join(gameId);

    client.emit('gameState', {
      gameId: gameId,
      color: 'w',
      opponentId: 'Uncle Carlsen (AI)',
      fen: newGame.chess.fen(),
      currentTurn: newGame.chess.turn(),
      mode: 'ai',
      level: payload.level ?? 5,
      whiteTimeLeft: newGame.whiteTimeLeft,
      blackTimeLeft: newGame.blackTimeLeft,
    });
  }

  @SubscribeMessage('checkActiveGame')
  handleCheckActiveGame(@ConnectedSocket() client: Socket) {
    const userId = client.data.user.userId;

    if (!userId) {
      client.emit('error', { message: 'User unauthorized or not found' });
      return;
    }

    const activeMatch = this.gameService.findActiveGameByUserId(userId);
    if (activeMatch) {
      const { gameId, game } = activeMatch;
      console.log(`[Reconnection] User ${userId} have a active game ${gameId}`);

      client.join(gameId);

      const state = this.gameService.getGameState(gameId);
      if (state) {
        const userColor = userId === game.playerW ? 'w' : 'b';
        const opponentId =
          userId === game.playerW ? game.playerB : game.playerW;

        client.emit('gameState', {
          gameId: gameId,
          fen: state.fen,
          currentTurn: state.turn,
          color: userColor,
          mode: game.mode,
          opponentId: opponentId ? String(opponentId) : 'bot',
          whiteTimeLeft: state.whiteTimeLeft,
          blackTimeLeft: state.blackTimeLeft,
          chatHistory: state.chatHistory,
        });
      } else {
        client.emit('activeGameNotFound');
      }
    } else {
      console.log(`[Game] No active game for user ${userId}.`);
      client.emit(`noActiveGame`);
    }
  }

  @SubscribeMessage('spectateGame')
  handleSpectateGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
    const state = this.gameService.getGameState(data.gameId);

    if (!state) {
      client.emit('activeGameNotFound');
      return;
    }

    client.join(data.gameId);

    client.emit('gameState', {
      gameId: data.gameId,
      fen: state.fen,
      currentTurn: state.turn,
      color: null,
      mode: state.mode,
      opponentId: null,
      whiteTimeLeft: state.whiteTimeLeft,
      blackTimeLeft: state.blackTimeLeft,
      chatHistory: state.chatHistory,
    });
  }

  @SubscribeMessage('listActiveGames')
  async handleListActiveGames(
    @ConnectedSocket() client: Socket,
  ) {
    const games = await this.gameService.getActiveGames();

    client.emit('activeGames', games);
  }


}
