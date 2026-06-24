import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu, MenuSection } from './entities/menu-section.entity';
import { MenuSectionsService } from './menu-sections.service';
import { MenuSectionsController } from './menu-sections.controller';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([Menu, MenuSection]), TenantsModule],
  controllers: [MenuSectionsController],
  providers: [MenuSectionsService],
  exports: [MenuSectionsService],
})
export class MenuSectionsModule {}
