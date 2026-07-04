import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';
import { NotificationGateway } from './notification.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'sprintnest_jwt_secret_key_123!',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationRepository, NotificationGateway],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationModule {}
