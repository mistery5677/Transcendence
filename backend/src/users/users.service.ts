import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { userInfo } from 'node:os';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  create(registerDto: RegisterDto) {
    return this.prisma.user.create({
      data: { ...registerDto, score: { create: {} } },
    });
  }

  async findByIdentity(identity: string) {
    return this.prisma.user.findFirst({
      where: { OR: [{ email: identity }, { username: identity }] },
    });
  }

  async findOneByUsername(username: string) {
    if (!username) return null;
    return this.prisma.user.findUnique({
      where: { username: username },
      include: { score: true },
    });
  }
  async findOneByEmail(email: string) {
    if (!email) return null;
    return this.prisma.user.findUnique({ where: { email: email } });
  }

  async updateAvatar(userId: number, avatarUrl: string) {
    const user = await this.findOneById(userId);

    if (!user) {
      throw new NotFoundException('User not Found');
    }

    return await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: avatarUrl, updatedAt: new Date() },
    });
  }

  async updatePassword(userId: number, current: string, newPassword: string) {
    const user = await this.findOneByIdInternal(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isMatch = await bcryptjs.compare(current, user.password);
    if (!isMatch) {
      throw new UnauthorizedException("Current password doesn't match");
    }
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    return await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword, updatedAt: new Date() },
    });
  }

  async updateBoardTheme(userId: number, boardTheme: number) {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // !For now
    if (boardTheme < 1 || boardTheme > 3)
      throw new ForbiddenException("Theme with that index doesn't exist");

    return await this.prisma.user.update({
      where: { id: userId },
      data: { boardTheme: boardTheme },
    });
  }
  async updateBackgroundTheme(userId: number, backgroundTheme: number) {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // !For now
    if (backgroundTheme < 1 || backgroundTheme > 5)
      throw new ForbiddenException("Theme with that index doesn't exist");

    return await this.prisma.user.update({
      where: { id: userId },
      data: { backgroundTheme: backgroundTheme },
    });
  }

  async updateUsername(userId: number, newUsername: string) {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const existingUser = await this.findOneByUsername(newUsername);

    if (existingUser && existingUser.id !== user.id) {
      throw new ForbiddenException('Username already on use');
    }

    return await this.prisma.user.update({
      where: { id: userId },
      data: { username: newUsername },
    });
  }

  async updateEmail(userId: number, newEmail: string) {
    const user = await this.findOneById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const existingUser = await this.findOneByEmail(newEmail);

    if (existingUser && existingUser.id !== user.id) {
      throw new ForbiddenException('Email already on use');
    }

    return await this.prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
  async findOneByIdInternal(id: number) {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }
  //   async findOneById(id: number) {
  //     return await this.prisma.user.findUnique({
  //       where: { id },
  //       include: {
  //         score: true,
  //       },
  //       select: {
  //         id: true,
  //         username: true,
  //         email: true,
  //         elo: true,
  //         wins: true,
  //         losses: true,
  //         avatarUrl: true,
  //         createdAt: true,
  //         name: true,
  //         boardTheme: true,
  //         backgroundTheme: true,
  //         draws: true,
  //         updatedAt: true,
  //         totalGames: true,
  //         bestWinStreak: true,
  //         currentWinStreak: true,
  //         averageEloGain: true,
  //         averageEloLoss: true,
  //         bestElo: true,
  //       },
  //     });
  //   }
  async findOneById(id: number) {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        name: true,
        boardTheme: true,
        backgroundTheme: true,
        createdAt: true,
        updatedAt: true,

        score: {
          select: {
            elo: true,
            wins: true,
            losses: true,
            draws: true,
            totalGames: true,
            bestWinStreak: true,
            currentWinStreak: true,
            bestElo: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  // Find all the users to create the leaderboard
  async getLeaderboard() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        score: {
          select: {
            elo: true,
            wins: true,
            losses: true,
          },
        },
      },
      orderBy: {
        score: {
          elo: 'desc',
        },
      },
      take: 10, // Limits to 10 to not overload the data base
    });

    // Calculate the position of each user
    return users.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
  }

  async getUsers(userName: string) {
    return await this.prisma.user.findMany({
      where: {
        username: {
          contains: userName,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        score: {
          select: {
            elo: true,
          },
        },
      },
    });
  }
  async findByIds(ids: number[]) {
    if (ids.length === 0) return [];

    return this.prisma.user.findMany({
      where: {
        id: {
          in: ids, //Search all ids of the list
        },
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
      },
    });
  }
}
