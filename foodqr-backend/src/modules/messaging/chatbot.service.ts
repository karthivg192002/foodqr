import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { LoyaltyStamp } from '../loyalty/entities/loyalty-stamp.entity';
import { LoyaltyProgram } from '../loyalty/entities/loyalty-program.entity';
import { LoyaltyReward } from '../loyalty/entities/loyalty-reward.entity';
import { Item } from '../menu/items/entities/item.entity';

@Injectable()
export class ChatbotService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(LoyaltyStamp) private stampRepo: Repository<LoyaltyStamp>,
    @InjectRepository(LoyaltyProgram) private programRepo: Repository<LoyaltyProgram>,
    @InjectRepository(LoyaltyReward) private rewardRepo: Repository<LoyaltyReward>,
    @InjectRepository(Item) private itemRepo: Repository<Item>,
  ) {}

  async respond(userId: string, text: string): Promise<{ reply: string; type: string }> {
    const intent = this.detectIntent(text.toLowerCase());

    switch (intent) {
      case 'track_order': return this.handleOrderTracking(userId);
      case 'loyalty': return this.handleLoyalty(userId);
      case 'redeem': return this.handleRedemption(userId);
      case 'recommend': return this.handleRecommendations();
      case 'wait_time': return this.handleWaitTime(userId);
      case 'hours': return { reply: 'Our restaurant is open daily from 10:00 AM to 11:00 PM. Happy to serve you!', type: 'hours' };
      case 'menu': return { reply: 'You can browse our full menu in the Menu section. We have a wide variety of dishes including starters, mains, and desserts!', type: 'menu' };
      case 'help': return this.helpMessage();
      default: return { reply: "I'm not sure I understand. Try asking about your order status, loyalty stamps, menu recommendations, or restaurant hours. Type 'help' for a list of things I can help with.", type: 'unknown' };
    }
  }

  private detectIntent(text: string): string {
    if (/\b(order|track|status|where|delivery)\b/.test(text)) return 'track_order';
    if (/\b(redeem|use reward|claim reward|use my reward|use points)\b/.test(text)) return 'redeem';
    if (/\b(stamp|loyalty|reward|points)\b/.test(text)) return 'loyalty';
    if (/\b(recommend|suggest|popular|best|favourite|try)\b/.test(text)) return 'recommend';
    if (/\b(wait|how long|time|queue)\b/.test(text)) return 'wait_time';
    if (/\b(hour|open|close|timing|schedule)\b/.test(text)) return 'hours';
    if (/\b(menu|food|item|dish|eat)\b/.test(text)) return 'menu';
    if (/\b(help|hi|hello|hey|what can)\b/.test(text)) return 'help';
    return 'unknown';
  }

  private async handleOrderTracking(userId: string) {
    const order = await this.orderRepo.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    if (!order) {
      return { reply: "You don't have any orders yet. Place an order and I'll keep you updated!", type: 'track_order' };
    }
    return {
      reply: `Your latest order #${order.orderSerialNo} is currently "${order.status}". ${this.statusDescription(order.status)}`,
      type: 'track_order',
    };
  }

  private async handleRedemption(userId: string) {
    const reward = await this.rewardRepo.findOne({ where: { userId, isRedeemed: false }, order: { createdAt: 'ASC' } });
    if (!reward) {
      const program = await this.programRepo.findOne({ where: { isActive: true } });
      if (!program) return { reply: "There is no active loyalty program right now.", type: 'redeem' };
      const stamps = await this.stampRepo.sum('stampCount', { userId, loyaltyProgramId: program.id }) || 0;
      const remaining = Math.max(0, program.requiredStamps - stamps);
      return { reply: `You don't have any rewards to redeem yet. Collect ${remaining} more stamp(s) to earn your next reward!`, type: 'redeem' };
    }
    await this.rewardRepo.update(reward.id, { isRedeemed: true, redeemedAt: new Date() });
    return { reply: '🎉 Your reward has been redeemed successfully! It will be applied to your next order. Enjoy!', type: 'redeem', rewardId: reward.id };
  }

  private async handleLoyalty(userId: string) {
    const program = await this.programRepo.findOne({ where: { isActive: true } });
    if (!program) return { reply: "We don't have an active loyalty program right now. Stay tuned!", type: 'loyalty' };

    const stamps = await this.stampRepo.sum('stampCount', { userId, loyaltyProgramId: program.id }) || 0;
    const remaining = Math.max(0, program.requiredStamps - stamps);
    if (remaining === 0) {
      return { reply: `🎉 You have ${stamps} stamps and have earned a reward! Go to the Loyalty section to redeem it.`, type: 'loyalty' };
    }
    return { reply: `You have ${stamps} stamps. Just ${remaining} more to earn your next reward under the "${program.name}" program!`, type: 'loyalty' };
  }

  private async handleRecommendations() {
    const items = await this.itemRepo.find({ where: { isFeatured: true }, take: 3 });
    if (!items.length) {
      return { reply: 'Check out our full menu — everything is freshly prepared! Our chefs recommend trying our daily specials.', type: 'recommend' };
    }
    const names = items.map((i) => i.name).join(', ');
    return { reply: `Here are some of our featured items you might love: ${names}. You can find them in the Menu section!`, type: 'recommend' };
  }

  private async handleWaitTime(userId: string) {
    const pendingCount = await this.orderRepo.count({ where: { status: 'pending' as any } });
    const prepCount = await this.orderRepo.count({ where: { status: 'preparing' as any } });
    const total = pendingCount + prepCount;
    const estimate = total <= 2 ? '10-15 minutes' : total <= 5 ? '15-25 minutes' : '25-40 minutes';
    return { reply: `We currently have ${total} order(s) ahead of you. Estimated wait time is approximately ${estimate}.`, type: 'wait_time' };
  }

  private helpMessage() {
    return {
      reply: `Hi there! I can help you with:\n• 📦 **Order tracking** — ask "Where is my order?"\n• ⭐ **Loyalty stamps** — ask "How many stamps do I have?"\n• 🍽️ **Recommendations** — ask "What do you recommend?"\n• ⏰ **Wait times** — ask "How long is the wait?"\n• 🕐 **Opening hours** — ask "Are you open?"\n• 📋 **Menu** — ask "What's on the menu?"`,
      type: 'help',
    };
  }

  private statusDescription(status: string): string {
    const map: Record<string, string> = {
      pending: 'We have received it and will confirm shortly.',
      accepted: 'Our team has accepted your order.',
      preparing: 'Our chefs are working on it right now!',
      prepared: 'Your order is ready and waiting for pickup/delivery.',
      out_for_delivery: 'It is on its way to you!',
      delivered: 'It has been delivered. Enjoy your meal!',
      canceled: 'Unfortunately this order was canceled.',
    };
    return map[status] || '';
  }
}
