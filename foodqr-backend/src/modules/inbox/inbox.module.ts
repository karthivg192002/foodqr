import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InboxNotification } from './entities/inbox-notification.entity';
import { InboxService } from './inbox.service';
import { InboxController } from './inbox.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InboxNotification])],
  providers: [InboxService],
  controllers: [InboxController],
  exports: [InboxService],
})
export class InboxModule {}
