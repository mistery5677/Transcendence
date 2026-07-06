import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MatchMakingService } from '../services/matchmaking.service';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { GameService } from '../services/game.service';
import { UsersService } from 'src/users/users.service';

interface QueuePayload {
  time?: string;
}

interface BotGamePayload {
  time: string;
  level?: number;
}

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
    @MessageBody() payload?: QueuePayload,
  ) {
    this.matchMakingService.addToQueue(client, this.server, payload);
  }

  @SubscribeMessage('startBotGame')
  handleStartBot(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: BotGamePayload,
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
    @MessageBody() payload: BotGamePayload,
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
    if (!activeMatch) {
      console.log(`[Game] No active game for user ${userId}.`);
      client.emit(`noActiveGame`);
      return;
    }

    const { gameId, game } = activeMatch;
    console.log(`[Reconnection] User ${userId} have a active game ${gameId}`);
    client.join(gameId);

    const state = this.gameService.getGameState(gameId);
    if (state) {
      const userColor = userId === game.playerW ? 'w' : 'b';
      const opponentId = userId === game.playerW ? game.playerB : game.playerW;

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
  }
}
