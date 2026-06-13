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
exports.ItemsService = exports.CreateItemDto = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const item_entity_1 = require("./entities/item.entity");
const item_variation_entity_1 = require("../variations/entities/item-variation.entity");
class CreateItemDto {
}
exports.CreateItemDto = CreateItemDto;
let ItemsService = class ItemsService {
    constructor(itemRepo, variationRepo) {
        this.itemRepo = itemRepo;
        this.variationRepo = variationRepo;
    }
    async findAll(search, categoryId, isFeatured, page = 1, limit = 20) {
        const qb = this.itemRepo.createQueryBuilder('item')
            .leftJoinAndSelect('item.category', 'category')
            .leftJoinAndSelect('item.variations', 'variations')
            .where('item.status = true')
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('item.sortOrder', 'ASC');
        if (search)
            qb.andWhere('item.name ILIKE :search', { search: `%${search}%` });
        if (categoryId)
            qb.andWhere('item.categoryId = :categoryId', { categoryId });
        if (isFeatured !== undefined)
            qb.andWhere('item.isFeatured = :isFeatured', { isFeatured });
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit, pages: Math.ceil(total / limit) };
    }
    async findAllAdmin(search, categoryId, page = 1, limit = 20) {
        const qb = this.itemRepo.createQueryBuilder('item')
            .leftJoinAndSelect('item.category', 'category')
            .leftJoinAndSelect('item.variations', 'variations')
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('item.sortOrder', 'ASC');
        if (search)
            qb.andWhere('item.name ILIKE :search', { search: `%${search}%` });
        if (categoryId)
            qb.andWhere('item.categoryId = :categoryId', { categoryId });
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit, pages: Math.ceil(total / limit) };
    }
    async findOne(id) {
        const item = await this.itemRepo.findOne({
            where: { id },
            relations: ['category', 'variations'],
        });
        if (!item)
            throw new common_1.NotFoundException('Item not found');
        return item;
    }
    async getFeatured() {
        return this.itemRepo.find({
            where: { isFeatured: true, status: true },
            relations: ['category'],
            order: { sortOrder: 'ASC' },
            take: 10,
        });
    }
    async getPopular() {
        return this.itemRepo.createQueryBuilder('item')
            .leftJoinAndSelect('item.category', 'category')
            .leftJoin('order_items', 'oi', 'oi.itemId = item.id')
            .where('item.status = true')
            .groupBy('item.id, category.id')
            .orderBy('COUNT(oi.id)', 'DESC')
            .take(10)
            .getMany();
    }
    async create(dto) {
        const slug = dto.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        const { variations, ...itemData } = dto;
        const item = this.itemRepo.create({ ...itemData, slug });
        const saved = await this.itemRepo.save(item);
        if (variations?.length) {
            const vars = variations.map((v) => this.variationRepo.create({ ...v, itemId: saved.id }));
            await this.variationRepo.save(vars);
        }
        return this.findOne(saved.id);
    }
    async update(id, dto) {
        await this.findOne(id);
        const { variations, ...itemData } = dto;
        await this.itemRepo.update(id, itemData);
        if (variations) {
            await this.variationRepo.delete({ itemId: id });
            if (variations.length) {
                const vars = variations.map((v) => this.variationRepo.create({ ...v, itemId: id }));
                await this.variationRepo.save(vars);
            }
        }
        return this.findOne(id);
    }
    async remove(id) {
        await this.findOne(id);
        await this.itemRepo.delete(id);
        return { message: 'Item deleted' };
    }
    async toggleStatus(id) {
        const item = await this.findOne(id);
        await this.itemRepo.update(id, { status: !item.status });
        return this.findOne(id);
    }
    async toggleFeatured(id) {
        const item = await this.findOne(id);
        await this.itemRepo.update(id, { isFeatured: !item.isFeatured });
        return this.findOne(id);
    }
};
exports.ItemsService = ItemsService;
exports.ItemsService = ItemsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(item_entity_1.Item)),
    __param(1, (0, typeorm_1.InjectRepository)(item_variation_entity_1.ItemVariation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ItemsService);
//# sourceMappingURL=items.service.js.map