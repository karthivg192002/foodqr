import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu, MenuSection } from './entities/menu-section.entity';
import { MenuSectionsService } from './menu-sections.service';
import { MenuSectionsController } from './menu-sections.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Menu, MenuSection])],
  controllers: [MenuSectionsController],
  providers: [MenuSectionsService],
  exports: [MenuSectionsService],
})
export class MenuSectionsModule {}
