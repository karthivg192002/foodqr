import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmsGateway } from './entities/sms-gateway.entity';
import { SmsGatewaysService } from './sms-gateways.service';
import { SmsGatewaysController } from './sms-gateways.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SmsGateway])],
  providers: [SmsGatewaysService],
  controllers: [SmsGatewaysController],
  exports: [SmsGatewaysService],
})
export class SmsGatewaysModule {}
