import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ChatService } from './chat.service';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string | number;
  };
}

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('active_chats')
  @UseGuards(AuthGuard)
  async getActiveChats(@Req() req: AuthenticatedRequest) {
    const myUserId = Number(req.user.userId);

    return this.chatService.getActiveChats(myUserId);
  }

  @Get('getHistory/:friendId')
  @UseGuards(AuthGuard)
  async getHistory(
    @Param('friendId', ParseIntPipe) friendId: number,
    @Req() req: AuthenticatedRequest,
    @Query('limit') limit?: string,
  ) {
    const myUserId = Number(req.user.userId);
    const maxMessages = limit ? Number(limit) : 50;

    const history = await this.chatService.getChatHistory(
      myUserId,
      friendId,
      maxMessages,
    );

    return history.map((msg) => ({
      fromId: String(msg.fromId),
      toId: String(msg.toId),
      fromUsername: msg.fromUser.username,
      fromAvatarUrl: msg.fromUser.avatarUrl || '',
      message: msg.message,
      timestamp: msg.createdAt.toISOString(),
    }));
  }
}
