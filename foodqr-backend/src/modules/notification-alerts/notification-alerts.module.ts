import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationAlert } from './entities/notification-alert.entity';
import { NotificationAlertsService } from './notification-alerts.service';
import { NotificationAlertsController } from './notification-alerts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationAlert])],
  providers: [NotificationAlertsService],
  controllers: [NotificationAlertsController],
  exports: [NotificationAlertsService],
})
export class NotificationAlertsModule {}
