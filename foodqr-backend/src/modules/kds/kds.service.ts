import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderStatus } from '../../common/enums';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
import { tenantAwareRepo } from '../tenants/connection/tenant-aware-repo';

@Injectable()
export class KdsService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    connections: TenantConnectionService,
  ) {
    this.orderRepo = tenantAwareRepo(connections, Order, orderRepo);
  }

  async getKdsOrders(branchId?: string) {
    const qb = this.orderRepo.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.item', 'item')
      .leftJoinAndSelect('order.diningTable', 'diningTable')
      .leftJoinAndSelect('order.user', 'user')
      .where('order.status IN (:...statuses)', {
        statuses: [OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.PREPARING],
      })
      .orderBy('order.createdAt', 'ASC');

    if (branchId) qb.andWhere('order.branchId = :branchId', { branchId });
    return qb.getMany();
  }

  async updateStatus(orderId: string, status: OrderStatus) {
    await this.orderRepo.update(orderId, { status });
    return this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['items', 'items.item', 'diningTable'],
    });
  }
}
