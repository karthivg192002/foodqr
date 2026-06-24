import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { SmsGatewaysModule } from '../sms-gateways/sms-gateways.module';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), SmsGatewaysModule, TenantsModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
