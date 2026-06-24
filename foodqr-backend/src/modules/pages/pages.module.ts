import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Page } from './entities/page.entity';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([Page]), TenantsModule],
  providers: [PagesService],
  controllers: [PagesController],
  exports: [PagesService],
})
export class PagesModule {}
