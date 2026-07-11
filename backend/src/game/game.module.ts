import { forwardRef, Module } from '@nestjs/common';
import { MatchesModule } from 'src/matches/matches.module';
import { NotificationModule } from 'src/notification/notification.module';
import { PresenceModule } from 'src/presence/presence.module';
import { StockfishController } from 'src/stockfish/stockfish.controller';
import { StockfishModule } from 'src/stockfish/stockfish.module';
import { UsersModule } from 'src/users/users.module';
import { GameService } from './game.service';
import { MatchMakingService } from './matchmaking.service';
import { GameGateway } from './game.gateway';
import { MatchGateway } from './match.gateway';
import { AchievementsService } from 'src/achievements/achievements.service';

@Module({
  imports: [
    MatchesModule,
    UsersModule,
    StockfishModule,
    forwardRef(() => PresenceModule),
    NotificationModule,
  ],
  providers: [
    GameService,
    MatchMakingService,
    GameGateway,
    MatchGateway,
    AchievementsService,
  ],
  exports: [GameService, MatchMakingService],
})
export class GameModule {}
