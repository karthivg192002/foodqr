import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';
import { Branch } from './entities/branch.entity';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([Branch]), TenantsModule],
  controllers: [BranchesController],
  providers: [BranchesService],
  exports: [BranchesService, TypeOrmModule],
})
export class BranchesModule {}
