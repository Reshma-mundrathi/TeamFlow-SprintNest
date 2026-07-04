import { Module } from '@nestjs/common';
import { IncidentController } from './incident.controller';
import { IncidentService } from './incident.service';
import { IncidentRepository } from './incident.repository';
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
  controllers: [IncidentController],
  providers: [IncidentService, IncidentRepository],
  exports: [IncidentService, IncidentRepository],
})
export class IncidentModule {}
