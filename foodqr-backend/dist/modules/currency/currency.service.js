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
exports.CurrencyService = exports.CreateCurrencyDto = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_validator_1 = require("class-validator");
const currency_entity_1 = require("./entities/currency.entity");
class CreateCurrencyDto {
}
exports.CreateCurrencyDto = CreateCurrencyDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCurrencyDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCurrencyDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCurrencyDto.prototype, "symbol", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateCurrencyDto.prototype, "exchangeRate", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateCurrencyDto.prototype, "isDefault", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateCurrencyDto.prototype, "status", void 0);
let CurrencyService = class CurrencyService {
    constructor(currencyRepo) {
        this.currencyRepo = currencyRepo;
    }
    async findAll() {
        return this.currencyRepo.find({ order: { isDefault: 'DESC', name: 'ASC' } });
    }
    async findActive() {
        return this.currencyRepo.find({
            where: { status: true },
            order: { isDefault: 'DESC', name: 'ASC' },
        });
    }
    async findOne(id) {
        const currency = await this.currencyRepo.findOne({ where: { id } });
        if (!currency)
            throw new common_1.NotFoundException('Currency not found');
        return currency;
    }
    async create(dto) {
        const currency = this.currencyRepo.create(dto);
        return this.currencyRepo.save(currency);
    }
    async update(id, dto) {
        await this.findOne(id);
        await this.currencyRepo.update(id, dto);
        return this.findOne(id);
    }
    async setDefault(id) {
        await this.findOne(id);
        await this.currencyRepo.update({}, { isDefault: false });
        await this.currencyRepo.update(id, { isDefault: true });
        return this.findOne(id);
    }
    async remove(id) {
        await this.findOne(id);
        await this.currencyRepo.delete(id);
        return { message: 'Currency deleted' };
    }
    async getDefault() {
        return this.currencyRepo.findOne({ where: { isDefault: true, status: true } });
    }
    async convertAmount(amount, toCurrencyCode) {
        const target = await this.currencyRepo.findOne({ where: { code: toCurrencyCode.toUpperCase(), status: true } });
        if (!target)
            throw new common_1.NotFoundException(`Currency ${toCurrencyCode} not found`);
        const defaultCurrency = await this.getDefault();
        const baseRate = defaultCurrency?.exchangeRate || 1;
        const converted = (amount / Number(baseRate)) * Number(target.exchangeRate);
        return {
            amount,
            converted: Math.round(converted * 100) / 100,
            rate: Number(target.exchangeRate),
            symbol: target.symbol,
            code: target.code,
        };
    }
    async convertBulk(amounts, toCurrencyCode) {
        const target = await this.currencyRepo.findOne({ where: { code: toCurrencyCode.toUpperCase(), status: true } });
        if (!target)
            throw new common_1.NotFoundException(`Currency ${toCurrencyCode} not found`);
        const rate = Number(target.exchangeRate);
        return { rate, symbol: target.symbol, code: target.code, amounts: amounts.map((a) => Math.round(a * rate * 100) / 100) };
    }
};
exports.CurrencyService = CurrencyService;
exports.CurrencyService = CurrencyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(currency_entity_1.Currency)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CurrencyService);
//# sourceMappingURL=currency.service.js.map