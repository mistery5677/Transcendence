import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { FriendRequestService } from './FriendRequest.service';
import { AuthGuard } from '../auth/guard/auth.guard';
import { SendFriendRequestDto } from './dto/send-friend-request.dto';
import { SenderIdDto, FriendIdDto } from './dto/friend-target.dto';

@Controller('FriendRequest')
export class FriendRequestController {
  constructor(private readonly friendRequestService: FriendRequestService) {}

  // Send a friend request
  @UseGuards(AuthGuard)
  @Post('request')
  async sendFriendRequest(@Body() dto: SendFriendRequestDto, @Req() req) {
    // The ID sender comes from the authentication token (through AuthGuard)
    const senderId = req.user.userId;

    return await this.friendRequestService.sendRequest(
      senderId,
      dto.targetUsername,
    );
  }

  // See all the pending request
  @UseGuards(AuthGuard)
  @Get('pending')
  async getPendingRequests(@Req() req) {
    const userId = req.user.userId;
    return await this.friendRequestService.getPendingRequests(userId);
  }

  // Accept the friend request
  @UseGuards(AuthGuard)
  @Post('accept')
  async acceptFriendRequest(@Body() dto: SenderIdDto, @Req() req) {
    // Who is accepting the request, is the receiver
    const receiverId = req.user.userId;
    return await this.friendRequestService.acceptRequest(
      receiverId,
      dto.senderId,
    );
  }

  // Decline the friend request
  @UseGuards(AuthGuard)
  @Post('decline')
  async declineFriendRequest(@Body() dto: SenderIdDto, @Req() req) {
    // Who is declining the request, is the receiver
    const receiverId = req.user.userId;
    return await this.friendRequestService.declineRequest(
      receiverId,
      dto.senderId,
    );
  }

  // List all accepted friends
  @UseGuards(AuthGuard)
  @Get('list')
  async getFriends(@Req() req) {
    const friends = await this.friendRequestService.getFriends(req.user.userId);
    return friends;
  }

  // Remove an accepted friend
  @UseGuards(AuthGuard)
  @Post('remove')
  async removeFriend(@Body() dto: FriendIdDto, @Req() req) {
    return await this.friendRequestService.removeFriend(
      req.user.userId,
      dto.friendId,
    );
  }
}
