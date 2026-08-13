import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AchievementsService {
  constructor(private prisma: PrismaService) {}

  // Check to enable the achievement of the first win
  async checkFirstWin(userId: number) {
    try {
      console.log(
        `[BACKEND - FIM DE JOGO] A verificar FIRST_WIN para o user: ${userId}`,
      );
      const alreadyHas = await this.prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: { userId, achievementId: 'FIRST_WIN' },
        },
      });
      console.log(
        `[BACKEND] O utilizador já tem a medalha?`,
        alreadyHas ? 'Sim' : 'Não',
      );
      if (alreadyHas) return null;

      const totalWins = await this.prisma.matchHistory.count({
        where: {
          result: `WINNER_ID_${userId}`,
        },
      });

      if (totalWins === 1) {
        console.log(
          `[BACKEND] 🏆 A GRAVAR NOVA MEDALHA PARA O USER ${userId}!`,
        );
        await this.prisma.userAchievement.create({
          data: {
            userId: userId,
            achievementId: 'FIRST_WIN',
          },
        });
        console.log(
          `[BACKEND] Total de vitórias encontradas na tabela MatchHistory: ${totalWins}`,
        );
        return {
          id: 'FIRST_WIN',
          title: 'First Blood!',
          description: 'Ganha a tua primeira partida de xadrez online.',
          icon: '🥇',
        };
      }

      return null;
    } catch (error) {
      console.error('Erro no verificar a primeira vitoria: ', error);
      return null;
    }
  }

  // Check if you have the first friend achievement
  async checkFirstFriend(userId: number) {
    try {
      // Check if we already have the medal
      const alreadyHas = await this.prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: { userId, achievementId: 'FIRST_FRIEND' },
        },
      });

      if (alreadyHas) return null;

      // Count how many friends do we have
      const totalFriends = await this.prisma.friendRequest.count({
        where: {
          status: 'ACCEPTED',
          OR: [{ senderId: userId }, { receiverId: userId }],
        },
      });

      console.log(`[BACKEND] The user ${userId} have ${totalFriends} friends.`);

      if (totalFriends > 0) {
        console.log(
          `[BACKEND] 👋 Saving the first friend achievement ${userId}!`,
        );
        await this.prisma.userAchievement.create({
          data: {
            userId: userId,
            achievementId: 'FIRST_FRIEND',
          },
        });

        return {
          id: 'FIRST_FRIEND',
          title: 'Friends Forever',
          description: 'Add a friend to your list',
          icon: '👋',
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to check the first friend achievement:', error);
      return null;
    }
  }

  // Check if you have the GrandMaster achievement
  async checkGrandMaster(userId: number, currentElo: number) {
    try {
      // If the elo is lower we return null
      if (currentElo < 1800) return null;

      // Check if you already have the achievement
      const alreadyHas = await this.prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: { userId, achievementId: 'GRAND_MASTER' },
        },
      });

      if (alreadyHas) return null;

      // Save the stats if you achieved the elo for the first time
      console.log(`[BACKEND] ⚔️ The user ${userId} got grand master`);
      await this.prisma.userAchievement.create({
        data: {
          userId: userId,
          achievementId: 'GRAND_MASTER',
        },
      });

      return {
        id: 'GRAND_MASTER',
        title: 'Grand Master',
        description: 'Achieve 1800 elo for the first time',
        icon: '⚔️',
      };
    } catch (error) {
      console.error('Failed to check grand master:', error);
      return null;
    }
  }

  // Get all unlocked achievements
  async getUserUnlockedAchievements(userId: number): Promise<string[]> {
    try {
      const records = await this.prisma.userAchievement.findMany({
        where: { userId: userId },
      });

      return records.map((record) => record.achievementId);
    } catch (error) {
      console.error('Failed to get the achievements:', error);
      return [];
    }
  }
}
