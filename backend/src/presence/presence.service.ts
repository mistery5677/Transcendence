import { Injectable } from '@nestjs/common';

export type UserStatus = 'online' | 'playing' | 'offline';

@Injectable()
export class PresenceService {
  private userStatus = new Map<number, UserStatus>();
  private activeSockets = new Map<string, Set<string>>();

  setConnected(userId: string, socketId: string) {
    if (!this.activeSockets.has(userId)) {
      this.activeSockets.set(userId, new Set());
    }

    this.activeSockets.get(userId)?.add(socketId);
    this.userStatus.set(parseInt(userId), 'online');
  }

  setDisconnected(userId: string, socketId: string): boolean {
    const userSockets = this.activeSockets.get(userId);

    if (userSockets) {
      userSockets.delete(socketId);

      if (userSockets.size > 0) {
        return false;
      }

      this.activeSockets.delete(userId);
      this.userStatus.delete(parseInt(userId));
      return true;
    }
    return false;
  }

  updateStatus(userId: string, status: UserStatus) {
    if (this.userStatus.has(parseInt(userId))) {
      this.userStatus.set(parseInt(userId), status);
    }
  }
  getStatus(userId: number): UserStatus {
    return this.userStatus.get(userId) || 'offline';
  }

  getConnectedUsers(): number[] {
    return Array.from(this.userStatus.entries())
      .filter(([_, status]) => status === 'online')
      .map(([userId, _]) => userId);
  }
}

