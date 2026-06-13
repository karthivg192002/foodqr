import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MessageHistory } from './entities/message-history.entity';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';
import { ChatbotService } from './chatbot.service';
import { Order } from '../orders/entities/order.entity';
import { LoyaltyStamp } from '../loyalty/entities/loyalty-stamp.entity';
import { LoyaltyProgram } from '../loyalty/entities/loyalty-program.entity';
import { Item } from '../menu/items/entities/item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, MessageHistory, Order, LoyaltyStamp, LoyaltyProgram, Item])],
  providers: [MessagingService, ChatbotService],
  controllers: [MessagingController],
  exports: [MessagingService],
})
export class MessagingModule {}
