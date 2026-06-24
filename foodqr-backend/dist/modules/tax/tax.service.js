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
exports.TaxService = exports.CreateTaxDto = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const tax_entity_1 = require("./entities/tax.entity");
const tenant_connection_service_1 = require("../tenants/connection/tenant-connection.service");
const tenant_aware_repo_1 = require("../tenants/connection/tenant-aware-repo");
class CreateTaxDto {
}
exports.CreateTaxDto = CreateTaxDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaxDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateTaxDto.prototype, "rate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTaxDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateTaxDto.prototype, "isIncluded", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateTaxDto.prototype, "isDefault", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateTaxDto.prototype, "status", void 0);
let TaxService = class TaxService {
    constructor(taxRepo, connections) {
        this.taxRepo = taxRepo;
        this.taxRepo = (0, tenant_aware_repo_1.tenantAwareRepo)(connections, tax_entity_1.Tax, taxRepo);
    }
    async findAll() {
        return this.taxRepo.find({ order: { isDefault: 'DESC', name: 'ASC' } });
    }
    async findActive() {
        return this.taxRepo.find({
            where: { status: true },
            order: { isDefault: 'DESC', name: 'ASC' },
        });
    }
    async findOne(id) {
        const tax = await this.taxRepo.findOne({ where: { id } });
        if (!tax)
            throw new common_1.NotFoundException('Tax not found');
        return tax;
    }
    async create(dto) {
        const tax = this.taxRepo.create(dto);
        return this.taxRepo.save(tax);
    }
    async update(id, dto) {
        await this.findOne(id);
        await this.taxRepo.update(id, dto);
        return this.findOne(id);
    }
    async setDefault(id) {
        await this.findOne(id);
        await this.taxRepo.update({}, { isDefault: false });
        await this.taxRepo.update(id, { isDefault: true });
        return this.findOne(id);
    }
    async remove(id) {
        await this.findOne(id);
        await this.taxRepo.delete(id);
        return { message: 'Tax deleted' };
    }
};
exports.TaxService = TaxService;
exports.TaxService = TaxService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tax_entity_1.Tax)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        tenant_connection_service_1.TenantConnectionService])
], TaxService);
//# sourceMappingURL=tax.service.js.map