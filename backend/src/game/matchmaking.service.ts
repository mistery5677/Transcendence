import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { TimeControl } from './interfaces/gameLogic.interface';
import { GameService } from './game.service';
import {
  AuthenticatedSocket,
  SocketUser,
} from 'src/common/types/authenticated-socket.interface';

interface QueueAuthenticatedSocket extends AuthenticatedSocket {
  data: {
    user: SocketUser;
  };
}

type QueuePayload = {
  time?: TimeControl;
};

type QueueEntry = {
  client: QueueAuthenticatedSocket;
  time: TimeControl;
};

@Injectable()
export class MatchMakingService {
  private queue: QueueEntry[] = [];
  private readonly logger = new Logger(MatchMakingService.name);

  constructor(private readonly gameService: GameService) {}

  addToQueue(
    client: QueueAuthenticatedSocket,
    server: Server,
    payload?: QueuePayload,
  ) {
    const userId = client.data.user.userId;
    const selectedTime: TimeControl = payload?.time ?? '5 min';

    this.queue = this.queue.filter(
      (entry) => entry.client.data.user.userId !== userId,
    );

    this.queue.push({ client, time: selectedTime });

    this.logger.log(
      `Player ${client.data.user.username} joined queue (${selectedTime}). Current queue size: ${this.queue.length}`,
    );

    this.tryCreateMatch();
  }

  private tryCreateMatch() {
    if (this.queue.length < 2) return;

    const first = this.queue[0];
    const secondIndex = this.queue.findIndex(
      (entry, index) => index > 0 && entry.time === first.time,
    );

    if (secondIndex === -1) return;

    const player1 = this.queue.shift();
    if (!player1) return;

    const player2 = this.queue.splice(secondIndex - 1, 1)[0];
    if (!player2) return;

    this.createMatch(player1, player2);
  }

  private createMatch(player1: QueueEntry, player2: QueueEntry) {
    const selectedTime = player1.time;

    const { gameId, game } = this.gameService.createGame({
      mode: 'online',
      playerWId: player1.client.data.user.userId,
      playerBId: player2.client.data.user.userId,
      timeStamp: selectedTime,
    });

    void player1.client.join(gameId);
    void player2.client.join(gameId);

    const payloadP1 = this.gameService.buildGameStatePayload(
      gameId,
      game,
      player1.client.data.user.userId,
    );
    const payloadP2 = this.gameService.buildGameStatePayload(
      gameId,
      game,
      player2.client.data.user.userId,
    );

    player1.client.emit('gameState', payloadP1);
    player2.client.emit('gameState', payloadP2);

    this.logger.log(
      `Match created: ${gameId} | Players: ${player1.client.data.user.username} vs ${player2.client.data.user.username}`,
    );
  }

  removeFromQueue(client: AuthenticatedSocket) {
    const userId = client.data?.user?.userId;
    const username = client.data?.user?.username;
    if (!userId) return;

    const initialSize = this.queue.length;
    this.queue = this.queue.filter(
      (queuedSocket) => queuedSocket.client.data?.user?.userId !== userId,
    );

    if (initialSize !== this.queue.length) {
      this.logger.log(`User ${username} removed from matchmaking Queue.`);
    }
  }
}
