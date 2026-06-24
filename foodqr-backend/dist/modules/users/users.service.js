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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcryptjs");
const user_entity_1 = require("./entities/user.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const address_entity_1 = require("../addresses/entities/address.entity");
const tenant_user_index_entity_1 = require("../tenants/entities/tenant-user-index.entity");
const tenant_connection_service_1 = require("../tenants/connection/tenant-connection.service");
const tenant_aware_repo_1 = require("../tenants/connection/tenant-aware-repo");
const tenants_service_1 = require("../tenants/tenants.service");
const enums_1 = require("../../common/enums");
let UsersService = class UsersService {
    constructor(userRepo, orderRepo, addressRepo, tenantUserIndexRepo, connections, tenantsService) {
        this.userRepo = userRepo;
        this.orderRepo = orderRepo;
        this.addressRepo = addressRepo;
        this.tenantUserIndexRepo = tenantUserIndexRepo;
        this.connections = connections;
        this.tenantsService = tenantsService;
        this.userRepo = (0, tenant_aware_repo_1.tenantAwareRepo)(connections, user_entity_1.User, userRepo);
        this.orderRepo = (0, tenant_aware_repo_1.tenantAwareRepo)(connections, order_entity_1.Order, orderRepo);
        this.addressRepo = (0, tenant_aware_repo_1.tenantAwareRepo)(connections, address_entity_1.Address, addressRepo);
    }
    get repo() {
        return this.userRepo;
    }
    async assertWithinStaffLimit(tenantId, role) {
        if (role === enums_1.UserRole.CUSTOMER)
            return;
        const tenant = await this.tenantsService.findOne(tenantId).catch(() => null);
        const maxStaff = tenant?.plan?.maxStaff;
        if (!maxStaff || maxStaff <= 0)
            return;
        const where = { role: (0, typeorm_2.Not)(enums_1.UserRole.CUSTOMER) };
        if (!this.connections.hasTenantContext())
            where.tenantId = tenantId;
        const count = await this.repo.count({ where });
        if (count >= maxStaff) {
            throw new common_1.BadRequestException(`Staff limit reached for your plan (max ${maxStaff})`);
        }
    }
    get orders() {
        return this.orderRepo;
    }
    get addresses() {
        return this.addressRepo;
    }
    async findAll(role, search, page = 1, limit = 20, tenantId) {
        const where = {};
        if (role)
            where.role = role;
        if (search)
            where.name = (0, typeorm_2.Like)(`%${search}%`);
        if (tenantId && !this.connections.hasTenantContext())
            where.tenantId = tenantId;
        const [data, total] = await this.repo.findAndCount({
            where,
            relations: ['branch'],
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { data, total, page, limit, pages: Math.ceil(total / limit) };
    }
    async findOne(id) {
        const user = await this.repo.findOne({ where: { id }, relations: ['branch'] });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async update(id, dto) {
        await this.findOne(id);
        await this.repo.update(id, dto);
        return this.findOne(id);
    }
    async updateDeviceToken(id, dto) {
        await this.repo.update(id, dto);
        return { message: 'Device token updated' };
    }
    async remove(id) {
        await this.findOne(id);
        await this.repo.softDelete(id);
        return { message: 'User deleted' };
    }
    async getCustomers(search, page = 1, limit = 20, tenantId) {
        return this.findAll(enums_1.UserRole.CUSTOMER, search, page, limit, tenantId);
    }
    async getStaff(search, page = 1, limit = 20, tenantId) {
        const roles = [enums_1.UserRole.WAITER, enums_1.UserRole.CHEF, enums_1.UserRole.STAFF, enums_1.UserRole.POS_OPERATOR];
        const qb = this.repo.createQueryBuilder('user')
            .where('user.role IN (:...roles)', { roles })
            .leftJoinAndSelect('user.branch', 'branch')
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('user.createdAt', 'DESC');
        if (search)
            qb.andWhere('user.name ILIKE :search', { search: `%${search}%` });
        if (tenantId && !this.connections.hasTenantContext())
            qb.andWhere('user.tenantId = :tenantId', { tenantId });
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit, pages: Math.ceil(total / limit) };
    }
    async createUser(dto, tenantId) {
        if (dto.email) {
            const exists = await this.repo.findOne({ where: { email: dto.email } });
            if (exists)
                throw new common_1.BadRequestException('Email already registered');
        }
        if (tenantId)
            await this.assertWithinStaffLimit(tenantId, dto.role);
        const hashed = await bcrypt.hash(dto.password, 12);
        const scopedTenantId = this.connections.hasTenantContext() ? undefined : tenantId;
        const user = this.repo.create({
            ...dto,
            password: hashed,
            role: dto.role || enums_1.UserRole.CUSTOMER,
            status: enums_1.UserStatus.ACTIVE,
            tenantId: scopedTenantId,
        });
        await this.repo.save(user);
        const activeTenantId = this.connections.currentTenantId();
        if (activeTenantId && dto.email) {
            await this.tenantUserIndexRepo.save(this.tenantUserIndexRepo.create({
                email: dto.email, tenantId: activeTenantId, userId: user.id, role: user.role,
            }));
        }
        const { password, ...rest } = user;
        return rest;
    }
    async changeUserPassword(id, newPassword) {
        await this.findOne(id);
        const hashed = await bcrypt.hash(newPassword, 12);
        await this.repo.update(id, { password: hashed });
        return { message: 'Password updated' };
    }
    async updateBalance(userId, amount) {
        await this.repo.increment({ id: userId }, 'balance', amount);
    }
    async getDefaultBranch(userId) {
        const user = await this.findOne(userId);
        return { branchId: user.branchId, branch: user.branch };
    }
    async setDefaultBranch(userId, branchId) {
        await this.repo.update(userId, { branchId });
        return this.findOne(userId);
    }
    async getUserAddresses(userId) {
        await this.findOne(userId);
        return this.addresses.find({ where: { userId }, order: { isDefault: 'DESC', createdAt: 'DESC' } });
    }
    async getCustomerOrders(userId, page = 1, limit = 20) {
        await this.findOne(userId);
        const [data, total] = await this.orders.findAndCount({
            where: { userId },
            relations: ['items'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total, page, limit, pages: Math.ceil(total / limit) };
    }
    async getByRole(role, search, page = 1, limit = 20, tenantId) {
        const qb = this.repo.createQueryBuilder('user')
            .where('user.role = :role', { role })
            .leftJoinAndSelect('user.branch', 'branch')
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('user.createdAt', 'DESC');
        if (search)
            qb.andWhere('user.name ILIKE :search', { search: `%${search}%` });
        if (tenantId && !this.connections.hasTenantContext())
            qb.andWhere('user.tenantId = :tenantId', { tenantId });
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit, pages: Math.ceil(total / limit) };
    }
    async getStaffOrders(staffId, page = 1, limit = 20) {
        await this.findOne(staffId);
        const [data, total] = await this.orders.findAndCount({
            where: { staffId },
            relations: ['items', 'diningTable'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total, page, limit, pages: Math.ceil(total / limit) };
    }
    async exportStaffExcel(res) {
        const staffRoles = [enums_1.UserRole.WAITER, enums_1.UserRole.CHEF, enums_1.UserRole.STAFF, enums_1.UserRole.POS_OPERATOR, enums_1.UserRole.BRANCH_MANAGER];
        const staff = await this.repo.createQueryBuilder('user')
            .where('user.role IN (:...roles)', { roles: staffRoles })
            .leftJoinAndSelect('user.branch', 'branch')
            .orderBy('user.role', 'ASC')
            .addOrderBy('user.name', 'ASC')
            .getMany();
        const headers = ['Name', 'Email', 'Phone', 'Role', 'Branch', 'Status', 'Joined'];
        const rows = staff.map((u) => [
            u.name, u.email || '', u.phone || '', u.role, u.branch?.name || '', u.status,
            u.createdAt?.toISOString().split('T')[0] || '',
        ]);
        const ths = headers.map((h) => `<th style="background:#f97316;color:white;padding:6px 10px;border:1px solid #ddd">${h}</th>`).join('');
        const trs = rows.map((r) => `<tr>${r.map((c) => `<td style="padding:5px 10px;border:1px solid #ddd">${c}</td>`).join('')}</tr>`).join('');
        const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><h2>Staff</h2><table border="1"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></body></html>`;
        res.set({ 'Content-Type': 'application/vnd.ms-excel', 'Content-Disposition': 'attachment; filename="staff.xls"' });
        res.send(html);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(2, (0, typeorm_1.InjectRepository)(address_entity_1.Address)),
    __param(3, (0, typeorm_1.InjectRepository)(tenant_user_index_entity_1.TenantUserIndex)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        tenant_connection_service_1.TenantConnectionService,
        tenants_service_1.TenantsService])
], UsersService);
//# sourceMappingURL=users.service.js.map