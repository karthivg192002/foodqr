import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Tenant } from './entities/tenant.entity';
import { SaasPlan } from './entities/saas-plan.entity';
import { TenantUserIndex } from './entities/tenant-user-index.entity';
import { TenantInvoice } from './entities/tenant-invoice.entity';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { Branch } from '../branches/entities/branch.entity';
import { PaymentGateway } from '../payment-gateways/entities/payment-gateway.entity';
import { TenantsController } from './tenants.controller';
import { TenantSelfController } from './tenant-self.controller';
import { TenantsService } from './tenants.service';
import { TenantConnectionService } from './connection/tenant-connection.service';
import { TenantProvisioningService } from './connection/tenant-provisioning.service';
import { TenantContextMiddleware } from './connection/tenant-context.middleware';
import { TenantBillingService } from './billing/tenant-billing.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, SaasPlan, TenantUserIndex, TenantInvoice, User, Order, Branch, PaymentGateway]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET', 'secret'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '7d') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [TenantsController, TenantSelfController],
  providers: [TenantsService, TenantConnectionService, TenantProvisioningService, TenantContextMiddleware, TenantBillingService],
  exports: [TypeOrmModule, TenantsService, TenantConnectionService, TenantProvisioningService, TenantContextMiddleware, TenantBillingService],
})
export class TenantsModule {}
