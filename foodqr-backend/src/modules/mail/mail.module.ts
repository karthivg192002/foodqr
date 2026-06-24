import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailService } from './mail.service';
import { AppSetting } from '../settings/entities/app-setting.entity';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([AppSetting]), TenantsModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
