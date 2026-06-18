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

  async getCreditBalanceReport(startDate?: string, endDate?: string) {
    const qb = this.transactionRepo.createQueryBuilder('tx')
      .leftJoinAndSelect('tx.user', 'user')
      .select([
        'user.id as userId',
        'user.name as name',
        'user.email as email',
        `SUM(CASE WHEN tx.sign = '+' THEN tx.amount ELSE 0 END) as totalCredit`,
        `SUM(CASE WHEN tx.sign = '-' THEN tx.amount ELSE 0 END) as totalDebit`,
        `SUM(CASE WHEN tx.sign = '+' THEN tx.amount ELSE -tx.amount END) as balance`,
        'COUNT(tx.id) as transactionCount',
      ])
      .groupBy('user.id, user.name, user.email')
      .orderBy('balance', 'DESC');

    if (startDate) qb.andWhere('tx.createdAt >= :start', { start: new Date(startDate) });
    if (endDate) qb.andWhere('tx.createdAt <= :end', { end: new Date(endDate) });

    return qb.getRawMany();
  }

  async getItemsReport(startDate?: string, endDate?: string, categoryId?: string) {
    const qb = this.orderItemRepo.createQueryBuilder('oi')
      .leftJoin('oi.item', 'item')
      .leftJoin('oi.order', 'order')
      .leftJoin('item.category', 'category')
      .select([
        'item.id as itemId',
        'item.name as itemName',
        'item.thumbImage as itemImage',
        'category.name as categoryName',
        'SUM(oi.quantity) as totalQuantity',
        'SUM(oi.subtotal) as totalRevenue',
        'COUNT(DISTINCT order.id) as orderCount',
        'AVG(oi.unitPrice) as avgPrice',
      ])
      .where('order.status != :status', { status: OrderStatus.CANCELED })
      .groupBy('item.id, item.name, item.thumbImage, category.name')
      .orderBy('totalQuantity', 'DESC');

    if (startDate) qb.andWhere('order.createdAt >= :start', { start: new Date(startDate) });
    if (endDate) qb.andWhere('order.createdAt <= :end', { end: new Date(endDate) });
    if (categoryId) qb.andWhere('item.categoryId = :categoryId', { categoryId });

    return qb.getRawMany();
  }

  async getAnalyticsSummary(startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const [salesByDay, revenueByType, topItems, newCustomers] = await Promise.all([
      this.orderRepo.createQueryBuilder('o')
        .where('o.createdAt BETWEEN :start AND :end', { start, end })
        .andWhere('o.paymentStatus = :ps', { ps: PaymentStatus.PAID })
        .select(["DATE_TRUNC('day', o.createdAt) as day", 'COUNT(o.id) as orders', 'SUM(o.total) as revenue'])
        .groupBy("DATE_TRUNC('day', o.createdAt)")
        .orderBy('day', 'ASC')
        .getRawMany(),
      this.getRevenueByOrderType(startDate, endDate),
      this.getTopItems(5, startDate, endDate),
      this.userRepo.count({
        where: { role: UserRole.CUSTOMER, createdAt: Between(start, end) as any },
      }),
    ]);

    return { salesByDay, revenueByType, topItems, newCustomers };
  }

  async getCategoryWiseSales(startDate?: string, endDate?: string) {
    const qb = this.orderItemRepo.createQueryBuilder('oi')
      .leftJoin('oi.item', 'item')
      .leftJoin('oi.order', 'order')
      .leftJoin('item.category', 'category')
      .select('category.name', 'categoryName')
      .addSelect('category.id', 'categoryId')
      .addSelect('SUM(oi.quantity)', 'totalQty')
      .addSelect('SUM(oi.totalPrice)', 'totalRevenue')
      .addSelect('COUNT(DISTINCT order.id)', 'orderCount')
      .where('order.paymentStatus = :ps', { ps: PaymentStatus.PAID })
      .groupBy('category.id')
      .addGroupBy('category.name')
      .orderBy('SUM(oi.totalPrice)', 'DESC');

    if (startDate) qb.andWhere('order.createdAt >= :start', { start: new Date(startDate) });
    if (endDate) qb.andWhere('order.createdAt <= :end', { end: new Date(endDate) });
    return qb.getRawMany();
  }

  async getHourlyPeakOrders(startDate?: string, endDate?: string) {
    const qb = this.orderRepo.createQueryBuilder('order')
      .select('EXTRACT(HOUR FROM order.createdAt)', 'hour')
      .addSelect('COUNT(order.id)', 'orderCount')
      .addSelect('SUM(order.total)', 'revenue')
      .groupBy('EXTRACT(HOUR FROM order.createdAt)')
      .orderBy('EXTRACT(HOUR FROM order.createdAt)', 'ASC');

    if (startDate) qb.andWhere('order.createdAt >= :start', { start: new Date(startDate) });
    if (endDate) qb.andWhere('order.createdAt <= :end', { end: new Date(endDate) });
    return qb.getRawMany();
  }

  async getStaffLeaderboard(startDate?: string, endDate?: string) {
    const qb = this.orderRepo.createQueryBuilder('order')
      .leftJoin('order.staff', 'staff')
      .where('order.staffId IS NOT NULL')
      .andWhere('order.status = :s', { s: OrderStatus.DELIVERED })
      .select('staff.id', 'staffId')
      .addSelect('staff.name', 'staffName')
      .addSelect('staff.role', 'role')
      .addSelect('COUNT(order.id)', 'ordersHandled')
      .addSelect('SUM(order.total)', 'totalRevenue')
      .groupBy('staff.id')
      .addGroupBy('staff.name')
      .addGroupBy('staff.role')
      .orderBy('COUNT(order.id)', 'DESC')
      .limit(10);

    if (startDate) qb.andWhere('order.createdAt >= :start', { start: new Date(startDate) });
    if (endDate) qb.andWhere('order.createdAt <= :end', { end: new Date(endDate) });
    return qb.getRawMany();
  }

  async getSalesOverview(startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date('2000-01-01');
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const [totalOrders, paidOrders, totalRevenue, avgOrder, topItem] = await Promise.all([
      this.orderRepo.createQueryBuilder('o').where('o.createdAt BETWEEN :start AND :end', { start, end }).getCount(),
      this.orderRepo.createQueryBuilder('o').where('o.paymentStatus = :ps', { ps: PaymentStatus.PAID }).andWhere('o.createdAt BETWEEN :start AND :end', { start, end }).getCount(),
      this.transactionRepo.createQueryBuilder('tx').where('tx.status = :s', { s: PaymentStatus.PAID }).andWhere('tx.createdAt BETWEEN :start AND :end', { start, end }).select('SUM(tx.amount)', 'total').getRawOne(),
      this.transactionRepo.createQueryBuilder('tx').where('tx.status = :s', { s: PaymentStatus.PAID }).andWhere('tx.createdAt BETWEEN :start AND :end', { start, end }).select('AVG(tx.amount)', 'avg').getRawOne(),
      this.orderItemRepo.createQueryBuilder('oi')
        .leftJoin('oi.item', 'item')
        .where('oi.createdAt BETWEEN :start AND :end', { start, end })
        .select('item.name', 'itemName')
        .addSelect('SUM(oi.quantity)', 'qty')
        .groupBy('item.name').orderBy('qty', 'DESC').limit(1).getRawOne(),
    ]);

    const revenue = parseFloat(totalRevenue?.total || '0');
    return {
      period: { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] },
      totalOrders, paidOrders, unpaidOrders: totalOrders - paidOrders,
      totalRevenue: revenue,
      avgOrderValue: parseFloat(avgOrder?.avg || '0'),
      topSellingItem: topItem?.itemName || null,
    };
  }

  async getQrRevenueSummary(startDate?: string, endDate?: string) {
    const qb = this.orderRepo.createQueryBuilder('order')
      .where('order.paymentStatus = :ps', { ps: PaymentStatus.PAID })
      .select('order.orderType', 'orderType')
      .addSelect('COUNT(order.id)', 'orderCount')
      .addSelect('SUM(order.total)', 'revenue')
      .addSelect('AVG(order.total)', 'avgOrderValue')
      .groupBy('order.orderType');

    if (startDate) qb.andWhere('order.createdAt >= :start', { start: new Date(startDate) });
    if (endDate) qb.andWhere('order.createdAt <= :end', { end: new Date(endDate) });
    return qb.getRawMany();
  }

  /** Geographic/demographic breakdown of customers */
  async getCustomerStates(startDate?: string, endDate?: string) {
    const [totalCustomers, newCustomers, returningCustomers, guestCustomers, byRole] = await Promise.all([
      this.userRepo.count({ where: { role: UserRole.CUSTOMER } }),
      this.userRepo.createQueryBuilder('u')
        .where('u.role = :role', { role: UserRole.CUSTOMER })
        .andWhere(startDate ? 'u.createdAt >= :start' : '1=1', { start: startDate ? new Date(startDate) : undefined })
        .andWhere(endDate ? 'u.createdAt <= :end' : '1=1', { end: endDate ? new Date(endDate) : undefined })
        .getCount(),
      this.orderRepo.createQueryBuilder('o')
        .innerJoin('o.user', 'u')
        .where('u.role = :role', { role: UserRole.CUSTOMER })
        .select('COUNT(DISTINCT o.userId)', 'count')
        .getRawOne(),
      this.userRepo.count({ where: { isGuest: true } as any }),
      this.userRepo.createQueryBuilder('u')
        .select('u.role', 'role')
        .addSelect('COUNT(u.id)', 'count')
        .groupBy('u.role')
        .getRawMany(),
    ]);

    return {
      totalCustomers,
      newCustomers,
      returningCustomers: parseInt(returningCustomers?.count || '0', 10),
      guestCustomers,
      byRole,
    };
  }

  /** Hourly peak orders as bar-chart-ready data */
  async getPeakOrdersBarChart(startDate?: string, endDate?: string) {
    const hourly = await this.getHourlyPeakOrders(startDate, endDate);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const byDayOfWeek = await this.orderRepo.createQueryBuilder('order')
      .select('EXTRACT(DOW FROM order.createdAt)', 'dayOfWeek')
      .addSelect('COUNT(order.id)', 'orderCount')
      .addSelect('SUM(order.total)', 'revenue')
      .groupBy('EXTRACT(DOW FROM order.createdAt)')
      .orderBy('dayOfWeek', 'ASC')
      .getRawMany();

    const allHours = Array.from({ length: 24 }, (_, i) => {
      const row = hourly.find((r: any) => parseInt(r.hour) === i);
      return { hour: i, label: `${i}:00`, orderCount: parseInt(row?.ordercount || '0'), revenue: parseFloat(row?.revenue || '0') };
    });

    const allDays = days.map((name, i) => {
      const row = byDayOfWeek.find((r: any) => parseInt(r.dayofweek) === i);
      return { dayOfWeek: i, label: name, orderCount: parseInt(row?.ordercount || '0'), revenue: parseFloat(row?.revenue || '0') };
    });

    return { hourly: allHours, daily: allDays };
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
