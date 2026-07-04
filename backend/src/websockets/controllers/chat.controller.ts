import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('active_chats')
  @UseGuards(AuthGuard)
  async getActiveChats(@Req() req: any) {
    const rawUserId = req.user.userId;
    const myUserId = Number(rawUserId);

    return this.chatService.getActiveChats(myUserId);
  }

  @Get('getHistory/:friendId')
  @UseGuards(AuthGuard)
  async getHistory(
    @Param('friendId', ParseIntPipe) friendId: number,
    @Req() req: any,
    @Query('limit') limit?: string,
  ) {
    const rawUserId = req.user.userId;
    const myUserId = Number(rawUserId);

    const maxMessages = limit ? Number(limit) : 50;

    const history = await this.chatService.getChatHistory(
      myUserId,
      friendId,
      maxMessages,
    );

    return history.map((msg: any) => ({
      fromId: String(msg.fromId),
      toId: String(msg.toId),
      fromUsername: msg.fromUser.username,
      fromAvatarUrl: msg.fromUser.avatarUrl || '',
      message: msg.message,
      timestamp: msg.createdAt.toISOString(),
    }));
  }
}
