import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from '../game/game.service';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer() server?: Server;

  constructor(
    private readonly gameService: GameService,
    private readonly chatService: ChatService,
  ) {}

  // (ROOM CHAT)
  @SubscribeMessage('sendRoomMessage')
  handleRoomMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string; message: string },
  ) {
    if (!client.data.user) return;

    const rawUserId = client.data?.user?.userId;
    const userId = Number(rawUserId);

    if (!Number.isInteger(userId)) {
      client.emit(`error`, { message: 'Unauthorized user id' });
      return;
    }

    const game = this.gameService.getGame(data.gameId);
    if (!game) return;

    const { username, avatarUrl } = client.data.user;

    const newMessage = {
      from: username,
      avatarUrl: avatarUrl,
      message: data.message,
      timeStamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    game.chatHistory.push(newMessage);

    this.server?.to(data.gameId).emit('receiveRoomMessage', newMessage);
  }

  //(PRIVATE MESSAGES)

  @SubscribeMessage('sendPrivateMessage')
  async handlePrivateMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { toUserId: string; message: string },
  ) {
    if (!client.data?.user) return;

    const fromUserId = Number(client.data.user.userId);
    const toUserId = Number(data.toUserId);
    const cleanMessage = data.message?.trim();

    if (!Number.isInteger(toUserId) || !cleanMessage) {
      client.emit('error', { message: 'Invalid recipient or message' });
      return;
    }

    if (fromUserId === toUserId) return;
    try {
      const savedMsg = await this.chatService.saveMessage(
        fromUserId,
        toUserId,
        cleanMessage,
      );

      const messagePayload = {
        fromId: String(fromUserId),
        toId: String(data.toUserId),
        fromUsername: savedMsg.fromUser.username,
        fromAvatarUrl: savedMsg.fromUser.avatarUrl,
        message: data.message.trim(),
        timestamp: new Date().toISOString(),
      };

      this.server
        ?.to(`user_${data.toUserId}`)
        .emit('receivePrivateMessage', messagePayload);

      this.server
        ?.to(`user_${fromUserId}`)
        .emit('receivePrivateMessage', messagePayload);
    } catch (error) {
      console.error('Error on dataPersistence of the message:', error);
      client.emit('error', { message: "Couldn't send the message" });
    }
  }
}
