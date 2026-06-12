import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Item } from '../menu/items/entities/item.entity';
import { ItemVariation } from '../menu/variations/entities/item-variation.entity';
import { User } from '../users/entities/user.entity';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { OrderStatus, OrderType, PaymentStatus } from '../../common/enums';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Item) private itemRepo: Repository<Item>,
    @InjectRepository(ItemVariation) private variationRepo: Repository<ItemVariation>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const orderItems: Partial<OrderItem>[] = [];
    let subtotal = 0;
    let totalTax = 0;

    for (const orderItemDto of dto.items) {
      const item = await this.itemRepo.findOne({ where: { id: orderItemDto.itemId } });
      if (!item) throw new NotFoundException(`Item ${orderItemDto.itemId} not found`);

      let unitPrice = Number(item.price);
      let variationName = null;

      if (orderItemDto.variationId) {
        const variation = await this.variationRepo.findOne({ where: { id: orderItemDto.variationId } });
        if (variation) {
          unitPrice = Number(variation.price) || unitPrice + Number(variation.additionalPrice);
          variationName = variation.name;
        }
      }

      const taxAmount = (unitPrice * Number(item.taxRate || 0)) / 100;
      const itemSubtotal = (unitPrice + taxAmount) * orderItemDto.quantity;

      subtotal += unitPrice * orderItemDto.quantity;
      totalTax += taxAmount * orderItemDto.quantity;

      orderItems.push({
        itemId: item.id,
        itemName: item.name,
        itemImage: item.thumbImage,
        variationId: orderItemDto.variationId,
        variationName,
        quantity: orderItemDto.quantity,
        unitPrice,
        taxRate: Number(item.taxRate || 0),
        taxAmount: taxAmount * orderItemDto.quantity,
        subtotal: itemSubtotal,
        extras: orderItemDto.extras,
        specialNote: orderItemDto.specialNote,
      });
    }

    const discount = dto.discount || 0;
    const deliveryCharge = dto.orderType === OrderType.DELIVERY ? 0 : 0;
    const total = subtotal + totalTax + deliveryCharge - discount;

    const serial = 'ORD-' + Date.now().toString().slice(-8);
    const token = uuidv4().split('-')[0].toUpperCase();

    const order = this.orderRepo.create({
      orderSerialNo: serial,
      token,
      userId,
      orderType: dto.orderType,
      paymentMethod: dto.paymentMethod,
      diningTableId: dto.diningTableId,
      deliveryAddress: dto.deliveryAddress,
      orderNote: dto.orderNote,
      scheduledAt: dto.scheduledAt,
      isAdvanceOrder: dto.isAdvanceOrder || false,
      subtotal,
      discount,
      deliveryCharge,
      totalTax,
      total,
    });

    const savedOrder = await this.orderRepo.save(order);
    const items = orderItems.map((oi) => this.orderItemRepo.create({ ...oi, orderId: savedOrder.id }));
    await this.orderItemRepo.save(items);

    return this.findOne(savedOrder.id);
  }

  async findAll(filters: {
    status?: string; orderType?: string; userId?: string;
    branchId?: string; search?: string; page?: number; limit?: number;
  } = {}) {
    const { page = 1, limit = 20, ...rest } = filters;
    const qb = this.orderRepo.createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.item', 'item')
      .leftJoinAndSelect('order.diningTable', 'diningTable')
      .leftJoinAndSelect('order.branch', 'branch')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('order.createdAt', 'DESC');

    if (rest.status) qb.andWhere('order.status = :status', { status: rest.status });
    if (rest.orderType) qb.andWhere('order.orderType = :orderType', { orderType: rest.orderType });
    if (rest.userId) qb.andWhere('order.userId = :userId', { userId: rest.userId });
    if (rest.search) qb.andWhere('order.orderSerialNo ILIKE :search', { search: `%${rest.search}%` });

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['user', 'items', 'items.item', 'diningTable', 'branch', 'staff'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findByToken(token: string) {
    const order = await this.orderRepo.findOne({
      where: { token },
      relations: ['items', 'items.item', 'diningTable'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.findOne(id);
    await this.orderRepo.update(id, {
      status: dto.status as OrderStatus,
      cancellationReason: dto.cancellationReason,
      staffId: dto.staffId,
    });
    return this.findOne(id);
  }

  async updatePaymentStatus(id: string, transactionId: string) {
    await this.orderRepo.update(id, {
      paymentStatus: PaymentStatus.PAID,
      paymentTransactionId: transactionId,
    });
    return this.findOne(id);
  }

  async getCustomerOrders(userId: string, page = 1, limit = 10) {
    return this.findAll({ userId, page, limit });
  }

  async getKdsOrders(branchId?: string) {
    const qb = this.orderRepo.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.item', 'item')
      .leftJoinAndSelect('order.diningTable', 'diningTable')
      .where('order.status IN (:...statuses)', {
        statuses: [OrderStatus.ACCEPTED, OrderStatus.PREPARING],
      })
      .orderBy('order.createdAt', 'ASC');

    if (branchId) qb.andWhere('order.branchId = :branchId', { branchId });
    return qb.getMany();
  }

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrders, todayOrders, totalRevenue, pendingOrders] = await Promise.all([
      this.orderRepo.count(),
      this.orderRepo.count({ where: { createdAt: today } as any }),
      this.orderRepo
        .createQueryBuilder('order')
        .where('order.paymentStatus = :status', { status: PaymentStatus.PAID })
        .select('SUM(order.total)', 'total')
        .getRawOne(),
      this.orderRepo.count({ where: { status: OrderStatus.PENDING } }),
    ]);

    return {
      totalOrders,
      todayOrders,
      totalRevenue: totalRevenue?.total || 0,
      pendingOrders,
    };
  }
}
