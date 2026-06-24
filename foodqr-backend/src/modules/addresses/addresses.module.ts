import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([Address]), TenantsModule],
  providers: [AddressesService],
  controllers: [AddressesController],
  exports: [AddressesService],
})
export class AddressesModule {}
