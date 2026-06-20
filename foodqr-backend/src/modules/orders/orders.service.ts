import { Injectable, NotFoundException, BadRequestException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderAddress } from './entities/order-address.entity';
import { Item } from '../menu/items/entities/item.entity';
import { ItemVariation } from '../menu/variations/entities/item-variation.entity';
import { User } from '../users/entities/user.entity';
import { Offer } from '../offers/entities/offer.entity';
import { OfferItem } from '../offers/entities/offer-item.entity';
import { AppSetting } from '../settings/entities/app-setting.entity';
import { LoyaltyStamp } from '../loyalty/entities/loyalty-stamp.entity';
import { LoyaltyProgram } from '../loyalty/entities/loyalty-program.entity';
import { TimeSlotsService } from '../time-slots/time-slots.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsService } from '../events/events.service';
import { DeliveryZonesService } from '../delivery-zones/delivery-zones.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { OrderStatus, OrderType, PaymentMethod, PaymentStatus } from '../../common/enums';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemRepo: Repository<OrderItem>,
    @InjectRepository(OrderAddress) private orderAddressRepo: Repository<OrderAddress>,
    @InjectRepository(Item) private itemRepo: Repository<Item>,
    @InjectRepository(ItemVariation) private variationRepo: Repository<ItemVariation>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Offer) private offerRepo: Repository<Offer>,
    @InjectRepository(OfferItem) private offerItemRepo: Repository<OfferItem>,
    @InjectRepository(AppSetting) private settingRepo: Repository<AppSetting>,
    @InjectRepository(LoyaltyStamp) private stampRepo: Repository<LoyaltyStamp>,
    @InjectRepository(LoyaltyProgram) private loyaltyProgramRepo: Repository<LoyaltyProgram>,
    private timeSlotsService: TimeSlotsService,
    private notificationsService: NotificationsService,
    private eventsService: EventsService,
    @Optional() private deliveryZonesService: DeliveryZonesService,
  ) {}

  private async getSetting(key: string, defaultValue = '0'): Promise<string> {
    const s = await this.settingRepo.findOne({ where: { key } });
    return s?.value ?? defaultValue;
  }

  private async calculateDeliveryCharge(
    distanceKm?: number,
    destLat?: number,
    destLng?: number,
    branchId?: string,
  ): Promise<number> {
    // Zone-based pricing takes priority when coordinates are available
    if (this.deliveryZonesService && destLat != null && destLng != null) {
      const zone = await this.deliveryZonesService.findZoneForPoint(destLat, destLng, branchId);
      if (zone) {
        const km = distanceKm ?? 0;
        return Number(zone.baseCharge) + km * Number(zone.perKmCharge);
      }
    }

    // Fall back to flat settings-based rate
    const [freeKm, basicCharge, perKmCharge] = await Promise.all([
      this.getSetting('delivery_free_km', '0'),
      this.getSetting('delivery_basic_charge', '0'),
      this.getSetting('delivery_per_km_charge', '0'),
    ]);

    const freeKmNum = parseFloat(freeKm);
    const basicChargeNum = parseFloat(basicCharge);
    const perKmNum = parseFloat(perKmCharge);

    if (!distanceKm || distanceKm <= freeKmNum) return basicChargeNum;
    return basicChargeNum + (distanceKm - freeKmNum) * perKmNum;
  }

  private async applyOffer(
    couponCode: string,
    subtotal: number,
    itemIds: string[],
  ): Promise<{ discount: number; offerId: string | null }> {
    const offer = await this.offerRepo.findOne({ where: { slug: couponCode, status: true } });
    if (!offer) return { discount: 0, offerId: null };

    const now = new Date();
    if (offer.startDate && offer.startDate > now) return { discount: 0, offerId: null };
    if (offer.endDate && offer.endDate < now) return { discount: 0, offerId: null };
    if (offer.minOrderAmount && subtotal < Number(offer.minOrderAmount)) return { discount: 0, offerId: null };

    // Item-scoped offer: at least one ordered item must qualify
    const offerItems = await this.offerItemRepo.find({ where: { offerId: offer.id } });
    if (offerItems.length > 0) {
      const qualifiedIds = new Set(offerItems.map((oi) => oi.itemId));
      if (!itemIds.some((id) => qualifiedIds.has(id))) return { discount: 0, offerId: null };
    }

    let discount =
      offer.discountType === 'percentage'
        ? (subtotal * Number(offer.discountAmount)) / 100
        : Number(offer.discountAmount);

    if (offer.maxDiscount && discount > Number(offer.maxDiscount)) {
      discount = Number(offer.maxDiscount);
    }

    return { discount: Math.min(discount, subtotal), offerId: offer.id };
  }

  private async awardLoyaltyStamps(userId: string, orderId: string, orderAmount: number) {
    const program = await this.loyaltyProgramRepo.findOne({ where: { isActive: true } });
    if (!program) return;

    const [minAmountStr, stampsPerOrderStr, stampsPerAmountStr, thresholdStr] = await Promise.all([
      this.getSetting('loyalty_min_order_amount', '0'),
      this.getSetting('loyalty_stamps_per_order', '1'),
      this.getSetting('loyalty_stamps_per_amount', '0'),
      this.getSetting('loyalty_amount_threshold', '100'),
    ]);

    if (orderAmount < parseFloat(minAmountStr)) return;

    let stamps = parseInt(stampsPerOrderStr, 10) || 1;
    const stampsPerAmount = parseInt(stampsPerAmountStr, 10);
    const threshold = parseFloat(thresholdStr) || 100;
    if (stampsPerAmount > 0 && threshold > 0) {
      stamps += Math.floor(orderAmount / threshold) * stampsPerAmount;
    }

    if (stamps > 0) {
      await this.stampRepo.save(
        this.stampRepo.create({
          userId,
          orderId,
          sourceId: orderId,
          loyaltyProgramId: program.id,
          stampCount: stamps,
          metadata: { source: 'order', orderId },
        } as any),
      );
    }
  }

  async create(userId: string | null, dto: CreateOrderDto) {
    const resolvedUserId = (userId === 'guest' || !userId) ? null : userId;
    const orderItems: Partial<OrderItem>[] = [];
    let subtotal = 0;
    let totalTax = 0;
    const itemIds: string[] = [];

    for (const orderItemDto of dto.items) {
      const item = await this.itemRepo.findOne({ where: { id: orderItemDto.itemId } });
      if (!item) throw new NotFoundException(`Item ${orderItemDto.itemId} not found`);

      const basePrice = Number(item.price);
      let unitPrice = basePrice;
      let variationName: string | null = null;
      let variationSnapshot: object[] = [];

      if (orderItemDto.variationId) {
        const variation = await this.variationRepo.findOne({ where: { id: orderItemDto.variationId } });
        if (variation) {
          // 'replace' → variation price fully replaces base price
          // 'addon'   → variation additionalPrice stacks on top of base price
          unitPrice =
            variation.priceType === 'replace'
              ? Number(variation.price)
              : basePrice + Number(variation.additionalPrice || 0);

          variationName = variation.name;
          variationSnapshot = [{
            id: variation.id,
            name: variation.name,
            price: variation.price,
            additionalPrice: variation.additionalPrice,
            priceType: variation.priceType,
          }];
        }
      }

      const extrasTotal = (orderItemDto.extras || []).reduce(
        (sum, e) => sum + Number(e.price || 0),
        0,
      );

      const taxRate = Number(item.taxRate || 0);
      const taxablePrice = unitPrice + extrasTotal;
      const taxAmount = (taxablePrice * taxRate) / 100;
      const lineTotal = (taxablePrice + taxAmount) * orderItemDto.quantity;

      subtotal += taxablePrice * orderItemDto.quantity;
      totalTax += taxAmount * orderItemDto.quantity;
      itemIds.push(item.id);

      orderItems.push({
        itemId: item.id,
        itemName: item.name,
        itemImage: item.thumbImage,
        variationId: orderItemDto.variationId,
        variationName,
        itemVariations: variationSnapshot,
        quantity: orderItemDto.quantity,
        unitPrice,
        taxRate,
        taxAmount: taxAmount * orderItemDto.quantity,
        itemExtraTotal: extrasTotal * orderItemDto.quantity,
        itemVariationTotal: (unitPrice - basePrice) * orderItemDto.quantity,
        totalPrice: lineTotal,
        subtotal: lineTotal,
        extras: orderItemDto.extras,
        specialNote: orderItemDto.specialNote,
      });
    }

    // Validate scheduled order against branch time slots
    if (dto.isAdvanceOrder && dto.scheduledAt && dto.branchId) {
      const slots = await this.timeSlotsService.findByBranch(dto.branchId);
      if (slots.length > 0 && !this.timeSlotsService.isWithinSlot(slots, new Date(dto.scheduledAt))) {
        throw new BadRequestException('Scheduled time is outside branch operating hours');
      }
    }

    let deliveryCharge = 0;
    if (dto.orderType === OrderType.DELIVERY) {
      const snap = dto.deliveryAddressSnapshot as any;
      const destLat = snap?.latitude ? Number(snap.latitude) : undefined;
      const destLng = snap?.longitude ? Number(snap.longitude) : undefined;
      deliveryCharge = await this.calculateDeliveryCharge(dto.deliveryDistanceKm, destLat, destLng, dto.branchId);
    }

    let discount = dto.discount || 0;
    if (dto.couponCode) {
      const result = await this.applyOffer(dto.couponCode, subtotal, itemIds);
      discount = result.discount;
    }

    const total = Math.max(0, subtotal + totalTax + deliveryCharge - discount);
    const paymentGateway = dto.paymentGateway
      || (![PaymentMethod.CASH_ON_DELIVERY, PaymentMethod.E_WALLET].includes(dto.paymentMethod)
        ? dto.paymentMethod
        : null);

    const order = this.orderRepo.create({
      orderSerialNo: 'ORD-' + Date.now().toString().slice(-8),
      token: uuidv4().split('-')[0].toUpperCase(),
      userId: resolvedUserId,
      orderType: dto.orderType,
      paymentMethod: dto.paymentMethod,
      paymentGateway,
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
      posReceivedAmount: dto.posReceivedAmount ?? 0,
    });

    const savedOrder = await this.orderRepo.save(order);

    await this.orderItemRepo.save(
      orderItems.map((oi) => this.orderItemRepo.create({ ...oi, orderId: savedOrder.id, branchId: dto.branchId })),
    );

    if (dto.orderType === OrderType.DELIVERY && dto.deliveryAddressSnapshot) {
      const snap = dto.deliveryAddressSnapshot as any;
      await this.orderAddressRepo.save(
        this.orderAddressRepo.create({
          orderId: savedOrder.id,
          userId,
          label: snap.label || 'Home',
          address: snap.address || '',
          apartment: snap.apartment,
          latitude: snap.latitude,
          longitude: snap.longitude,
        }),
      );
    }

    if (resolvedUserId) await this.awardLoyaltyStamps(resolvedUserId, savedOrder.id, total);

    // Notify admins and branch managers of the new order (non-blocking)
    this.notificationsService
      .broadcastToAll('New Order', `Order #${savedOrder.orderSerialNo} has been placed`)
      .catch(() => null);

    // Emit real-time event so KDS/OSS SSE streams update instantly
    this.eventsService.emit({ type: 'order:created', orderId: savedOrder.id, status: OrderStatus.PENDING, branchId: savedOrder.branchId });

    return this.findOne(savedOrder.id);
  }

  async findAll(filters: {
    status?: string; orderType?: string; userId?: string;
    branchId?: string; diningTableId?: string; search?: string; page?: number; limit?: number;
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
    if (rest.diningTableId) qb.andWhere('order.diningTableId = :diningTableId', { diningTableId: rest.diningTableId });
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
    // Send push + email + SMS notification to customer (non-blocking)
    if (order.userId) {
      this.notificationsService
        .sendOrderNotification(order.userId, order.orderSerialNo, dto.status)
        .catch(() => null);
    }
    // Emit real-time event for KDS/OSS SSE streams
    this.eventsService.emit({ type: 'order:updated', orderId: id, status: dto.status, branchId: order.branchId });
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

  async getDashboardStats(startDate?: string, endDate?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rangeQb = () => {
      const qb = this.orderRepo.createQueryBuilder('order');
      if (startDate) qb.andWhere('order.createdAt >= :start', { start: new Date(startDate) });
      if (endDate) qb.andWhere('order.createdAt <= :end', { end: new Date(endDate) });
      return qb;
    };

    const [totalOrders, todayOrders, totalRevenue, pendingOrders, statusBreakdown, totalDiscount, totalStamps,
      totalCustomers, recentOrders, topItems] =
      await Promise.all([
        this.orderRepo.count(),
        this.orderRepo.count({ where: { createdAt: today } as any }),
        this.orderRepo
          .createQueryBuilder('order')
          .where('order.paymentStatus = :status', { status: PaymentStatus.PAID })
          .select('SUM(order.total)', 'total')
          .getRawOne(),
        this.orderRepo.count({ where: { status: OrderStatus.PENDING } }),
        // A4.1: orders by status
        rangeQb()
          .select('order.status', 'status')
          .addSelect('COUNT(*)', 'count')
          .groupBy('order.status')
          .getRawMany(),
        // A4.2: total discount given
        rangeQb()
          .select('SUM(order.discount)', 'total')
          .getRawOne(),
        // A4.3: loyalty stamps issued
        this.stampRepo
          .createQueryBuilder('stamp')
          .select('SUM(stamp.stampCount)', 'total')
          .getRawOne(),
        // Distinct customer count
        this.orderRepo
          .createQueryBuilder('order')
          .select('COUNT(DISTINCT order.userId)', 'count')
          .getRawOne(),
        // Recent 5 orders
        this.orderRepo.find({
          relations: ['user'],
          order: { createdAt: 'DESC' },
          take: 5,
        }),
        // Top 5 selling items
        this.orderItemRepo
          .createQueryBuilder('oi')
          .select('oi.itemId', 'itemId')
          .addSelect('oi.itemName', 'itemName')
          .addSelect('SUM(oi.quantity)', 'totalQty')
          .addSelect('SUM(oi.totalPrice)', 'totalRevenue')
          .groupBy('oi.itemId')
          .addGroupBy('oi.itemName')
          .orderBy('SUM(oi.quantity)', 'DESC')
          .limit(5)
          .getRawMany(),
      ]);

    const byStatus: Record<string, number> = {};
    for (const row of statusBreakdown) byStatus[row.status] = parseInt(row.count, 10);

    return {
      totalOrders,
      todayOrders,
      totalRevenue: totalRevenue?.total || 0,
      pendingOrders,
      totalCustomers: parseInt(totalCustomers?.count || '0', 10),
      ordersByStatus: byStatus,
      totalDiscount: totalDiscount?.total || 0,
      loyaltyStampsIssued: totalStamps?.total || 0,
      recentOrders,
      topSellingItems: topItems,
    };
  }

  async cancelOrder(userId: string, orderId: string, reason?: string) {
    const order = await this.findOne(orderId);

    if (order.userId && userId !== 'guest' && order.userId !== userId) {
      throw new BadRequestException('You can only cancel your own orders');
    }
    const cancellableStatuses = [OrderStatus.PENDING, OrderStatus.ACCEPTED];
    if (!cancellableStatuses.includes(order.status as OrderStatus)) {
      throw new BadRequestException(`Cannot cancel order in status: ${order.status}`);
    }

    await this.orderRepo.update(orderId, {
      status: OrderStatus.CANCELED,
      cancellationReason: reason,
    });

    // Refund to wallet if the order was already paid
    if (order.paymentStatus === PaymentStatus.PAID) {
      await this.userRepo.increment({ id: userId }, 'balance', Number(order.total));
    }

    this.eventsService.emit({ type: 'order:updated', orderId, status: OrderStatus.CANCELED, branchId: order.branchId });
    return this.findOne(orderId);
  }

  async assignDeliveryBoy(orderId: string, deliveryBoyId: string) {
    const order = await this.findOne(orderId);
    const deliveryBoy = await this.userRepo.findOne({ where: { id: deliveryBoyId } });
    if (!deliveryBoy) throw new NotFoundException('Delivery boy not found');
    await this.orderRepo.update(orderId, {
      deliveryBoyId,
      status: OrderStatus.OUT_FOR_DELIVERY,
    } as any);
    return this.findOne(orderId);
  }

  async getOrdersByDeliveryBoy(deliveryBoyId: string, page = 1, limit = 20) {
    const [data, total] = await this.orderRepo.findAndCount({
      where: { deliveryBoyId } as any,
      relations: ['items', 'user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getOssPopularItems(branchId?: string, limit = 6) {
    const qb = this.orderItemRepo
      .createQueryBuilder('oi')
      .innerJoin('oi.order', 'order')
      .select('oi.itemId', 'itemId')
      .addSelect('oi.itemName', 'itemName')
      .addSelect('oi.itemImage', 'itemImage')
      .addSelect('SUM(oi.quantity)', 'totalQty')
      .groupBy('oi.itemId')
      .addGroupBy('oi.itemName')
      .addGroupBy('oi.itemImage')
      .orderBy('SUM(oi.quantity)', 'DESC')
      .limit(limit);

    if (branchId) qb.andWhere('order.branchId = :branchId', { branchId });
    return qb.getRawMany();
  }

  async getStaffDashboard(staffId: string) {
    const [assignedOrders, totalHandled] = await Promise.all([
      this.orderRepo.find({
        where: { staffId } as any,
        relations: ['items', 'diningTable'],
        order: { createdAt: 'DESC' },
        take: 20,
      }),
      this.orderRepo.count({ where: { staffId } as any }),
    ]);

    const pendingCount = assignedOrders.filter((o) => o.status === OrderStatus.PENDING).length;
    const preparingCount = assignedOrders.filter((o) => o.status === OrderStatus.PREPARING).length;
    const preparedCount = assignedOrders.filter((o) => o.status === OrderStatus.PREPARED).length;

    return { assignedOrders, totalHandled, pendingCount, preparingCount, preparedCount };
  }

  posChangeCalc(total: number, received: number): { change: number; sufficient: boolean } {
    const change = received - total;
    return { change: Math.max(0, change), sufficient: received >= total };
  }

  async changeOrderStaff(orderId: string, staffId: string) {
    await this.findOne(orderId);
    const staff = await this.userRepo.findOne({ where: { id: staffId } });
    if (!staff) throw new NotFoundException('Staff member not found');
    await this.orderRepo.update(orderId, { staffId } as any);
    return this.findOne(orderId);
  }

  async changePaymentStatus(orderId: string, paymentStatus: PaymentStatus) {
    await this.findOne(orderId);
    await this.orderRepo.update(orderId, { paymentStatus });
    return this.findOne(orderId);
  }

  async exportTableOrdersExcel(res: any) {
    const orders = await this.orderRepo.find({
      where: { orderType: OrderType.DINING_TABLE as any },
      relations: ['user', 'diningTable', 'items'],
      order: { createdAt: 'DESC' },
    });

    const rows = orders.map((o) => [
      o.orderSerialNo,
      o.diningTable?.name || '',
      o.user?.name || 'Guest',
      o.status,
      o.paymentStatus,
      o.paymentMethod,
      Number(o.total).toFixed(2),
      o.createdAt?.toISOString().split('T')[0] || '',
    ]);

    const headers = ['Order #', 'Table', 'Customer', 'Status', 'Payment Status', 'Payment Method', 'Total', 'Date'];
    const ths = headers.map((h) => `<th style="background:#f97316;color:white;padding:6px 10px;border:1px solid #ddd">${h}</th>`).join('');
    const trs = rows.map((r) => `<tr>${r.map((c) => `<td style="padding:5px 10px;border:1px solid #ddd">${c}</td>`).join('')}</tr>`).join('');
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><h2>Dine-In Orders</h2><table border="1"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></body></html>`;

    res.set({ 'Content-Type': 'application/vnd.ms-excel', 'Content-Disposition': 'attachment; filename="dining-table-orders.xls"' });
    res.send(html);
  }

  async getStaffDashboardWithKds(staffId: string) {
    const base = await this.getStaffDashboard(staffId);

    const kdsOrders = await this.orderRepo.find({
      where: { status: OrderStatus.ACCEPTED as any },
      relations: ['items', 'items.item', 'diningTable'],
      order: { createdAt: 'ASC' },
      take: 30,
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayOrderCount, todayRevenue] = await Promise.all([
      this.orderRepo.count({ where: { staffId, createdAt: today } as any }),
      this.orderRepo
        .createQueryBuilder('order')
        .where('order.staffId = :staffId', { staffId })
        .andWhere('order.createdAt BETWEEN :start AND :end', { start: today, end: tomorrow })
        .andWhere('order.paymentStatus = :ps', { ps: PaymentStatus.PAID })
        .select('SUM(order.total)', 'total')
        .getRawOne(),
    ]);

    const completedOrders = base.assignedOrders.filter((o) =>
      [OrderStatus.PREPARED, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED].includes(o.status),
    );
    const completedCount = completedOrders.length;
    const avgOrderTimeMinutes = completedOrders.length
      ? Math.round(
          completedOrders.reduce(
            (sum, o) => sum + (new Date(o.updatedAt).getTime() - new Date(o.createdAt).getTime()) / 60000,
            0,
          ) / completedOrders.length,
        )
      : 0;
    const cancelledCount = base.assignedOrders.filter((o) =>
      [OrderStatus.CANCELED, OrderStatus.REJECTED, OrderStatus.RETURNED].includes(o.status),
    ).length;
    const efficiencyScore = base.assignedOrders.length
      ? Math.round((completedCount / (completedCount + cancelledCount || 1)) * 100)
      : 100;

    return {
      ...base,
      kdsOrders,
      todayStats: {
        orderCount: todayOrderCount,
        revenue: parseFloat(todayRevenue?.total || '0'),
      },
      analytics: {
        efficiencyScore,
        avgOrderTimeMinutes,
        completedCount,
      },
    };
  }
}
