import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AchievementsService } from 'src/achievements/achievements.service';
import { PresenceService } from 'src/websockets/services/presence.service';
import { NotificationService } from 'src/websockets/services/notification.service';

@Injectable()
export class FriendRequestService {
  constructor(
    private prisma: PrismaService,
    private achievementsService: AchievementsService,
    private presenceService: PresenceService,
    private notificationService: NotificationService,
  ) {}

  async sendRequest(senderId: number, targetUsername: string) {
    // Find the invited user
    const receiver = await this.prisma.user.findUnique({
      where: { username: targetUsername },
    });

    if (receiver == null) {
      throw new NotFoundException('Username not found');
    }

    // Block to send the friend request from the sender
    if (senderId == receiver.id) {
      throw new BadRequestException(
        'You can not send a friend request to yourself.',
      );
    }

    // Check if you already have a friend request with that user
    const existingRequest = await this.prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: senderId, receiverId: receiver.id },
          { senderId: receiver.id, receiverId: senderId },
        ],
      },
    });

    // Send a error if already have a friend request
    if (existingRequest) {
      // If the friend request is pending
      if (existingRequest.status === 'PENDING') {
        throw new ConflictException(
          'Already exist a pendent friend request with this user.',
        );
      }

      // If you already are friends
      if (existingRequest.status === 'ACCEPTED') {
        throw new ConflictException('You already are friends');
      }
    }

    const newRequest = await this.prisma.friendRequest.create({
      data: {
        senderId: senderId,
        receiverId: receiver.id,
        status: 'PENDING',
      },
    });
    const sender = await this.prisma.user.findUnique({
      where: { id: senderId },
      select: { username: true, avatarUrl: true },
    });

    if (sender) {
      this.notificationService.sendNotification(receiver.id, {
        title: 'Friend Request',
        message: `sent you a Friend Request.`,
        type: 'friendRequest',
        payload: {
          senderId: senderId,
          senderAvatarUrl: sender.avatarUrl,
          senderUsername: sender.username,
        },
      });
    }

    return newRequest;
  }
  // Get the pending requests
  async getPendingRequests(userId: number) {
    return await this.prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: 'PENDING',
      },
      // The prisma pulls all the sender information
      include: {
        sender: {
          select: { username: true, avatarUrl: true }, // Show the username instead of the Id
        },
      },
    });
  }

  // Accept friend requests
  async acceptRequest(receiverId: number, senderId: number) {
    // Search for the right pending request
    const request = await this.prisma.friendRequest.findFirst({
      where: {
        senderId: senderId,
        receiverId: receiverId,
        status: 'PENDING',
      },
    });

    // If the request is already resolved, we throw an error
    if (request == null) {
      throw new NotFoundException(
        'Friend request not found or already processed',
      );
    }

    // Update the status for 'ACCEPTED'
    const updatedRequest = await this.prisma.friendRequest.update({
      where: { id: request.id },
      data: { status: 'ACCEPTED' },
    });

    // Update the achievements
    await this.achievementsService.checkFirstFriend(receiverId);
    await this.achievementsService.checkFirstFriend(senderId);

    return updatedRequest;
  }

  // Decline friend request
  async declineRequest(receiverId: number, senderId: number) {
    // Search for the right pending request
    const request = await this.prisma.friendRequest.findFirst({
      where: {
        senderId: senderId,
        receiverId: receiverId,
        status: 'PENDING',
      },
    });

    // If the request is already resolved, we throw an error
    if (request == null) {
      throw new NotFoundException('Friend request not found');
    }

    // We just delete the request from the data base
    return await this.prisma.friendRequest.delete({
      where: { id: request.id },
    });
  }

  // Get all the friends
  async getFriends(userId: number) {
    const publicUserFields = {
      id: true,
      username: true,
      avatarUrl: true,
      score: true,
    };

    const friends = await this.prisma.friendRequest.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: { select: publicUserFields },
        receiver: { select: publicUserFields },
      },
    });

    return friends.map((rel) => {
      const friendData = rel.senderId === userId ? rel.receiver : rel.sender;
      const status = this.presenceService.getStatus(friendData.id);
      return { ...friendData, status };
    });
  }

  // Remove the friend from the list
  async removeFriend(userId: number, friendId: number) {
    // Check the status if it is accepted
    const relation = await this.prisma.friendRequest.findFirst({
      where: {
        status: 'ACCEPTED',
        OR: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId },
        ],
      },
    });

    if (!relation) throw new NotFoundException('Friendship not found');

    return await this.prisma.friendRequest.delete({
      where: { id: relation.id },
    });
  }
}
