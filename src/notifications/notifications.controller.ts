import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { SetNotificationAsReadDto } from './dto/notifications.dto';

@Controller('notifications')
@ApiTags('notifications')
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('get-user-notifications')
  @UseGuards(AccessTokenGuard)
  async getUserNotifications(@CurrentUser('userId') userId: number) {
    return this.notificationsService.getUserNotifications(userId);
  }

  @Post('set-notification-read')
  @UseGuards(AccessTokenGuard)
  async setNotificationAsRead(
    @Body() body: SetNotificationAsReadDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.notificationsService.setNotificationAsRead(userId, body);
  }
}
