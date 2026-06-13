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
exports.ItemExtrasService = exports.CreateItemExtraDto = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const item_extra_entity_1 = require("./entities/item-extra.entity");
class CreateItemExtraDto {
}
exports.CreateItemExtraDto = CreateItemExtraDto;
let ItemExtrasService = class ItemExtrasService {
    constructor(extraRepo) {
        this.extraRepo = extraRepo;
    }
    async findByItem(itemId) {
        return this.extraRepo.find({
            where: { itemId, status: true },
            order: { createdAt: 'ASC' },
        });
    }
    async findByItemAdmin(itemId) {
        return this.extraRepo.find({
            where: { itemId },
            order: { createdAt: 'ASC' },
        });
    }
    async create(itemId, dto) {
        const extra = this.extraRepo.create({ ...dto, itemId });
        return this.extraRepo.save(extra);
    }
    async update(id, dto) {
        const extra = await this.extraRepo.findOne({ where: { id } });
        if (!extra)
            throw new common_1.NotFoundException('Extra not found');
        await this.extraRepo.update(id, dto);
        return this.extraRepo.findOne({ where: { id } });
    }
    async remove(id) {
        const extra = await this.extraRepo.findOne({ where: { id } });
        if (!extra)
            throw new common_1.NotFoundException('Extra not found');
        await this.extraRepo.delete(id);
        return { message: 'Extra deleted' };
    }
};
exports.ItemExtrasService = ItemExtrasService;
exports.ItemExtrasService = ItemExtrasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(item_extra_entity_1.ItemExtra)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ItemExtrasService);
//# sourceMappingURL=item-extras.service.js.map