import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';

export type NotificationType = 'matchInvite' | 'system' | 'friendRequest';

interface NotificationPayload {
  title: string;
  message: string;
  type: NotificationType;
  payload?: Record<string, any>;
}

@Injectable()
export class NotificationService {
  private server?: Server;

  constructor(private readonly prisma: PrismaService) {}

  setServer(server: Server) {
    this.server = server;
  }

  async sendNotification(targetUserId: number, data: NotificationPayload) {
    try {
      const savedNotification = await this.prisma.notification.create({
        data: {
          userId: targetUserId,
          title: data.title,
          message: data.message,
          type: data.type,
          payload: data.payload || {},
        },
      });

      console.log(`[Notification DB] Saved on database ${targetUserId}`);

      if (!this.server) {
        console.warn(
          '[NotificationService] Server instance not set yet. Live emit skipped.',
        );
        return savedNotification;
      }

      const socketPacket = {
        ...savedNotification,
        createdAt: savedNotification.createdAt.toISOString(),
        payload: savedNotification.payload as Record<string, any>,
      };

      this.server.to(`user_${targetUserId}`).emit('notification', socketPacket);
      console.log(
        `[Notification Socket] Sent to user_${targetUserId}: ${data.title}`,
      );

      return savedNotification;
    } catch (error) {
      console.error('Error processing notifications:', error);
    }
  }

  async getUserNotifications(userId: number) {
    if (!userId || typeof userId !== 'number' || Number.isNaN(userId)) {
      throw new BadRequestException(
        'Invalid or missing User ID for fetching notifications.',
      );
    }

    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
  }

  async markAllAsRead(userId: number) {
    if (!userId || typeof userId !== 'number' || Number.isNaN(userId)) {
      throw new BadRequestException(
        'Invalid or missing User ID for updating notifications.',
      );
    }

    return this.prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: { read: true },
    });
  }

  async markAsRead(userId: number, notificationId: string) {
    if (!userId || typeof userId !== 'number' || Number.isNaN(userId)) {
      throw new BadRequestException(
        'Invalid or missing User ID for updating notifications.',
      );
    }
    if (!notificationId || typeof notificationId !== 'string') {
      throw new BadRequestException(
        'Invalid or missing notificationId for updating notifications.',
      );
    }

    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        read: false,
      },
      data: { read: true },
    });
  }
}
