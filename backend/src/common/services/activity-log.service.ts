import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class ActivityLogService {
  constructor(private prisma: PrismaService) {}

  async log(userId: string | null, action: string, details?: string) {
    try {
      return await this.prisma.activityLog.create({
        data: {
          userId,
          action,
          details,
        },
      });
    } catch (error) {
      console.error('Failed to create activity log:', error);
    }
  }
}
