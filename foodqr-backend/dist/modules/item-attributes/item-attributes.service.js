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
exports.ItemAttributesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const item_attribute_entity_1 = require("./entities/item-attribute.entity");
const item_category_attribute_entity_1 = require("./entities/item-category-attribute.entity");
const item_variation_entity_1 = require("../menu/variations/entities/item-variation.entity");
const tenant_connection_service_1 = require("../tenants/connection/tenant-connection.service");
const tenant_aware_repo_1 = require("../tenants/connection/tenant-aware-repo");
let ItemAttributesService = class ItemAttributesService {
    constructor(attrRepo, pivotRepo, variationRepo, connections) {
        this.attrRepo = attrRepo;
        this.pivotRepo = pivotRepo;
        this.variationRepo = variationRepo;
        this.attrRepo = (0, tenant_aware_repo_1.tenantAwareRepo)(connections, item_attribute_entity_1.ItemAttribute, attrRepo);
        this.pivotRepo = (0, tenant_aware_repo_1.tenantAwareRepo)(connections, item_category_attribute_entity_1.ItemCategoryAttribute, pivotRepo);
        this.variationRepo = (0, tenant_aware_repo_1.tenantAwareRepo)(connections, item_variation_entity_1.ItemVariation, variationRepo);
    }
    findAll() {
        return this.attrRepo.find({ order: { name: 'ASC' } });
    }
    async findOne(id) {
        const attr = await this.attrRepo.findOne({ where: { id } });
        if (!attr)
            throw new common_1.NotFoundException('Attribute not found');
        return attr;
    }
    create(dto) {
        return this.attrRepo.save(this.attrRepo.create(dto));
    }
    async update(id, dto) {
        await this.findOne(id);
        await this.attrRepo.update(id, dto);
        return this.findOne(id);
    }
    async remove(id) {
        await this.findOne(id);
        await this.attrRepo.delete(id);
        return { message: 'Attribute deleted' };
    }
    getByCategory(categoryId) {
        return this.pivotRepo.find({ where: { categoryId }, relations: ['attribute'] });
    }
    async assignToCategory(categoryId, attributeIds) {
        await this.pivotRepo.delete({ categoryId });
        const rows = attributeIds.map((attributeId) => this.pivotRepo.create({ categoryId, attributeId }));
        return this.pivotRepo.save(rows);
    }
    async listGroupByAttribute(itemId) {
        const variations = await this.variationRepo.find({
            where: { itemId, status: true },
            order: { sortOrder: 'ASC', name: 'ASC' },
        });
        const grouped = {};
        for (const v of variations) {
            const key = v.attributeName || 'default';
            if (!grouped[key])
                grouped[key] = [];
            grouped[key].push(v);
        }
        return Object.entries(grouped).map(([attributeName, items]) => ({
            attributeName,
            attributeId: items[0]?.attributeId || null,
            variations: items,
        }));
    }
};
exports.ItemAttributesService = ItemAttributesService;
exports.ItemAttributesService = ItemAttributesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(item_attribute_entity_1.ItemAttribute)),
    __param(1, (0, typeorm_1.InjectRepository)(item_category_attribute_entity_1.ItemCategoryAttribute)),
    __param(2, (0, typeorm_1.InjectRepository)(item_variation_entity_1.ItemVariation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        tenant_connection_service_1.TenantConnectionService])
], ItemAttributesService);
//# sourceMappingURL=item-attributes.service.js.map