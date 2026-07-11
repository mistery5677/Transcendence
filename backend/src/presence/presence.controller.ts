import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { PresenceService } from './presence.service';

@Controller('presence')
export class PresenceController {
  constructor(
    private readonly presenceService: PresenceService,
    private readonly usersService: UsersService,
  ) {}

  @Get('online-user')
  async allOnlineUsers() {
    const connectedUsers = this.presenceService.getConnectedUsers();

    const onlineUsersData = await this.usersService.findByIds(connectedUsers);

    return onlineUsersData;
  }

  @Get(':id')
  async getUserStatus(@Param('friendId', ParseIntPipe) UserId: number) {
    return this.presenceService.getStatus(UserId);
  }
}
