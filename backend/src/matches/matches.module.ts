import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { AchievementsModule } from 'src/achievements/achievements.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
  imports: [AchievementsModule, UsersModule],
})
export class MatchesModule {}
