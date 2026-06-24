import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DefaultAccess } from './entities/default-access.entity';
import { DefaultAccessService } from './default-access.service';
import { DefaultAccessController } from './default-access.controller';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([DefaultAccess]), TenantsModule],
  providers: [DefaultAccessService],
  controllers: [DefaultAccessController],
  exports: [DefaultAccessService],
})
export class DefaultAccessModule {}
