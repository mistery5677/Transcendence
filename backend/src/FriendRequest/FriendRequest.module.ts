import { Module } from '@nestjs/common';
import { FriendRequestController } from './FriendRequest.controller';
import { FriendRequestService } from './FriendRequest.service';
import { PrismaService } from 'src/prisma/prisma.service'; // Confirma se o caminho do teu PrismaService é este
import { AchievementsModule } from 'src/achievements/achievements.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PresenceModule } from 'src/presence/presence.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    PresenceModule,
    NotificationModule,
    PrismaModule,
    AchievementsModule,
  ],
  controllers: [FriendRequestController],
  providers: [FriendRequestService, PrismaService],
})
export class FriendRequestModule {}
