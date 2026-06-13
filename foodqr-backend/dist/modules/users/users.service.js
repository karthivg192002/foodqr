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
const user_entity_1 = require("./entities/user.entity");
const enums_1 = require("../../common/enums");
let UsersService = class UsersService {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async findAll(role, search, page = 1, limit = 20) {
        const where = {};
        if (role)
            where.role = role;
        if (search)
            where.name = (0, typeorm_2.Like)(`%${search}%`);
        const [data, total] = await this.userRepo.findAndCount({
            where,
            relations: ['branch'],
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { data, total, page, limit, pages: Math.ceil(total / limit) };
    }
    async findOne(id) {
        const user = await this.userRepo.findOne({ where: { id }, relations: ['branch'] });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async update(id, dto) {
        await this.findOne(id);
        await this.userRepo.update(id, dto);
        return this.findOne(id);
    }
    async updateDeviceToken(id, dto) {
        await this.userRepo.update(id, dto);
        return { message: 'Device token updated' };
    }
    async remove(id) {
        await this.findOne(id);
        await this.userRepo.softDelete(id);
        return { message: 'User deleted' };
    }
    async getCustomers(search, page = 1, limit = 20) {
        return this.findAll(enums_1.UserRole.CUSTOMER, search, page, limit);
    }
    async getStaff(search, page = 1, limit = 20) {
        const roles = [enums_1.UserRole.WAITER, enums_1.UserRole.CHEF, enums_1.UserRole.STAFF, enums_1.UserRole.POS_OPERATOR];
        const qb = this.userRepo.createQueryBuilder('user')
            .where('user.role IN (:...roles)', { roles })
            .leftJoinAndSelect('user.branch', 'branch')
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('user.createdAt', 'DESC');
        if (search)
            qb.andWhere('user.name ILIKE :search', { search: `%${search}%` });
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit, pages: Math.ceil(total / limit) };
    }
    async updateBalance(userId, amount) {
        await this.userRepo.increment({ id: userId }, 'balance', amount);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map