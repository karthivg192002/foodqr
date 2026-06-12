import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { User } from '../users/entities/user.entity';
import { Item } from '../menu/items/entities/item.entity';
import { DiningTable } from '../dining-tables/entities/dining-table.entity';
import { Transaction } from '../payments/entities/transaction.entity';
import { OrderStatus, PaymentStatus, UserRole } from '../../common/enums';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemRepo: Repository<OrderItem>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Item) private itemRepo: Repository<Item>,
    @InjectRepository(DiningTable) private tableRepo: Repository<DiningTable>,
    @InjectRepository(Transaction) private transactionRepo: Repository<Transaction>,
  ) {}

  async getDashboardSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalOrders, todayOrders, totalCustomers, totalItems, totalTables,
      totalRevenue, todayRevenue, monthRevenue, pendingOrders, deliveredOrders,
    ] = await Promise.all([
      this.orderRepo.count(),
      this.orderRepo.count({ where: { createdAt: Between(today, tomorrow) } as any }),
      this.userRepo.count({ where: { role: UserRole.CUSTOMER } }),
      this.itemRepo.count({ where: { status: true } }),
      this.tableRepo.count(),
      this.transactionRepo.createQueryBuilder('tx').where('tx.status = :s', { s: PaymentStatus.PAID }).select('SUM(tx.amount)', 'total').getRawOne(),
      this.transactionRepo.createQueryBuilder('tx').where('tx.status = :s', { s: PaymentStatus.PAID }).andWhere('tx.createdAt BETWEEN :start AND :end', { start: today, end: tomorrow }).select('SUM(tx.amount)', 'total').getRawOne(),
      this.transactionRepo.createQueryBuilder('tx').where('tx.status = :s', { s: PaymentStatus.PAID }).andWhere('tx.createdAt >= :start', { start: monthStart }).select('SUM(tx.amount)', 'total').getRawOne(),
      this.orderRepo.count({ where: { status: OrderStatus.PENDING } }),
      this.orderRepo.count({ where: { status: OrderStatus.DELIVERED } }),
    ]);

    return {
      totalOrders, todayOrders, totalCustomers, totalItems, totalTables,
      totalRevenue: parseFloat(totalRevenue?.total || '0'),
      todayRevenue: parseFloat(todayRevenue?.total || '0'),
      monthRevenue: parseFloat(monthRevenue?.total || '0'),
      pendingOrders, deliveredOrders,
    };
  }

  async getSalesReport(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const data = await this.orderRepo
      .createQueryBuilder('order')
      .where('order.createdAt BETWEEN :start AND :end', { start, end })
      .andWhere('order.paymentStatus = :status', { status: PaymentStatus.PAID })
      .select([
        "DATE_TRUNC('day', order.createdAt) as date",
        'COUNT(order.id) as orderCount',
        'SUM(order.total) as revenue',
      ])
      .groupBy("DATE_TRUNC('day', order.createdAt)")
      .orderBy('date', 'ASC')
      .getRawMany();

    return data;
  }

  async getTopItems(limit = 10, startDate?: string, endDate?: string) {
    const qb = this.orderItemRepo
      .createQueryBuilder('oi')
      .leftJoinAndSelect('oi.item', 'item')
      .leftJoin('oi.order', 'order')
      .select(['item.id', 'item.name', 'item.thumbImage', 'SUM(oi.quantity) as totalQuantity', 'SUM(oi.subtotal) as totalRevenue'])
      .where('order.status != :status', { status: OrderStatus.CANCELED })
      .groupBy('item.id, item.name, item.thumbImage')
      .orderBy('totalQuantity', 'DESC')
      .take(limit);

    if (startDate) qb.andWhere('order.createdAt >= :start', { start: new Date(startDate) });
    if (endDate) qb.andWhere('order.createdAt <= :end', { end: new Date(endDate) });

    return qb.getRawMany();
  }

  async getRevenueByOrderType(startDate?: string, endDate?: string) {
    const qb = this.orderRepo
      .createQueryBuilder('order')
      .where('order.paymentStatus = :status', { status: PaymentStatus.PAID })
      .select(['order.orderType as type', 'COUNT(order.id) as count', 'SUM(order.total) as revenue'])
      .groupBy('order.orderType');

    if (startDate) qb.andWhere('order.createdAt >= :start', { start: new Date(startDate) });
    if (endDate) qb.andWhere('order.createdAt <= :end', { end: new Date(endDate) });

    return qb.getRawMany();
  }

  async getCustomerStats() {
    const [total, newThisMonth, topCustomers] = await Promise.all([
      this.userRepo.count({ where: { role: UserRole.CUSTOMER } }),
      this.userRepo.count({
        where: {
          role: UserRole.CUSTOMER,
          createdAt: Between(
            new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            new Date(),
          ) as any,
        },
      }),
      this.orderRepo
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.user', 'user')
        .where('order.paymentStatus = :status', { status: PaymentStatus.PAID })
        .select(['user.id', 'user.name', 'user.email', 'COUNT(order.id) as orderCount', 'SUM(order.total) as totalSpent'])
        .groupBy('user.id, user.name, user.email')
        .orderBy('totalSpent', 'DESC')
        .take(10)
        .getRawMany(),
    ]);

    return { total, newThisMonth, topCustomers };
  }
}
