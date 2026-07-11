import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { PresenceModule } from 'src/presence/presence.module';
import { GameModule } from 'src/game/game.module';

@Module({
  imports: [PrismaModule, PresenceModule, GameModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
