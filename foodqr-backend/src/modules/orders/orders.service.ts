import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
import { TimeSlotsService } from '../time-slots/time-slots.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { OrderStatus, OrderType, PaymentStatus } from '../../common/enums';

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
    private timeSlotsService: TimeSlotsService,
  ) {}

  private async getSetting(key: string, defaultValue = '0'): Promise<string> {
    const s = await this.settingRepo.findOne({ where: { key } });
    return s?.value ?? defaultValue;
  }

  private async calculateDeliveryCharge(distanceKm?: number): Promise<number> {
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
          sourceId: orderId,
          stampCount: stamps,
          metadata: { source: 'order', orderId },
        } as any),
      );
    }
  }

  async create(userId: string, dto: CreateOrderDto) {
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
      deliveryCharge = await this.calculateDeliveryCharge(dto.deliveryDistanceKm);
    }

    let discount = dto.discount || 0;
    if (dto.couponCode) {
      const result = await this.applyOffer(dto.couponCode, subtotal, itemIds);
      discount = result.discount;
    }

    const total = Math.max(0, subtotal + totalTax + deliveryCharge - discount);

    const order = this.orderRepo.create({
      orderSerialNo: 'ORD-' + Date.now().toString().slice(-8),
      token: uuidv4().split('-')[0].toUpperCase(),
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

    await this.orderItemRepo.save(
      orderItems.map((oi) => this.orderItemRepo.create({ ...oi, orderId: savedOrder.id })),
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

    await this.awardLoyaltyStamps(userId, savedOrder.id, total);

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
    await this.findOne(id);
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

  posChangeCalc(total: number, received: number): { change: number; sufficient: boolean } {
    const change = received - total;
    return { change: Math.max(0, change), sufficient: received >= total };
  }
}
