import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

interface JwtPayload {
  userId: number;
  username: string;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = this.extractTokenFromCookie(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      // 💡 Here the JWT secret key that's used for verifying the payload is the key that was passed in the JwtModule
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      // 💡 We're assigning the payload to the request object here  so that we can access it in our route handlers
      request.user = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromCookie(
    request: AuthenticatedRequest,
  ): string | undefined {
    if (request.cookies && 'access_token' in request.cookies) {
      return request.cookies.access_token as string;
    }
    return undefined;
  }
}
