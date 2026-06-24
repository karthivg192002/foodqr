import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmsGateway } from './entities/sms-gateway.entity';
import { SmsGatewaysService } from './sms-gateways.service';
import { SmsGatewaysController } from './sms-gateways.controller';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([SmsGateway]), TenantsModule],
  providers: [SmsGatewaysService],
  controllers: [SmsGatewaysController],
  exports: [SmsGatewaysService],
})
export class SmsGatewaysModule {}
