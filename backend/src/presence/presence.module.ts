import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { PresenceController } from './presence.controller';
import { PresenceService } from './presence.service';
import { PresenceGateway } from './presence.gateway';
import { GameModule } from 'src/game/game.module';
import { JwtModule } from '@nestjs/jwt';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    JwtModule,
    UsersModule,
    NotificationModule,
    forwardRef(() => GameModule),
  ],
  controllers: [PresenceController],
  providers: [PresenceService],
  exports: [PresenceService],
})
export class PresenceModule {}
