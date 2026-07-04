import { Controller, Get, Put, Post, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('notification')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  async getNotifications(@Request() req: any) {
    return this.notificationService.getNotifications(req.user.sub);
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

  @Post('read-all')
  async markAllAsRead(@Request() req: any) {
    return this.notificationService.markAllAsRead(req.user.sub);
  }
}
