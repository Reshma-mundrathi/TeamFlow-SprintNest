import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { Notification } from '@prisma/client';

@Injectable()
export class NotificationRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: { title: string; message: string; userId: string; type: string }): Promise<Notification> {
    return this.prisma.notification.create({
      data,
    });
  }

  async findByUser(userId: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string): Promise<any> {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
