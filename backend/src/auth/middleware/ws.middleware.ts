import { JwtService } from '@nestjs/jwt';
import { parse } from 'cookie';
import { Socket } from 'socket.io';
import { UsersService } from 'src/users/users.service';
import { AuthenticatedSocket } from 'src/common/types/authenticated-socket.interface';

interface JwtPayload {
  userId: number;
  username: string;
}

export const WsMiddleware = (
  jwtService: JwtService,
  userService: UsersService,
) => {
  return (socket: Socket, next: (err?: Error) => void) => {
    const cookies = socket.handshake.headers.cookie || '';
    const token = parse(cookies)['access_token'];

    if (!token) {
      console.log('User not Logged In');
      next(new Error('Unauthorized'));
      return;
    }

    void jwtService
      .verifyAsync<JwtPayload>(token)
      .then(async (payload) => {
        const user = await userService.findOneById(payload.userId);

        (socket as AuthenticatedSocket).data.user = {
          userId: String(payload.userId),
          username: payload.username,
          avatarUrl: user?.avatarUrl || undefined,
        };
        next();
      })
      .catch(() => {
        next(new Error('Unauthorized'));
      });
  };
};
