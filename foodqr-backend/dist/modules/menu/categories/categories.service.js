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
const item_category_entity_1 = require("./entities/item-category.entity");
class CreateCategoryDto {
}
exports.CreateCategoryDto = CreateCategoryDto;
let CategoriesService = class CategoriesService {
    constructor(catRepo) {
        this.catRepo = catRepo;
    }
    async findAll(includeChildren = true) {
        const categories = await this.catRepo.find({
            where: { parentCategoryId: (0, typeorm_2.IsNull)() },
            relations: includeChildren ? ['children'] : [],
            order: { sortOrder: 'ASC', name: 'ASC' },
        });
        return categories;
    }
    async findAllFlat() {
        return this.catRepo.find({ order: { sortOrder: 'ASC', name: 'ASC' } });
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
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(item_category_entity_1.ItemCategory)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map