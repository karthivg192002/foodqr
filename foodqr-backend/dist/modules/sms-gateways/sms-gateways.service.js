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
exports.SmsGatewaysService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sms_gateway_entity_1 = require("./entities/sms-gateway.entity");
const DEFAULT_GATEWAYS = [
    { name: 'Twilio', slug: 'twilio' },
    { name: 'Nexmo', slug: 'nexmo' },
    { name: 'Msg91', slug: 'msg91' },
    { name: 'Clickatell', slug: 'clickatell' },
    { name: 'BulkSMS', slug: 'bulksms' },
    { name: 'Telesign', slug: 'telesign' },
];
let SmsGatewaysService = class SmsGatewaysService {
    constructor(repo) {
        this.repo = repo;
    }
    async onModuleInit() {
        for (const gw of DEFAULT_GATEWAYS) {
            const exists = await this.repo.findOne({ where: { slug: gw.slug } });
            if (!exists)
                await this.repo.save(this.repo.create(gw));
        }
    }
    findAll() { return this.repo.find({ order: { name: 'ASC' } }); }
    async findOne(slug) {
        const gw = await this.repo.findOne({ where: { slug } });
        if (!gw)
            throw new common_1.NotFoundException('SMS gateway not found');
        return gw;
    }
    async update(slug, dto) {
        const gw = await this.findOne(slug);
        await this.repo.update(gw.id, dto);
        return this.findOne(slug);
    }
};
exports.SmsGatewaysService = SmsGatewaysService;
exports.SmsGatewaysService = SmsGatewaysService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sms_gateway_entity_1.SmsGateway)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SmsGatewaysService);
//# sourceMappingURL=sms-gateways.service.js.map