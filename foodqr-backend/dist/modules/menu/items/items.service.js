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
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const item_entity_1 = require("./entities/item.entity");
const item_variation_entity_1 = require("../variations/entities/item-variation.entity");
const item_category_entity_1 = require("../categories/entities/item-category.entity");
const enums_1 = require("../../../common/enums");
const tenant_connection_service_1 = require("../../tenants/connection/tenant-connection.service");
const tenant_aware_repo_1 = require("../../tenants/connection/tenant-aware-repo");
class CreateItemDto {
}
exports.CreateItemDto = CreateItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateItemDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateItemDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateItemDto.prototype, "caution", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateItemDto.prototype, "ingredients", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateItemDto.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateItemDto.prototype, "categoryId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateItemDto.prototype, "subCategoryId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(enums_1.ItemType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateItemDto.prototype, "itemType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateItemDto.prototype, "thumbImage", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateItemDto.prototype, "coverImage", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateItemDto.prototype, "videoUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateItemDto.prototype, "arImage", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateItemDto.prototype, "gallery", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateItemDto.prototype, "calories", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateItemDto.prototype, "protein", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateItemDto.prototype, "carbs", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateItemDto.prototype, "fat", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateItemDto.prototype, "taxId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateItemDto.prototype, "taxRate", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateItemDto.prototype, "isFeatured", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateItemDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateItemDto.prototype, "sortOrder", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateItemDto.prototype, "variations", void 0);
let ItemsService = class ItemsService {
    constructor(itemRepo, variationRepo, catRepo, connections) {
        this.itemRepo = itemRepo;
        this.variationRepo = variationRepo;
        this.catRepo = catRepo;
        this.itemRepo = (0, tenant_aware_repo_1.tenantAwareRepo)(connections, item_entity_1.Item, itemRepo);
        this.variationRepo = (0, tenant_aware_repo_1.tenantAwareRepo)(connections, item_variation_entity_1.ItemVariation, variationRepo);
        this.catRepo = (0, tenant_aware_repo_1.tenantAwareRepo)(connections, item_category_entity_1.ItemCategory, catRepo);
    }
    async resolveCategoryIds(categoryId) {
        const children = await this.catRepo.find({ where: { parentCategoryId: categoryId } });
        return [categoryId, ...children.map((c) => c.id)];
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
        if (categoryId) {
            const categoryIds = await this.resolveCategoryIds(categoryId);
            qb.andWhere('(item.categoryId IN (:...categoryIds) OR item.subCategoryId IN (:...categoryIds))', { categoryIds });
        }
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
        if (categoryId) {
            const categoryIds = await this.resolveCategoryIds(categoryId);
            qb.andWhere('(item.categoryId IN (:...categoryIds) OR item.subCategoryId IN (:...categoryIds))', { categoryIds });
        }
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
            .addSelect('COUNT(oi.id)', 'order_count')
            .where('item.status = true')
            .groupBy('item.id')
            .addGroupBy('category.id')
            .orderBy('order_count', 'DESC')
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
        await this.itemRepo.softDelete(id);
        return { message: 'Item deleted' };
    }
    async restore(id) {
        await this.itemRepo.restore(id);
        return this.findOne(id);
    }
    async exportExcel(res) {
        const items = await this.itemRepo.find({
            relations: ['category'],
            order: { sortOrder: 'ASC', name: 'ASC' },
            withDeleted: false,
        });
        const headers = ['Name', 'Description', 'Price', 'Category', 'Type', 'Caution', 'Calories', 'Status', 'Featured'];
        const rows = items.map((i) => [
            i.name, i.description || '', Number(i.price).toFixed(2), i.category?.name || '',
            i.itemType, i.caution || '', i.calories || '', i.status ? 'Active' : 'Inactive', i.isFeatured ? 'Yes' : 'No',
        ]);
        const ths = headers.map((h) => `<th style="background:#f97316;color:white;padding:6px 10px;border:1px solid #ddd">${h}</th>`).join('');
        const trs = rows.map((r) => `<tr>${r.map((c) => `<td style="padding:5px 10px;border:1px solid #ddd">${c}</td>`).join('')}</tr>`).join('');
        const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><h2>Items</h2><table border="1"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></body></html>`;
        res.set({ 'Content-Type': 'application/vnd.ms-excel', 'Content-Disposition': 'attachment; filename="items.xls"' });
        res.send(html);
    }
    async importFromCsv(csvContent) {
        const lines = csvContent.split('\n').filter((l) => l.trim());
        if (lines.length < 2)
            return { imported: 0, errors: ['Empty file'] };
        const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
        const created = [];
        const errors = [];
        for (let i = 1; i < lines.length; i++) {
            try {
                const values = lines[i].match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map((v) => v.trim().replace(/^"|"$/g, '')) || [];
                const row = {};
                headers.forEach((h, idx) => (row[h] = values[idx] || ''));
                if (!row.name) {
                    errors.push(`Row ${i + 1}: missing name`);
                    continue;
                }
                const dto = {
                    name: row.name,
                    description: row.description,
                    price: parseFloat(row.price) || 0,
                    categoryId: row.categoryId || undefined,
                    itemType: row.itemType || 'veg',
                    caution: row.caution,
                    ingredients: row.ingredients,
                    calories: row.calories ? parseFloat(row.calories) : undefined,
                    protein: row.protein ? parseFloat(row.protein) : undefined,
                    carbs: row.carbs ? parseFloat(row.carbs) : undefined,
                    fat: row.fat ? parseFloat(row.fat) : undefined,
                    taxRate: row.taxRate ? parseFloat(row.taxRate) : undefined,
                    isFeatured: row.isFeatured === 'true',
                    status: row.status !== 'false',
                };
                const item = await this.create(dto);
                created.push(item.id);
            }
            catch (e) {
                errors.push(`Row ${i + 1}: ${e.message}`);
            }
        }
        return { imported: created.length, errors };
    }
    async findAllWithDeleted(search, categoryId, page = 1, limit = 20) {
        const qb = this.itemRepo.createQueryBuilder('item')
            .withDeleted()
            .leftJoinAndSelect('item.category', 'category')
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('item.sortOrder', 'ASC');
        if (search)
            qb.andWhere('item.name ILIKE :search', { search: `%${search}%` });
        if (categoryId) {
            const categoryIds = await this.resolveCategoryIds(categoryId);
            qb.andWhere('(item.categoryId IN (:...categoryIds) OR item.subCategoryId IN (:...categoryIds))', { categoryIds });
        }
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit, pages: Math.ceil(total / limit) };
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
    __param(2, (0, typeorm_1.InjectRepository)(item_category_entity_1.ItemCategory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        tenant_connection_service_1.TenantConnectionService])
], ItemsService);
//# sourceMappingURL=items.service.js.map