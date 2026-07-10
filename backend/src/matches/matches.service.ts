import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AchievementsService } from '../achievements/achievements.service';
import { getUserMatchHistory } from './dto/getMatchHistory.dto';
import { Prisma } from '@prisma/client';
import { UsersService } from 'src/users/users.service';

//* Prisma Features to declare types
type MatchWithPlayers = Prisma.MatchHistoryGetPayload<{
  include: {
    playerA: { select: { username: true } };
    playerB: { select: { username: true } };
  };
}>;

@Injectable()
export class MatchesService {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
    private achievementsService: AchievementsService,
  ) {}

  async saveMatchResult(
    playerWId: number,
    playerBId: number,
    winnerId: number | null,
  ) {
    // Save the information in the Match History
    const match = await this.prisma.matchHistory.create({
      data: {
        playerAId: playerWId,
        playerBId: playerBId,
        result: winnerId ? `WINNER_ID_${winnerId}` : 'DRAW',
      },
    });

    if (winnerId === null) {
      await this.handleDraw(playerWId, playerBId);
      return { message: 'Match saved (Draw)', matchId: match.id };
    }

    const loserId = winnerId === playerWId ? playerBId : playerWId;
    await Promise.all([this.handleLoss(loserId), this.handleWin(winnerId)]);

    return { message: 'Match saved', matchId: match.id };
  }

  //*Aux functions
  private async handleDraw(
    playerWId: number,
    playerBId: number,
  ): Promise<void> {
    const drawData = {
      draws: { increment: 1 },
      totalGames: { increment: 1 },
      currentWinStreak: 0,
    };

    await Promise.all([
      this.prisma.score.update({
        where: { userId: playerWId },
        data: drawData,
      }),
      this.prisma.score.update({
        where: { userId: playerBId },
        data: drawData,
      }),
    ]);
  }

  private async handleWin(winnerId: number): Promise<void> {
    const updatedWinnerUser = await this.prisma.user.update({
      where: { id: winnerId },
      data: {
        score: {
          update: {
            wins: { increment: 1 },
            elo: { increment: 8 },
            totalGames: { increment: 1 },
            currentWinStreak: { increment: 1 },
          },
        },
      },
      include: { score: true },
    });
    const winnerScore = updatedWinnerUser.score!;

    await Promise.all([
      this.updateBestElo(winnerId, winnerScore.elo, winnerScore.bestElo),
      this.updateBestWinStreak(
        winnerId,
        winnerScore.currentWinStreak,
        winnerScore.bestWinStreak,
      ),
    ]);
    await this.triggerWinnerAchievements(winnerId, winnerScore.elo);
  }

  private async handleLoss(loserId: number): Promise<void> {
    await this.prisma.score.update({
      where: { userId: loserId },
      data: {
        losses: { increment: 1 },
        elo: { decrement: 8 },
        totalGames: { increment: 1 },
        currentWinStreak: 0,
      },
    });
  }

  private async updateBestElo(
    userId: number,
    currentElo: number,
    bestElo: number,
  ) {
    if (currentElo <= bestElo) return;

    console.log(
      `Updating bestElo for user ${userId} from ${bestElo} to ${currentElo}`,
    );

    await this.prisma.score.update({
      where: { userId },
      data: { bestElo: currentElo },
    });
  }
  private async updateBestWinStreak(
    userId: number,
    currentStreak: number,
    bestStreak: number,
  ): Promise<void> {
    if (currentStreak <= bestStreak) return;

    console.log(
      `New record! Updating bestWinStreak for user ${userId} from ${bestStreak} to ${currentStreak}`,
    );

    await this.prisma.score.update({
      where: { userId },
      data: { bestWinStreak: currentStreak },
    });
  }

  private async triggerWinnerAchievements(
    winnerId: number,
    elo: number,
  ): Promise<void> {
    await Promise.all([
      // Check the first win achievement
      this.achievementsService.checkFirstWin(winnerId),
      // Check the grandmaster achievement
      this.achievementsService.checkGrandMaster(winnerId, elo),
    ]);
  }
  //*

  // Get the information of the match
  async getUserMatchHistory(userId: number) {
    return await this.prisma.matchHistory.findMany({
      where: {
        OR: [
          { playerAId: userId }, // User of the white pieces
          { playerBId: userId }, // User of the black pieces
        ],
      },
      orderBy: { createdAt: 'desc' }, // Order the match from the oldest one
      include: {
        // Get the username of the users
        playerA: { select: { username: true } },
        playerB: { select: { username: true } },
      },
    });
  }

  // Get the match history of the username
  async getUserMatchHistoryByUsername(
    username: string,
  ): Promise<getUserMatchHistory[] | null> {
    const user = await this.usersService.findOneByUsername(username);

    if (!user) {
      throw new NotFoundException("User doesn't exist");
    }

    const rawMatches = await this.getUserMatchHistory(user.id);

    return rawMatches.map((match) => this.formatMatchData(match, user.id));
  }

  private formatMatchData(
    match: MatchWithPlayers,
    userId: number,
  ): getUserMatchHistory {
    const isPlayerA = match.playerAId === userId;
    const opponent = isPlayerA
      ? match.playerB.username
      : match.playerA.username;
    const playedAs: 'WHITE' | 'BLACK' = isPlayerA ? 'WHITE' : 'BLACK';

    let result: 'WIN' | 'LOSS' | 'DRAW';

    if (match.result === 'DRAW') {
      result = 'DRAW';
    } else {
      const extractedWinnerId = parseInt(
        match.result.replace('WINNER_ID_', ''),
        10,
      );
      result = extractedWinnerId === userId ? 'WIN' : 'LOSS';
    }

    return {
      gameId: match.id,
      createdAt: match.createdAt,
      opponent,
      result,
      playedAs,
    };
  }
}
