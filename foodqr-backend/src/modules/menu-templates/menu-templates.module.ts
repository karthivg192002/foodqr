import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuTemplate } from './entities/menu-template.entity';
import { MenuTemplatesService } from './menu-templates.service';
import { MenuTemplatesController } from './menu-templates.controller';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([MenuTemplate]), TenantsModule],
  providers: [MenuTemplatesService],
  controllers: [MenuTemplatesController],
  exports: [MenuTemplatesService],
})
export class MenuTemplatesModule {}
