import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentGateway } from './entities/payment-gateway.entity';
import { PaymentGatewaysService } from './payment-gateways.service';
import { PaymentGatewaysController } from './payment-gateways.controller';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentGateway]), TenantsModule],
  providers: [PaymentGatewaysService],
  controllers: [PaymentGatewaysController],
  exports: [PaymentGatewaysService],
})
export class PaymentGatewaysModule {}
