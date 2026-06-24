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
exports.BranchesService = exports.CreateBranchDto = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_validator_1 = require("class-validator");
const branch_entity_1 = require("./entities/branch.entity");
const tenant_connection_service_1 = require("../tenants/connection/tenant-connection.service");
const tenants_service_1 = require("../tenants/tenants.service");
class CreateBranchDto {
}
exports.CreateBranchDto = CreateBranchDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBranchDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBranchDto.prototype, "slug", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBranchDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBranchDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBranchDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBranchDto.prototype, "country", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBranchDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBranchDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBranchDto.prototype, "latitude", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBranchDto.prototype, "longitude", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBranchDto.prototype, "image", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateBranchDto.prototype, "isDefault", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateBranchDto.prototype, "status", void 0);
let BranchesService = class BranchesService {
    constructor(branchRepo, connections, tenantsService) {
        this.branchRepo = branchRepo;
        this.connections = connections;
        this.tenantsService = tenantsService;
    }
    get repo() {
        return this.connections.repoOrDefault(branch_entity_1.Branch, this.branchRepo);
    }
    findAll(tenantId) {
        const where = { status: true };
        if (tenantId && !this.connections.hasTenantContext())
            where.tenantId = tenantId;
        return this.repo.find({ where, order: { isDefault: 'DESC', createdAt: 'ASC' } });
    }
    async findOne(id, tenantId) {
        const where = { id };
        if (tenantId && !this.connections.hasTenantContext())
            where.tenantId = tenantId;
        const branch = await this.repo.findOne({ where });
        if (!branch)
            throw new common_1.NotFoundException('Branch not found');
        return branch;
    }
    async create(dto, tenantId) {
        if (tenantId)
            await this.assertWithinBranchLimit(tenantId);
        const slug = dto.slug || dto.name.toLowerCase().replace(/\s+/g, '-');
        const scopedTenantId = this.connections.hasTenantContext() ? undefined : tenantId;
        const branch = this.repo.create({ ...dto, slug, tenantId: scopedTenantId });
        return this.repo.save(branch);
    }
    async assertWithinBranchLimit(tenantId) {
        const tenant = await this.tenantsService.findOne(tenantId).catch(() => null);
        const maxBranches = tenant?.plan?.maxBranches;
        if (!maxBranches || maxBranches <= 0)
            return;
        const where = {};
        if (!this.connections.hasTenantContext())
            where.tenantId = tenantId;
        const count = await this.repo.count({ where });
        if (count >= maxBranches) {
            throw new common_1.BadRequestException(`Branch limit reached for your plan (max ${maxBranches})`);
        }
    }
    async update(id, dto, tenantId) {
        await this.findOne(id, tenantId);
        await this.repo.update(id, dto);
        return this.findOne(id, tenantId);
    }
    async remove(id, tenantId) {
        await this.findOne(id, tenantId);
        await this.repo.delete(id);
        return { message: 'Branch deleted' };
    }
    async setDefault(id, tenantId) {
        await this.findOne(id, tenantId);
        const scope = tenantId && !this.connections.hasTenantContext() ? { tenantId } : {};
        await this.repo.update(scope, { isDefault: false });
        await this.repo.update(id, { isDefault: true });
        return this.findOne(id, tenantId);
    }
    async exportExcel(res) {
        const branches = await this.repo.find({ order: { isDefault: 'DESC', name: 'ASC' } });
        const headers = ['Name', 'City', 'Country', 'Phone', 'Email', 'Status', 'Default'];
        const rows = branches.map((b) => [b.name, b.city || '', b.country || '', b.phone || '', b.email || '', b.status ? 'Active' : 'Inactive', b.isDefault ? 'Yes' : 'No']);
        const ths = headers.map((h) => `<th style="background:#f97316;color:white;padding:6px 10px;border:1px solid #ddd">${h}</th>`).join('');
        const trs = rows.map((r) => `<tr>${r.map((c) => `<td style="padding:5px 10px;border:1px solid #ddd">${c ?? ''}</td>`).join('')}</tr>`).join('');
        const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><h2>Branches</h2><table border="1"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></body></html>`;
        res.set({ 'Content-Type': 'application/vnd.ms-excel', 'Content-Disposition': 'attachment; filename="branches.xls"' });
        res.send(html);
    }
};
exports.BranchesService = BranchesService;
exports.BranchesService = BranchesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(branch_entity_1.Branch)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        tenant_connection_service_1.TenantConnectionService,
        tenants_service_1.TenantsService])
], BranchesService);
//# sourceMappingURL=branches.service.js.map