import { Injectable, NotFoundException } from '@nestjs/common';
import { PresenceService } from 'src/presence/presence.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly presenceService: PresenceService,
  ) {}

  async saveMessage(fromUserId: number, toUserId: number, message: string) {
    const recipientExists = await this.prismaService.user.findUnique({
      where: { id: toUserId },
    });
    if (!recipientExists) {
      throw new NotFoundException('Recipient not found.');
    }
    return this.prismaService.privateMessage.create({
      data: {
        fromId: fromUserId,
        toId: toUserId,
        message: message,
      },
      include: { fromUser: { select: { username: true, avatarUrl: true } } },
    });
  }

  async getChatHistory(userIdA: number, userIdB: number, limit = 50) {
    const history = await this.prismaService.privateMessage.findMany({
      where: {
        OR: [
          { fromId: userIdA, toId: userIdB },
          { fromId: userIdB, toId: userIdA },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: { fromUser: { select: { username: true, avatarUrl: true } } },
    });

    return history.reverse();
  }

  async getActiveChats(userId: number) {
    const messages = await this.prismaService.privateMessage.findMany({
      where: {
        OR: [{ fromId: userId }, { toId: userId }],
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        fromUser: {
          select: { id: true, username: true, avatarUrl: true },
        },
        toUser: {
          select: { id: true, username: true, avatarUrl: true },
        },
      },
    });

    const chatMap = new Map();

    for (const msg of messages) {
      const isSender = msg.fromId === userId;
      const partner = isSender ? msg.toUser : msg.fromUser;

      if (!partner) continue;

      const partnerId = String(partner.id);

      const status = this.presenceService.getStatus(partner.id);

      if (!chatMap.has(partnerId)) {
        chatMap.set(partnerId, {
          id: partnerId,
          status: status,
          username: partner.username,
          avatarUrl: partner.avatarUrl,
          lastMessage: {
            message: msg.message,
            timestamp: msg.createdAt.toISOString(),
            fromId: String(msg.fromId),
            toId: String(msg.toId),
          },
          timestamp: msg.createdAt.toISOString(),
        });
      }
    }

    return Array.from(chatMap.values());
  }
}
