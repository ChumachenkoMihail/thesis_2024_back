import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SetNotificationAsReadDto } from './dto/notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prismaService: PrismaService) {}
  async getUserNotifications(userId: number) {
    return this.prismaService.notifications.findMany({
      where: {
        toUserId: userId,
        valid: true,
      },
      include: {
        from: true,
        to: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async setNotificationAsRead(userId: number, body: SetNotificationAsReadDto) {
    const notification = await this.prismaService.notifications.findFirst({
      where: {
        id: body.notificationId,
        toUserId: userId,
      },
    });
    if (!notification) {
      throw new BadRequestException(
        `No notification with id ${body.notificationId}`,
      );
    }
    return this.prismaService.notifications.update({
      where: {
        id: notification.id,
      },
      data: {
        status: 'READ',
      },
    });
  }
}
