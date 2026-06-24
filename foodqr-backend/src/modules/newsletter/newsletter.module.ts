import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscriber } from './entities/subscriber.entity';
import { NewsletterService } from './newsletter.service';
import { NewsletterController } from './newsletter.controller';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([Subscriber]), TenantsModule],
  controllers: [NewsletterController],
  providers: [NewsletterService],
  exports: [NewsletterService],
})
export class NewsletterModule {}
