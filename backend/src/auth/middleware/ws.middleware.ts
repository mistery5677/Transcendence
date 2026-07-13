import { JwtService } from '@nestjs/jwt';
import { parse } from 'cookie';
import { Socket } from 'socket.io';
import { UsersService } from 'src/users/users.service';

export const WsMiddleware = (
  jwtService: JwtService,
  userService: UsersService,
) => {
  return async (socket: Socket, next: (err?: Error) => void) => {
    try {
      const cookies = socket.handshake.headers.cookie || '';
      const token = parse(cookies)['access_token'];

      if (!token) {
        console.log('User not Logged In');
        throw new Error('Unauthorized');
      }
      const payload = await jwtService.verifyAsync(token);

      const user = await userService.findOneById(payload.userId);

      socket.data.user = {
        userId: String(payload.userId),
        username: payload.username,
        avatarUrl: user?.avatarUrl || null,
      };
      next();
    } catch (err: any) {
      next(new Error('Unauthorized'));
    }
  };
};
