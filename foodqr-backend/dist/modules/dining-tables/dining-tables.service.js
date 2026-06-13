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
exports.DiningTablesService = exports.CreateDiningTableDto = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const QRCode = require("qrcode");
const dining_table_entity_1 = require("./entities/dining-table.entity");
class CreateDiningTableDto {
}
exports.CreateDiningTableDto = CreateDiningTableDto;
let DiningTablesService = class DiningTablesService {
    constructor(tableRepo) {
        this.tableRepo = tableRepo;
    }
    async findAll(branchId) {
        const where = {};
        if (branchId)
            where.branchId = branchId;
        return this.tableRepo.find({ where, relations: ['branch', 'waiter'], order: { name: 'ASC' } });
    }
    async findOne(id) {
        const table = await this.tableRepo.findOne({
            where: { id },
            relations: ['branch', 'waiter'],
        });
        if (!table)
            throw new common_1.NotFoundException('Dining table not found');
        return table;
    }
    async findBySlug(slug) {
        const table = await this.tableRepo.findOne({ where: { slug }, relations: ['branch'] });
        if (!table)
            throw new common_1.NotFoundException('Dining table not found');
        return table;
    }
    async create(dto, frontendUrl) {
        const slug = dto.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        const table = this.tableRepo.create({ ...dto, slug });
        const saved = await this.tableRepo.save(table);
        const qrUrl = `${frontendUrl}/table/${saved.slug}`;
        const qrCode = await QRCode.toDataURL(qrUrl);
        await this.tableRepo.update(saved.id, { qrCode });
        return this.findOne(saved.id);
    }
    async update(id, dto) {
        await this.findOne(id);
        await this.tableRepo.update(id, dto);
        return this.findOne(id);
    }
    async remove(id) {
        await this.findOne(id);
        await this.tableRepo.delete(id);
        return { message: 'Dining table deleted' };
    }
    async regenerateQr(id, frontendUrl) {
        const table = await this.findOne(id);
        const qrUrl = `${frontendUrl}/table/${table.slug}`;
        const qrCode = await QRCode.toDataURL(qrUrl);
        await this.tableRepo.update(id, { qrCode });
        return this.findOne(id);
    }
    async updateStatus(id, status) {
        await this.tableRepo.update(id, { status });
        return this.findOne(id);
    }
};
exports.DiningTablesService = DiningTablesService;
exports.DiningTablesService = DiningTablesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(dining_table_entity_1.DiningTable)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DiningTablesService);
//# sourceMappingURL=dining-tables.service.js.map