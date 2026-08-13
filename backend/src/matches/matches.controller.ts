import { Controller, UseGuards, Get, Req, Param } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { MatchesService } from './matches.service';
import { getUserMatchHistory } from './dto/getMatchHistory.dto';

interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
  };
}

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @UseGuards(AuthGuard)
  @Get('history')
  async getHistory(@Req() req: AuthenticatedRequest) {
    const userId = req.user.userId; // The guard checks for the user ID
    return await this.matchesService.getUserMatchHistory(userId);
  }

  @Get('player/:username') // The username that we want to check the match history
  async getHistoryByUsername(
    @Param('username') username: string,
  ): Promise<getUserMatchHistory[] | null> {
    return await this.matchesService.getUserMatchHistoryByUsername(username);
  }
}
