import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { NotificationService } from './notification.service';

@Controller('notification')
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('')
  async getNotification(@Req() req: any) {
    const userId = Number(req.user.userId);
    if (!userId || Number.isNaN(userId)) {
      throw new BadRequestException('User session is invalid or unauthorized');
    }

    return await this.notificationService.getUserNotifications(userId);
  }

  @Patch('read-all')
  async readAllNotifications(@Req() req: any) {
    const userId = Number(req.user.userId);
    if (!userId || Number.isNaN(userId)) {
      throw new BadRequestException('User session is invalid or unauthorized');
    }

    return await this.notificationService.markAllAsRead(userId);
  }

  @Patch('read/:notificationId')
  async readNotification(
    @Req() req: any,
    @Param('notificationId') notificationId: string,
  ) {
    const userId = Number(req.user.userId);
    if (!userId || Number.isNaN(userId)) {
      throw new BadRequestException('User session is invalid or unauthorized');
    }
    if (!notificationId || Number.isNaN(notificationId)) {
      throw new BadRequestException('NotificationId is invalid or missing');
    }

    return await this.notificationService.markAsRead(userId, notificationId);
  }
}
