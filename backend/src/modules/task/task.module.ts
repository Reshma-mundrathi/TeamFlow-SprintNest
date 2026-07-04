import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TaskRepository } from './task.repository';
import { NotificationModule } from '../notification/notification.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    NotificationModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'sprintnest_jwt_secret_key_123!',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [TaskController],
  providers: [TaskService, TaskRepository],
  exports: [TaskService, TaskRepository],
})
export class TaskModule {}
