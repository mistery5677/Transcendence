import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MatchMakingService } from './matchmaking.service';
import { GameService } from './game.service';
import { NotificationService } from '../notification/notification.service';
import { TimeControl } from './interfaces/gameLogic.interface';

interface QueuePayload {
  time: TimeControl;
}

interface BotGamePayload {
  time: TimeControl;
  level?: number;
}

@WebSocketGateway({ cors: true })
export class MatchGateway {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly matchMakingService: MatchMakingService,
    private readonly gameService: GameService,
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
    const userId = client.data.user.userId;
    const { gameId, game } = this.gameService.createGame({
      mode: 'bot',
      playerWId: userId,
      timeStamp: payload.time,
    });

    client.join(gameId);

    const gameState = this.gameService.buildGameStatePayload(
      gameId,
      game,
      userId,
    );
    client.emit('gameState', gameState);
  }

  @SubscribeMessage('startAIGame')
  handleStartAI(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: BotGamePayload,
  ) {
    const userId = client.data.user.userId;
    const level = payload.level ?? 5;

    const { gameId, game } = this.gameService.createGame({
      mode: 'ai',
      playerWId: userId,
      timeStamp: payload.time,
      level: level,
    });

    client.join(gameId);

    const gameState = this.gameService.buildGameStatePayload(
      gameId,
      game,
      userId,
    );

    client.emit('gameState', gameState);
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
    console.log(`[Reconnection] User ${userId} has an active game ${gameId}`);
    client.join(gameId);

    const gameState = this.gameService.buildGameStatePayload(
      gameId,
      game,
      userId,
    );

    client.emit('gameState', gameState);
  }
}
