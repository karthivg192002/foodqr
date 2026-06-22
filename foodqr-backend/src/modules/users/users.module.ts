import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { Address } from '../addresses/entities/address.entity';
import { TenantUserIndex } from '../tenants/entities/tenant-user-index.entity';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Order, Address, TenantUserIndex]), TenantsModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
