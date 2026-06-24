import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleDefinition } from './entities/role-definition.entity';
import { RoleDefinitionsService } from './role-definitions.service';
import { RoleDefinitionsController } from './role-definitions.controller';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([RoleDefinition]), TenantsModule],
  controllers: [RoleDefinitionsController],
  providers: [RoleDefinitionsService],
  exports: [RoleDefinitionsService],
})
export class RoleDefinitionsModule {}
