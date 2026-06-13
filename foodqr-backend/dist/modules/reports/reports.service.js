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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../orders/entities/order.entity");
const order_item_entity_1 = require("../orders/entities/order-item.entity");
const user_entity_1 = require("../users/entities/user.entity");
const item_entity_1 = require("../menu/items/entities/item.entity");
const dining_table_entity_1 = require("../dining-tables/entities/dining-table.entity");
const transaction_entity_1 = require("../payments/entities/transaction.entity");
const enums_1 = require("../../common/enums");
let ReportsService = class ReportsService {
    constructor(orderRepo, orderItemRepo, userRepo, itemRepo, tableRepo, transactionRepo) {
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
        this.userRepo = userRepo;
        this.itemRepo = itemRepo;
        this.tableRepo = tableRepo;
        this.transactionRepo = transactionRepo;
    }
    async getDashboardSummary() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const [totalOrders, todayOrders, totalCustomers, totalItems, totalTables, totalRevenue, todayRevenue, monthRevenue, pendingOrders, deliveredOrders,] = await Promise.all([
            this.orderRepo.count(),
            this.orderRepo.count({ where: { createdAt: (0, typeorm_2.Between)(today, tomorrow) } }),
            this.userRepo.count({ where: { role: enums_1.UserRole.CUSTOMER } }),
            this.itemRepo.count({ where: { status: true } }),
            this.tableRepo.count(),
            this.transactionRepo.createQueryBuilder('tx').where('tx.status = :s', { s: enums_1.PaymentStatus.PAID }).select('SUM(tx.amount)', 'total').getRawOne(),
            this.transactionRepo.createQueryBuilder('tx').where('tx.status = :s', { s: enums_1.PaymentStatus.PAID }).andWhere('tx.createdAt BETWEEN :start AND :end', { start: today, end: tomorrow }).select('SUM(tx.amount)', 'total').getRawOne(),
            this.transactionRepo.createQueryBuilder('tx').where('tx.status = :s', { s: enums_1.PaymentStatus.PAID }).andWhere('tx.createdAt >= :start', { start: monthStart }).select('SUM(tx.amount)', 'total').getRawOne(),
            this.orderRepo.count({ where: { status: enums_1.OrderStatus.PENDING } }),
            this.orderRepo.count({ where: { status: enums_1.OrderStatus.DELIVERED } }),
        ]);
        return {
            totalOrders, todayOrders, totalCustomers, totalItems, totalTables,
            totalRevenue: parseFloat(totalRevenue?.total || '0'),
            todayRevenue: parseFloat(todayRevenue?.total || '0'),
            monthRevenue: parseFloat(monthRevenue?.total || '0'),
            pendingOrders, deliveredOrders,
        };
    }
    async getSalesReport(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        const data = await this.orderRepo
            .createQueryBuilder('order')
            .where('order.createdAt BETWEEN :start AND :end', { start, end })
            .andWhere('order.paymentStatus = :status', { status: enums_1.PaymentStatus.PAID })
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
    async getTopItems(limit = 10, startDate, endDate) {
        const qb = this.orderItemRepo
            .createQueryBuilder('oi')
            .leftJoinAndSelect('oi.item', 'item')
            .leftJoin('oi.order', 'order')
            .select(['item.id', 'item.name', 'item.thumbImage', 'SUM(oi.quantity) as totalQuantity', 'SUM(oi.subtotal) as totalRevenue'])
            .where('order.status != :status', { status: enums_1.OrderStatus.CANCELED })
            .groupBy('item.id, item.name, item.thumbImage')
            .orderBy('totalQuantity', 'DESC')
            .take(limit);
        if (startDate)
            qb.andWhere('order.createdAt >= :start', { start: new Date(startDate) });
        if (endDate)
            qb.andWhere('order.createdAt <= :end', { end: new Date(endDate) });
        return qb.getRawMany();
    }
    async getRevenueByOrderType(startDate, endDate) {
        const qb = this.orderRepo
            .createQueryBuilder('order')
            .where('order.paymentStatus = :status', { status: enums_1.PaymentStatus.PAID })
            .select(['order.orderType as type', 'COUNT(order.id) as count', 'SUM(order.total) as revenue'])
            .groupBy('order.orderType');
        if (startDate)
            qb.andWhere('order.createdAt >= :start', { start: new Date(startDate) });
        if (endDate)
            qb.andWhere('order.createdAt <= :end', { end: new Date(endDate) });
        return qb.getRawMany();
    }
    async getCreditBalanceReport(startDate, endDate) {
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
        if (startDate)
            qb.andWhere('tx.createdAt >= :start', { start: new Date(startDate) });
        if (endDate)
            qb.andWhere('tx.createdAt <= :end', { end: new Date(endDate) });
        return qb.getRawMany();
    }
    async getItemsReport(startDate, endDate, categoryId) {
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
            .where('order.status != :status', { status: enums_1.OrderStatus.CANCELED })
            .groupBy('item.id, item.name, item.thumbImage, category.name')
            .orderBy('totalQuantity', 'DESC');
        if (startDate)
            qb.andWhere('order.createdAt >= :start', { start: new Date(startDate) });
        if (endDate)
            qb.andWhere('order.createdAt <= :end', { end: new Date(endDate) });
        if (categoryId)
            qb.andWhere('item.categoryId = :categoryId', { categoryId });
        return qb.getRawMany();
    }
    async getAnalyticsSummary(startDate, endDate) {
        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999);
        const [salesByDay, revenueByType, topItems, newCustomers] = await Promise.all([
            this.orderRepo.createQueryBuilder('o')
                .where('o.createdAt BETWEEN :start AND :end', { start, end })
                .andWhere('o.paymentStatus = :ps', { ps: enums_1.PaymentStatus.PAID })
                .select(["DATE_TRUNC('day', o.createdAt) as day", 'COUNT(o.id) as orders', 'SUM(o.total) as revenue'])
                .groupBy("DATE_TRUNC('day', o.createdAt)")
                .orderBy('day', 'ASC')
                .getRawMany(),
            this.getRevenueByOrderType(startDate, endDate),
            this.getTopItems(5, startDate, endDate),
            this.userRepo.count({
                where: { role: enums_1.UserRole.CUSTOMER, createdAt: (0, typeorm_2.Between)(start, end) },
            }),
        ]);
        return { salesByDay, revenueByType, topItems, newCustomers };
    }
    async getCustomerStats() {
        const [total, newThisMonth, topCustomers] = await Promise.all([
            this.userRepo.count({ where: { role: enums_1.UserRole.CUSTOMER } }),
            this.userRepo.count({
                where: {
                    role: enums_1.UserRole.CUSTOMER,
                    createdAt: (0, typeorm_2.Between)(new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date()),
                },
            }),
            this.orderRepo
                .createQueryBuilder('order')
                .leftJoinAndSelect('order.user', 'user')
                .where('order.paymentStatus = :status', { status: enums_1.PaymentStatus.PAID })
                .select(['user.id', 'user.name', 'user.email', 'COUNT(order.id) as orderCount', 'SUM(order.total) as totalSpent'])
                .groupBy('user.id, user.name, user.email')
                .orderBy('totalSpent', 'DESC')
                .take(10)
                .getRawMany(),
        ]);
        return { total, newThisMonth, topCustomers };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(item_entity_1.Item)),
    __param(4, (0, typeorm_1.InjectRepository)(dining_table_entity_1.DiningTable)),
    __param(5, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map