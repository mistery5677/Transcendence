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
import { ParseIntPipe } from '@nestjs/common';
import {
  NotificationPayload,
  NotificationService,
} from '../services/notification.service';
import { subscribe } from 'diagnostics_channel';
import { SocketType } from 'dgram';

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
        hostId: senderId,
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
      await this.notificationService.markAsRead(receiverId, notificationId); //! or deleted after clicked
    }

    if (!accept) {
      this.server.to(`user_${hostId}`).emit('inviteRejected', {
        message: `${receiver.username} reject you game Invitacion .`,
      });
      return { success: true, status: 'REJECTED' };
    }
    try {
      // AQUÍ DEBES CONECTARLO CON TU LOGICA DE INICIAR JUEGOS. Por ejemplo:
      // Supongamos que tienes un gameService o matchService que crea una partida 'online' entre dos IDs:
      const newGame = await this.gameService.createGame({
        whiteId: hostId, // Puedes decidir al azar quién es blanco o negro
        blackId: receiverId,
        mode: "online",
      });

      // 5. Emitir el evento de inicio de juego a AMBOS jugadores
      // Al reutilizar la lógica que ya tienes configurada en tu MatchGateway (START_GAME):
      const gameStartPayload = {
        gameId: newGame.id,
        fen: newGame.chess.fen(),
        currentTurn: newGame.chess.turn(),
        gameHistory: newGame.chess.history(),
        mode: 'online',
        whiteTimeLeft: newGame.whiteTimeLeft,
        blackTimeLeft: newGame.blackTimeLeft,
      };

      // Avisarle al Host que empiece
      this.server.to(`user_${hostId}`).emit('gameState', {
        ...gameStartPayload,
        color: 'w', // El host juega con blancas
        opponentId: receiverId,
      });

      // Avisarle al Invitado (quien aceptó) que empiece
      this.server.to(`user_${receiverId}`).emit('gameState', {
        ...gameStartPayload,
        color: 'b', // El invitado juega con negras
        opponentId: hostId,
      });

      return { success: true, status: 'STARTED', gameId: newGame.id };
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
      gameHistory: newGame.chess.history(),
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
      gameHistory: newGame.chess.history(),
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
        gameHistory: state.gameHistory,
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
