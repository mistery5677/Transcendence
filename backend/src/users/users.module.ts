import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AchievementsService } from 'src/achievements/achievements.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, AchievementsService],
  exports: [UsersService],
})
export class UsersModule {}
