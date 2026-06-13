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
exports.AddressesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const address_entity_1 = require("./entities/address.entity");
let AddressesService = class AddressesService {
    constructor(repo) {
        this.repo = repo;
    }
    findByUser(userId) {
        return this.repo.find({ where: { userId }, order: { isDefault: 'DESC', createdAt: 'DESC' } });
    }
    async findOne(id, userId) {
        const addr = await this.repo.findOne({ where: { id, userId } });
        if (!addr)
            throw new common_1.NotFoundException('Address not found');
        return addr;
    }
    async create(userId, dto) {
        if (dto.isDefault) {
            await this.repo.update({ userId }, { isDefault: false });
        }
        return this.repo.save(this.repo.create({ ...dto, userId }));
    }
    async update(id, userId, dto) {
        await this.findOne(id, userId);
        if (dto.isDefault) {
            await this.repo.update({ userId }, { isDefault: false });
        }
        await this.repo.update(id, dto);
        return this.findOne(id, userId);
    }
    async remove(id, userId) {
        await this.findOne(id, userId);
        await this.repo.delete(id);
        return { message: 'Address deleted' };
    }
};
exports.AddressesService = AddressesService;
exports.AddressesService = AddressesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(address_entity_1.Address)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AddressesService);
//# sourceMappingURL=addresses.service.js.map