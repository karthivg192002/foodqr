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
const uuid_1 = require("uuid");
const QRCode = require("qrcode");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const dining_table_entity_1 = require("./entities/dining-table.entity");
class CreateDiningTableDto {
}
exports.CreateDiningTableDto = CreateDiningTableDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDiningTableDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateDiningTableDto.prototype, "capacity", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDiningTableDto.prototype, "branchId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDiningTableDto.prototype, "waiterId", void 0);
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
    async downloadQr(id, res) {
        const table = await this.findOne(id);
        if (!table.qrCode)
            throw new common_1.NotFoundException('QR code not generated');
        const base64Data = table.qrCode.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        res.set({
            'Content-Type': 'image/png',
            'Content-Disposition': `attachment; filename="table-${table.name.replace(/\s+/g, '-')}-qr.png"`,
        });
        res.send(buffer);
    }
    async updateStatus(id, status) {
        await this.tableRepo.update(id, { status });
        return this.findOne(id);
    }
    async regenerateToken(id) {
        const token = (0, uuid_1.v4)();
        await this.tableRepo.update(id, { accessToken: token });
        return { id, accessToken: token, message: 'Session token regenerated' };
    }
    async exportExcel(branchId, res) {
        const tables = await this.findAll(branchId);
        const headers = ['Name', 'Capacity', 'Status', 'Branch', 'Waiter', 'Slug'];
        const rows = tables.map((t) => [t.name, t.capacity || '-', t.status, t.branch?.name || '', t.waiter?.name || '', t.slug]);
        const ths = headers.map((h) => `<th style="background:#f97316;color:white;padding:6px 10px;border:1px solid #ddd">${h}</th>`).join('');
        const trs = rows.map((r) => `<tr>${r.map((c) => `<td style="padding:5px 10px;border:1px solid #ddd">${c ?? ''}</td>`).join('')}</tr>`).join('');
        const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><h2>Dining Tables</h2><table border="1"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></body></html>`;
        res.set({ 'Content-Type': 'application/vnd.ms-excel', 'Content-Disposition': 'attachment; filename="dining-tables.xls"' });
        res.send(html);
    }
};
exports.DiningTablesService = DiningTablesService;
exports.DiningTablesService = DiningTablesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(dining_table_entity_1.DiningTable)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DiningTablesService);
//# sourceMappingURL=dining-tables.service.js.map