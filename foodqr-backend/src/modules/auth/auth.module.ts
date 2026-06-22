import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { TenantUserIndex } from '../tenants/entities/tenant-user-index.entity';
import { TenantsModule } from '../tenants/tenants.module';
import { MailModule } from '../mail/mail.module';
import { SmsGatewaysModule } from '../sms-gateways/sms-gateways.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Order, OrderItem, Tenant, TenantUserIndex]),
    PassportModule,
    MailModule,
    SmsGatewaysModule,
    TenantsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET', 'secret'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '7d') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
