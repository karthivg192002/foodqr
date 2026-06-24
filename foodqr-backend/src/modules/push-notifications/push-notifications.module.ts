import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PushNotification } from './entities/push-notification.entity';
import { PushNotificationsService } from './push-notifications.service';
import { PushNotificationsController } from './push-notifications.controller';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([PushNotification]), TenantsModule],
  providers: [PushNotificationsService],
  controllers: [PushNotificationsController],
  exports: [PushNotificationsService],
})
export class PushNotificationsModule {}
