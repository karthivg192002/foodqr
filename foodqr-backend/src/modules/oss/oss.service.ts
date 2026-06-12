import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderStatus } from '../../common/enums';

@Injectable()
export class OssService {
  constructor(@InjectRepository(Order) private orderRepo: Repository<Order>) {}

  async getOssOrders(branchId?: string) {
    const qb = this.orderRepo.createQueryBuilder('order')
      .leftJoinAndSelect('order.diningTable', 'diningTable')
      .leftJoinAndSelect('order.user', 'user')
      .where('order.status IN (:...statuses)', {
        statuses: [OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.PREPARED],
      })
      .orderBy('order.createdAt', 'DESC')
      .take(50);

    if (branchId) qb.andWhere('order.branchId = :branchId', { branchId });
    return qb.getMany();
  }
}
