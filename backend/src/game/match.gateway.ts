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
import {
  NotificationPayload,
  NotificationService,
} from '../notification/notification.service';
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
    private readonly notificationService: NotificationService,
  ) {}

  @SubscribeMessage('inviteToPlay')
  async handleInviteToPlay(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { friendId: number },
  ) {
    if (!client.data.user) return;

    console.log('inviteToPlay from backend');
    const targetFriendId = Number(body.friendId);
    const sender = client.data.user;
    const senderId = sender.userId;
    const senderName = sender.username;
    const senderAvatarUrl = sender.avatarUrl;

    const notificationData: NotificationPayload = {
      title: 'Game Challenge ⚔️',
      message: `invited you to play`,
      type: 'matchInvite',
      payload: {
        senderId: senderId,
        senderUsername: senderName,
        senderAvatarUrl: senderAvatarUrl,
        action: 'PENDING',
      },
    };

    await this.notificationService.sendNotification(
      targetFriendId,
      notificationData,
    );
    return { success: true };
  }

  @SubscribeMessage('respondToGameInvite')
  async handleRespondToInvite(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    body: { hostId: number; accept: boolean; notificationId: string },
  ) {
    const receiver = client.data.user;
    if (!receiver) return { error: 'No authorized' };

    const receiverId = receiver.userId;
    const { hostId, accept, notificationId } = body;

    console.log(
      `[RespondToInvite] User ${receiverId} responded ${accept ? 'ACCEPT' : 'REJECT'} to host ${hostId}`,
    );

    if (notificationId) {
      await this.notificationService.markAsRead(receiverId, notificationId);
    }

    if (!accept) {
      this.server.to(`user_${hostId}`).emit('inviteRejected', {
        message: `${receiver.username} reject your game invitation.`,
      });
      return { success: true, status: 'REJECTED' };
    }

    try {
      const { gameId, game } = this.gameService.createGame({
        mode: 'online',
        playerWId: String(hostId),
        playerBId: String(receiverId),
        timeStamp: '5 min',
      });

      client.join(gameId);
      console.log('Game by invitacion created', gameId);
      this.server.in(`user_${hostId}`).socketsJoin(gameId);

      const payloadHost = this.gameService.buildGameStatePayload(
        gameId,
        game,
        String(hostId),
      );

      const payloadReceiver = this.gameService.buildGameStatePayload(
        gameId,
        game,
        String(receiverId),
      );

      this.server.to(`user_${hostId}`).emit('gameState', payloadHost);
      this.server.to(`user_${receiverId}`).emit('gameState', payloadReceiver);

      return { success: true, status: 'STARTED', gameId };
    } catch (error) {
      console.error('Error al iniciar partida por invitación:', error);
      return { error: 'No se pudo iniciar la partida.' };
    }
  }

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
