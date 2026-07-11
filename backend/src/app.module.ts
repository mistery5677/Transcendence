import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MatchesModule } from './matches/matches.module';
import { FriendRequestModule } from './FriendRequest/FriendRequest.module';
import { PrismaModule } from './prisma/prisma.module';
import { StockfishModule } from './stockfish/stockfish.module';
import { PresenceModule } from './presence/presence.module';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { NotificationModule } from './notification/notification.module';
import { PresenceGateway } from './presence/presence.gateway';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    MatchesModule,
    FriendRequestModule,
    StockfishModule,
    PresenceModule,
    ChatModule,
    GameModule,
    NotificationModule,
  ], //Allows to all variables be accessed
  providers: [PresenceGateway],
})
export class AppModule {}
