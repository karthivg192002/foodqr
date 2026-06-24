import { Injectable, NotFoundException, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Subscription, SubscriptionFrequency } from './entities/subscription.entity';
import { OrdersService } from '../orders/orders.service';
import { OrderType, PaymentMethod } from '../../common/enums';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
import { tenantAwareRepo } from '../tenants/connection/tenant-aware-repo';

@Injectable()
export class SubscriptionsService implements OnModuleInit, OnModuleDestroy {
  private intervalRef: ReturnType<typeof setInterval>;

  constructor(
    @InjectRepository(Subscription) private subRepo: Repository<Subscription>,
    private readonly ordersService: OrdersService,
    connections: TenantConnectionService,
  ) {
    this.subRepo = tenantAwareRepo(connections, Subscription, subRepo);
  }

  onModuleInit() {
    // Check for due subscriptions every 15 minutes
    this.intervalRef = setInterval(() => this.processDueSubscriptions(), 15 * 60 * 1000);
  }

  onModuleDestroy() {
    if (this.intervalRef) clearInterval(this.intervalRef);
  }

  findByUser(userId: string) {
    return this.subRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string, userId?: string) {
    const sub = await this.subRepo.findOne({ where: { id } });
    if (!sub) throw new NotFoundException('Subscription not found');
    if (userId && sub.userId !== userId) throw new NotFoundException('Subscription not found');
    return sub;
  }

  create(userId: string, data: Partial<Subscription>) {
    const sub = this.subRepo.create({ ...data, userId });
    if (!sub.nextOrderDate) sub.nextOrderDate = this.computeNextDate(new Date(), sub.frequency || 'weekly');
    return this.subRepo.save(sub);
  }

  async update(id: string, userId: string, data: Partial<Subscription>) {
    await this.findOne(id, userId);
    await this.subRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.subRepo.delete(id);
    return { message: 'Subscription cancelled' };
  }

  private computeNextDate(from: Date, frequency: SubscriptionFrequency): Date {
    const next = new Date(from);
    switch (frequency) {
      case 'daily': next.setDate(next.getDate() + 1); break;
      case 'weekly': next.setDate(next.getDate() + 7); break;
      case 'monthly': next.setMonth(next.getMonth() + 1); break;
    }
    return next;
  }

  async processDueSubscriptions() {
    const due = await this.subRepo.find({
      where: { isActive: true, nextOrderDate: LessThanOrEqual(new Date()) },
    });

    for (const sub of due) {
      try {
        await this.ordersService.create(sub.userId, {
          orderType: (sub.orderType as OrderType) || OrderType.DELIVERY,
          paymentMethod: (sub.paymentMethod as PaymentMethod) || PaymentMethod.CASH_ON_DELIVERY,
          branchId: sub.branchId,
          diningTableId: sub.diningTableId,
          orderNote: sub.orderNote ?? `Recurring subscription: ${sub.name}`,
          items: sub.items.map((i) => ({
            itemId: i.itemId,
            quantity: i.quantity,
            variationId: i.variationId,
            extras: i.extras,
          })),
        } as any);

        const nextDate = this.computeNextDate(new Date(), sub.frequency);
        await this.subRepo.update(sub.id, { nextOrderDate: nextDate });
      } catch {
        // Log silently — don't stop processing other subscriptions
      }
    }
  }
}
