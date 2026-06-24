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
exports.CategoriesService = exports.CreateCategoryDto = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const item_category_entity_1 = require("./entities/item-category.entity");
const tenant_connection_service_1 = require("../../tenants/connection/tenant-connection.service");
const tenant_aware_repo_1 = require("../../tenants/connection/tenant-aware-repo");
class CreateCategoryDto {
}
exports.CreateCategoryDto = CreateCategoryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "icon", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "image", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "parentCategoryId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "branchId", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateCategoryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateCategoryDto.prototype, "variationOnly", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateCategoryDto.prototype, "sortOrder", void 0);
let CategoriesService = class CategoriesService {
    constructor(catRepo, connections) {
        this.catRepo = catRepo;
        this.catRepo = (0, tenant_aware_repo_1.tenantAwareRepo)(connections, item_category_entity_1.ItemCategory, catRepo);
    }
    async findAll(includeChildren = true, branchId) {
        const qb = this.catRepo.createQueryBuilder('category')
            .where('category.parentCategoryId IS NULL')
            .orderBy('category.sortOrder', 'ASC')
            .addOrderBy('category.name', 'ASC');
        if (includeChildren)
            qb.leftJoinAndSelect('category.children', 'children');
        if (branchId)
            qb.andWhere('(category.branchId IS NULL OR category.branchId = :branchId)', { branchId });
        return qb.getMany();
    }
    async findAllFlat(branchId) {
        const qb = this.catRepo.createQueryBuilder('category')
            .orderBy('category.sortOrder', 'ASC')
            .addOrderBy('category.name', 'ASC');
        if (branchId)
            qb.andWhere('(category.branchId IS NULL OR category.branchId = :branchId)', { branchId });
        return qb.getMany();
    }
    async findOne(id) {
        const cat = await this.catRepo.findOne({ where: { id }, relations: ['children', 'parentCategory'] });
        if (!cat)
            throw new common_1.NotFoundException('Category not found');
        return cat;
    }
    async create(dto) {
        const slug = dto.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        const cat = this.catRepo.create({ ...dto, slug });
        return this.catRepo.save(cat);
    }
    async update(id, dto) {
        await this.findOne(id);
        await this.catRepo.update(id, dto);
        return this.findOne(id);
    }
    async remove(id) {
        await this.findOne(id);
        await this.catRepo.delete(id);
        return { message: 'Category deleted' };
    }
    async updateSortOrder(items) {
        await Promise.all(items.map((i) => this.catRepo.update(i.id, { sortOrder: i.sortOrder })));
        return { message: 'Sort order updated' };
    }
    async exportExcel(res) {
        const cats = await this.catRepo.find({
            relations: ['parentCategory'],
            order: { sortOrder: 'ASC', name: 'ASC' },
        });
        const headers = ['Name', 'Description', 'Parent Category', 'Status', 'Variation Only', 'Sort Order'];
        const rows = cats.map((c) => [
            c.name, c.description || '', c.parentCategory?.name || '',
            c.status ? 'Active' : 'Inactive', c.variationOnly ? 'Yes' : 'No', c.sortOrder,
        ]);
        const ths = headers.map((h) => `<th style="background:#f97316;color:white;padding:6px 10px;border:1px solid #ddd">${h}</th>`).join('');
        const trs = rows.map((r) => `<tr>${r.map((c) => `<td style="padding:5px 10px;border:1px solid #ddd">${c}</td>`).join('')}</tr>`).join('');
        const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><h2>Categories</h2><table border="1"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></body></html>`;
        res.set({ 'Content-Type': 'application/vnd.ms-excel', 'Content-Disposition': 'attachment; filename="categories.xls"' });
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
                    parentCategoryId: row.parentCategoryId || undefined,
                    status: row.status !== 'false',
                    variationOnly: row.variationOnly === 'true',
                };
                const cat = await this.create(dto);
                created.push(cat.id);
            }
            catch (e) {
                errors.push(`Row ${i + 1}: ${e.message}`);
            }
        }
        return { imported: created.length, errors };
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(item_category_entity_1.ItemCategory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        tenant_connection_service_1.TenantConnectionService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map