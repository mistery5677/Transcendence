// src/common/types/authenticated-socket.interface.ts
import { Socket } from 'socket.io';

export interface SocketUser {
  userId: string;
  username: string;
  avatarUrl?: string;
}

export interface AuthenticatedSocket extends Socket {
  data: {
    user?: SocketUser;
  };
}
