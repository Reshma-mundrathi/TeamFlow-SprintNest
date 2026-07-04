import { Injectable } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { NotificationGateway } from './notification.gateway';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class NotificationService {
  constructor(
    private notificationRepository: NotificationRepository,
    private notificationGateway: NotificationGateway,
    private prisma: PrismaService,
  ) {}

  async createNotification(userId: string, title: string, message: string, type: string) {
    const fiveSecondsAgo = new Date(Date.now() - 5000);
    const duplicate = await this.prisma.notification.findFirst({
      where: {
        userId,
        title,
        message,
        createdAt: {
          gte: fiveSecondsAgo,
        },
      },
    });

    if (duplicate) {
      return duplicate;
    }

    const notification = await this.notificationRepository.create({
      userId,
      title,
      message,
      type,
    });

    this.notificationGateway.sendToUser(userId, 'notification', notification);
    return notification;
  }

  async getNotifications(userId: string) {
    return this.notificationRepository.findByUser(userId);
  }

  async markAsRead(id: string) {
    return this.notificationRepository.markAsRead(id);
  }

  async markAllAsRead(userId: string) {
    return this.notificationRepository.markAllAsRead(userId);
  }
}
