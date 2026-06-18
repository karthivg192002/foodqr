import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NavMenu } from './entities/nav-menu.entity';
import { NavMenusService } from './nav-menus.service';
import { NavMenusController } from './nav-menus.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NavMenu])],
  controllers: [NavMenusController],
  providers: [NavMenusService],
})
export class NavMenusModule {}
