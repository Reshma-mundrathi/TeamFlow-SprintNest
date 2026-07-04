import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { PrismaModule } from './common/services/prisma.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ProjectModule } from './modules/project/project.module';
import { TaskModule } from './modules/task/task.module';
import { IncidentModule } from './modules/incident/incident.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ReportModule } from './modules/report/report.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  imports: [
    PrismaModule,
    CommonModule,
    AuthModule,
    UserModule,
    ProjectModule,
    TaskModule,
    IncidentModule,
    NotificationModule,
    ReportModule,
    DashboardModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
