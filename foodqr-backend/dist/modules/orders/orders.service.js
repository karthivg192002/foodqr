"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const order_entity_1 = require("./entities/order.entity");
const order_item_entity_1 = require("./entities/order-item.entity");
const order_address_entity_1 = require("./entities/order-address.entity");
const item_entity_1 = require("../menu/items/entities/item.entity");
const item_variation_entity_1 = require("../menu/variations/entities/item-variation.entity");
const user_entity_1 = require("../users/entities/user.entity");
const offer_entity_1 = require("../offers/entities/offer.entity");
const offer_item_entity_1 = require("../offers/entities/offer-item.entity");
const app_setting_entity_1 = require("../settings/entities/app-setting.entity");
const loyalty_stamp_entity_1 = require("../loyalty/entities/loyalty-stamp.entity");
const loyalty_program_entity_1 = require("../loyalty/entities/loyalty-program.entity");
const time_slots_service_1 = require("../time-slots/time-slots.service");
const notifications_service_1 = require("../notifications/notifications.service");
const events_service_1 = require("../events/events.service");
const delivery_zones_service_1 = require("../delivery-zones/delivery-zones.service");
const enums_1 = require("../../common/enums");
const tenant_connection_service_1 = require("../tenants/connection/tenant-connection.service");
const tenant_aware_repo_1 = require("../tenants/connection/tenant-aware-repo");
let OrdersService = class OrdersService {
    constructor(orderRepo, orderItemRepo, orderAddressRepo, itemRepo, variationRepo, userRepo, offerRepo, offerItemRepo, settingRepo, stampRepo, loyaltyProgramRepo, timeSlotsService, notificationsService, eventsService, deliveryZonesService, connections) {
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
        this.orderAddressRepo = orderAddressRepo;
        this.itemRepo = itemRepo;
        this.variationRepo = variationRepo;
        this.userRepo = userRepo;
        this.offerRepo = offerRepo;
        this.offerItemRepo = offerItemRepo;
        this.settingRepo = settingRepo;
        this.stampRepo = stampRepo;
        this.loyaltyProgramRepo = loyaltyProgramRepo;
        this.timeSlotsService = timeSlotsService;
        this.notificationsService = notificationsService;
        this.eventsService = eventsService;
        this.deliveryZonesService = deliveryZonesService;
        this.orderRepo = (0, tenant_aware_repo_1.tenantAwareRepo)(connections, order_entity_1.Order, orderRepo);
        this.orderItemRepo = (0, tenant_aware_repo_1.tenantAwareRepo)(connections, order_item_entity_1.OrderItem, orderItemRepo);
        this.orderAddressRepo = (0, tenant_aware_repo_1.tenantAwareRepo)(connections, order_address_entity_1.OrderAddress, orderAddressRepo);
        this.itemRepo = (0, tenant_aware_repo_1.tenantAwareRepo)(connections, item_entity_1.Item, itemRepo);
        this.variationRepo = (0, tenant_aware_repo_1.tenantAwareRepo)(connections, item_variation_entity_1.ItemVariation, variationRepo);
        this.userRepo = (0, tenant_aware_repo_1.tenantAwareRepo)(connections, user_entity_1.User, userRepo);
        this.offerRepo = (0, tenant_aware_repo_1.tenantAwareRepo)(connections, offer_entity_1.Offer, offerRepo);
        this.offerItemRepo = (0, tenant_aware_repo_1.tenantAwareRepo)(connections, offer_item_entity_1.OfferItem, offerItemRepo);
        this.settingRepo = (0, tenant_aware_repo_1.tenantAwareRepo)(connections, app_setting_entity_1.AppSetting, settingRepo);
        this.stampRepo = (0, tenant_aware_repo_1.tenantAwareRepo)(connections, loyalty_stamp_entity_1.LoyaltyStamp, stampRepo);
        this.loyaltyProgramRepo = (0, tenant_aware_repo_1.tenantAwareRepo)(connections, loyalty_program_entity_1.LoyaltyProgram, loyaltyProgramRepo);
    }
    async getSetting(key, defaultValue = '0') {
        const s = await this.settingRepo.findOne({ where: { key } });
        return s?.value ?? defaultValue;
    }
    async calculateDeliveryCharge(distanceKm, destLat, destLng, branchId) {
        if (this.deliveryZonesService && destLat != null && destLng != null) {
            const zone = await this.deliveryZonesService.findZoneForPoint(destLat, destLng, branchId);
            if (zone) {
                const km = distanceKm ?? 0;
                return Number(zone.baseCharge) + km * Number(zone.perKmCharge);
            }
        }
        const [freeKm, basicCharge, perKmCharge] = await Promise.all([
            this.getSetting('delivery_free_km', '0'),
            this.getSetting('delivery_basic_charge', '0'),
            this.getSetting('delivery_per_km_charge', '0'),
        ]);
        const freeKmNum = parseFloat(freeKm);
        const basicChargeNum = parseFloat(basicCharge);
        const perKmNum = parseFloat(perKmCharge);
        if (!distanceKm || distanceKm <= freeKmNum)
            return basicChargeNum;
        return basicChargeNum + (distanceKm - freeKmNum) * perKmNum;
    }
    async applyOffer(couponCode, subtotal, itemIds) {
        const offer = await this.offerRepo.findOne({ where: { slug: couponCode, status: true } });
        if (!offer)
            return { discount: 0, offerId: null };
        const now = new Date();
        if (offer.startDate && offer.startDate > now)
            return { discount: 0, offerId: null };
        if (offer.endDate && offer.endDate < now)
            return { discount: 0, offerId: null };
        if (offer.minOrderAmount && subtotal < Number(offer.minOrderAmount))
            return { discount: 0, offerId: null };
        const offerItems = await this.offerItemRepo.find({ where: { offerId: offer.id } });
        if (offerItems.length > 0) {
            const qualifiedIds = new Set(offerItems.map((oi) => oi.itemId));
            if (!itemIds.some((id) => qualifiedIds.has(id)))
                return { discount: 0, offerId: null };
        }
        let discount = offer.discountType === 'percentage'
            ? (subtotal * Number(offer.discountAmount)) / 100
            : Number(offer.discountAmount);
        if (offer.maxDiscount && discount > Number(offer.maxDiscount)) {
            discount = Number(offer.maxDiscount);
        }
        return { discount: Math.min(discount, subtotal), offerId: offer.id };
    }
    async awardLoyaltyStamps(userId, orderId, orderAmount) {
        const program = await this.loyaltyProgramRepo.findOne({ where: { isActive: true } });
        if (!program)
            return;
        const [minAmountStr, stampsPerOrderStr, stampsPerAmountStr, thresholdStr] = await Promise.all([
            this.getSetting('loyalty_min_order_amount', '0'),
            this.getSetting('loyalty_stamps_per_order', '1'),
            this.getSetting('loyalty_stamps_per_amount', '0'),
            this.getSetting('loyalty_amount_threshold', '100'),
        ]);
        if (orderAmount < parseFloat(minAmountStr))
            return;
        let stamps = parseInt(stampsPerOrderStr, 10) || 1;
        const stampsPerAmount = parseInt(stampsPerAmountStr, 10);
        const threshold = parseFloat(thresholdStr) || 100;
        if (stampsPerAmount > 0 && threshold > 0) {
            stamps += Math.floor(orderAmount / threshold) * stampsPerAmount;
        }
        if (stamps > 0) {
            await this.stampRepo.save(this.stampRepo.create({
                userId,
                orderId,
                sourceId: orderId,
                loyaltyProgramId: program.id,
                stampCount: stamps,
                metadata: { source: 'order', orderId },
            }));
        }
    }
    async create(userId, dto) {
        const resolvedUserId = (userId === 'guest' || !userId) ? null : userId;
        const orderItems = [];
        let subtotal = 0;
        let totalTax = 0;
        const itemIds = [];
        for (const orderItemDto of dto.items) {
            const item = await this.itemRepo.findOne({ where: { id: orderItemDto.itemId } });
            if (!item)
                throw new common_1.NotFoundException(`Item ${orderItemDto.itemId} not found`);
            const basePrice = Number(item.price);
            let unitPrice = basePrice;
            let variationName = null;
            let variationSnapshot = [];
            if (orderItemDto.variationId) {
                const variation = await this.variationRepo.findOne({ where: { id: orderItemDto.variationId } });
                if (variation) {
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
            const extrasTotal = (orderItemDto.extras || []).reduce((sum, e) => sum + Number(e.price || 0), 0);
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
        if (dto.isAdvanceOrder && dto.scheduledAt && dto.branchId) {
            const slots = await this.timeSlotsService.findByBranch(dto.branchId);
            if (slots.length > 0 && !this.timeSlotsService.isWithinSlot(slots, new Date(dto.scheduledAt))) {
                throw new common_1.BadRequestException('Scheduled time is outside branch operating hours');
            }
        }
        let deliveryCharge = 0;
        if (dto.orderType === enums_1.OrderType.DELIVERY) {
            const snap = dto.deliveryAddressSnapshot;
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
            || (![enums_1.PaymentMethod.CASH_ON_DELIVERY, enums_1.PaymentMethod.E_WALLET].includes(dto.paymentMethod)
                ? dto.paymentMethod
                : null);
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const tokenResult = await this.orderRepo
            .createQueryBuilder('o')
            .select('MAX(o.dailyToken)', 'max')
            .where('o.createdAt >= :start', { start: todayStart })
            .getRawOne();
        const dailyToken = (tokenResult?.max ?? 0) + 1;
        const order = this.orderRepo.create({
            orderSerialNo: 'ORD-' + Date.now().toString().slice(-8),
            token: (0, uuid_1.v4)().split('-')[0].toUpperCase(),
            dailyToken,
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
        await this.orderItemRepo.save(orderItems.map((oi) => this.orderItemRepo.create({ ...oi, orderId: savedOrder.id, branchId: dto.branchId })));
        if (dto.orderType === enums_1.OrderType.DELIVERY && dto.deliveryAddressSnapshot) {
            const snap = dto.deliveryAddressSnapshot;
            await this.orderAddressRepo.save(this.orderAddressRepo.create({
                orderId: savedOrder.id,
                userId,
                label: snap.label || 'Home',
                address: snap.address || '',
                apartment: snap.apartment,
                latitude: snap.latitude,
                longitude: snap.longitude,
            }));
        }
        if (resolvedUserId)
            await this.awardLoyaltyStamps(resolvedUserId, savedOrder.id, total);
        this.notificationsService
            .broadcastToAll('New Order', `Order #${savedOrder.orderSerialNo} has been placed`)
            .catch(() => null);
        this.eventsService.emit({ type: 'order:created', orderId: savedOrder.id, status: enums_1.OrderStatus.PENDING, branchId: savedOrder.branchId });
        return this.findOne(savedOrder.id);
    }
    async findAll(filters = {}) {
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
        if (rest.status)
            qb.andWhere('order.status = :status', { status: rest.status });
        if (rest.orderType)
            qb.andWhere('order.orderType = :orderType', { orderType: rest.orderType });
        if (rest.userId)
            qb.andWhere('order.userId = :userId', { userId: rest.userId });
        if (rest.diningTableId)
            qb.andWhere('order.diningTableId = :diningTableId', { diningTableId: rest.diningTableId });
        if (rest.search)
            qb.andWhere('order.orderSerialNo ILIKE :search', { search: `%${rest.search}%` });
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit, pages: Math.ceil(total / limit) };
    }
    async findOne(id) {
        const order = await this.orderRepo.findOne({
            where: { id },
            relations: ['user', 'items', 'items.item', 'diningTable', 'branch', 'staff'],
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async findByToken(token) {
        const order = await this.orderRepo.findOne({
            where: { token },
            relations: ['items', 'items.item', 'diningTable'],
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async updateStatus(id, dto) {
        const order = await this.findOne(id);
        await this.orderRepo.update(id, {
            status: dto.status,
            cancellationReason: dto.cancellationReason,
            staffId: dto.staffId,
        });
        if (order.userId) {
            this.notificationsService
                .sendOrderNotification(order.userId, order.orderSerialNo, dto.status)
                .catch(() => null);
        }
        this.eventsService.emit({ type: 'order:updated', orderId: id, status: dto.status, branchId: order.branchId });
        return this.findOne(id);
    }
    async updatePaymentStatus(id, transactionId) {
        await this.orderRepo.update(id, {
            paymentStatus: enums_1.PaymentStatus.PAID,
            paymentTransactionId: transactionId,
        });
        return this.findOne(id);
    }
    async getCustomerOrders(userId, page = 1, limit = 10) {
        return this.findAll({ userId, page, limit });
    }
    async getKdsOrders(branchId) {
        const qb = this.orderRepo.createQueryBuilder('order')
            .leftJoinAndSelect('order.items', 'items')
            .leftJoinAndSelect('items.item', 'item')
            .leftJoinAndSelect('order.diningTable', 'diningTable')
            .where('order.status IN (:...statuses)', {
            statuses: [enums_1.OrderStatus.ACCEPTED, enums_1.OrderStatus.PREPARING],
        })
            .orderBy('order.createdAt', 'ASC');
        if (branchId)
            qb.andWhere('order.branchId = :branchId', { branchId });
        return qb.getMany();
    }
    async getDashboardStats(startDate, endDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const rangeQb = () => {
            const qb = this.orderRepo.createQueryBuilder('order');
            if (startDate)
                qb.andWhere('order.createdAt >= :start', { start: new Date(startDate) });
            if (endDate)
                qb.andWhere('order.createdAt <= :end', { end: new Date(endDate) });
            return qb;
        };
        const [totalOrders, todayOrders, totalRevenue, pendingOrders, statusBreakdown, totalDiscount, totalStamps, totalCustomers, recentOrders, topItems] = await Promise.all([
            this.orderRepo.count(),
            this.orderRepo.count({ where: { createdAt: today } }),
            this.orderRepo
                .createQueryBuilder('order')
                .where('order.paymentStatus = :status', { status: enums_1.PaymentStatus.PAID })
                .select('SUM(order.total)', 'total')
                .getRawOne(),
            this.orderRepo.count({ where: { status: enums_1.OrderStatus.PENDING } }),
            rangeQb()
                .select('order.status', 'status')
                .addSelect('COUNT(*)', 'count')
                .groupBy('order.status')
                .getRawMany(),
            rangeQb()
                .select('SUM(order.discount)', 'total')
                .getRawOne(),
            this.stampRepo
                .createQueryBuilder('stamp')
                .select('SUM(stamp.stampCount)', 'total')
                .getRawOne(),
            this.orderRepo
                .createQueryBuilder('order')
                .select('COUNT(DISTINCT order.userId)', 'count')
                .getRawOne(),
            this.orderRepo.find({
                relations: ['user'],
                order: { createdAt: 'DESC' },
                take: 5,
            }),
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
        const byStatus = {};
        for (const row of statusBreakdown)
            byStatus[row.status] = parseInt(row.count, 10);
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
    async cancelOrder(userId, orderId, reason) {
        const order = await this.findOne(orderId);
        if (order.userId && userId !== 'guest' && order.userId !== userId) {
            throw new common_1.BadRequestException('You can only cancel your own orders');
        }
        const cancellableStatuses = [enums_1.OrderStatus.PENDING, enums_1.OrderStatus.ACCEPTED];
        if (!cancellableStatuses.includes(order.status)) {
            throw new common_1.BadRequestException(`Cannot cancel order in status: ${order.status}`);
        }
        await this.orderRepo.update(orderId, {
            status: enums_1.OrderStatus.CANCELED,
            cancellationReason: reason,
        });
        if (order.paymentStatus === enums_1.PaymentStatus.PAID) {
            await this.userRepo.increment({ id: userId }, 'balance', Number(order.total));
        }
        this.eventsService.emit({ type: 'order:updated', orderId, status: enums_1.OrderStatus.CANCELED, branchId: order.branchId });
        return this.findOne(orderId);
    }
    async assignDeliveryBoy(orderId, deliveryBoyId) {
        const order = await this.findOne(orderId);
        const deliveryBoy = await this.userRepo.findOne({ where: { id: deliveryBoyId } });
        if (!deliveryBoy)
            throw new common_1.NotFoundException('Delivery boy not found');
        await this.orderRepo.update(orderId, {
            deliveryBoyId,
            status: enums_1.OrderStatus.OUT_FOR_DELIVERY,
        });
        return this.findOne(orderId);
    }
    async getOrdersByDeliveryBoy(deliveryBoyId, page = 1, limit = 20) {
        const [data, total] = await this.orderRepo.findAndCount({
            where: { deliveryBoyId },
            relations: ['items', 'user'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total, page, limit, pages: Math.ceil(total / limit) };
    }
    async getOssPopularItems(branchId, limit = 6) {
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
        if (branchId)
            qb.andWhere('order.branchId = :branchId', { branchId });
        return qb.getRawMany();
    }
    async getStaffDashboard(staffId) {
        const [assignedOrders, totalHandled] = await Promise.all([
            this.orderRepo.find({
                where: { staffId },
                relations: ['items', 'diningTable'],
                order: { createdAt: 'DESC' },
                take: 20,
            }),
            this.orderRepo.count({ where: { staffId } }),
        ]);
        const pendingCount = assignedOrders.filter((o) => o.status === enums_1.OrderStatus.PENDING).length;
        const preparingCount = assignedOrders.filter((o) => o.status === enums_1.OrderStatus.PREPARING).length;
        const preparedCount = assignedOrders.filter((o) => o.status === enums_1.OrderStatus.PREPARED).length;
        return { assignedOrders, totalHandled, pendingCount, preparingCount, preparedCount };
    }
    posChangeCalc(total, received) {
        const change = received - total;
        return { change: Math.max(0, change), sufficient: received >= total };
    }
    async changeOrderStaff(orderId, staffId) {
        await this.findOne(orderId);
        const staff = await this.userRepo.findOne({ where: { id: staffId } });
        if (!staff)
            throw new common_1.NotFoundException('Staff member not found');
        await this.orderRepo.update(orderId, { staffId });
        return this.findOne(orderId);
    }
    async changePaymentStatus(orderId, paymentStatus) {
        await this.findOne(orderId);
        await this.orderRepo.update(orderId, { paymentStatus });
        return this.findOne(orderId);
    }
    async exportTableOrdersExcel(res) {
        const orders = await this.orderRepo.find({
            where: { orderType: enums_1.OrderType.DINING_TABLE },
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
    async getStaffDashboardWithKds(staffId) {
        const base = await this.getStaffDashboard(staffId);
        const kdsOrders = await this.orderRepo.find({
            where: { status: enums_1.OrderStatus.ACCEPTED },
            relations: ['items', 'items.item', 'diningTable'],
            order: { createdAt: 'ASC' },
            take: 30,
        });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [todayOrderCount, todayRevenue] = await Promise.all([
            this.orderRepo.count({ where: { staffId, createdAt: today } }),
            this.orderRepo
                .createQueryBuilder('order')
                .where('order.staffId = :staffId', { staffId })
                .andWhere('order.createdAt BETWEEN :start AND :end', { start: today, end: tomorrow })
                .andWhere('order.paymentStatus = :ps', { ps: enums_1.PaymentStatus.PAID })
                .select('SUM(order.total)', 'total')
                .getRawOne(),
        ]);
        const completedOrders = base.assignedOrders.filter((o) => [enums_1.OrderStatus.PREPARED, enums_1.OrderStatus.OUT_FOR_DELIVERY, enums_1.OrderStatus.DELIVERED].includes(o.status));
        const completedCount = completedOrders.length;
        const avgOrderTimeMinutes = completedOrders.length
            ? Math.round(completedOrders.reduce((sum, o) => sum + (new Date(o.updatedAt).getTime() - new Date(o.createdAt).getTime()) / 60000, 0) / completedOrders.length)
            : 0;
        const cancelledCount = base.assignedOrders.filter((o) => [enums_1.OrderStatus.CANCELED, enums_1.OrderStatus.REJECTED, enums_1.OrderStatus.RETURNED].includes(o.status)).length;
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
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __param(2, (0, typeorm_1.InjectRepository)(order_address_entity_1.OrderAddress)),
    __param(3, (0, typeorm_1.InjectRepository)(item_entity_1.Item)),
    __param(4, (0, typeorm_1.InjectRepository)(item_variation_entity_1.ItemVariation)),
    __param(5, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(6, (0, typeorm_1.InjectRepository)(offer_entity_1.Offer)),
    __param(7, (0, typeorm_1.InjectRepository)(offer_item_entity_1.OfferItem)),
    __param(8, (0, typeorm_1.InjectRepository)(app_setting_entity_1.AppSetting)),
    __param(9, (0, typeorm_1.InjectRepository)(loyalty_stamp_entity_1.LoyaltyStamp)),
    __param(10, (0, typeorm_1.InjectRepository)(loyalty_program_entity_1.LoyaltyProgram)),
    __param(14, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        time_slots_service_1.TimeSlotsService,
        notifications_service_1.NotificationsService,
        events_service_1.EventsService,
        delivery_zones_service_1.DeliveryZonesService,
        tenant_connection_service_1.TenantConnectionService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map