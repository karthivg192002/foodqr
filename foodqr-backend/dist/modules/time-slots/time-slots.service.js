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
exports.TimeSlotsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const time_slot_entity_1 = require("./entities/time-slot.entity");
const tenant_connection_service_1 = require("../tenants/connection/tenant-connection.service");
const tenant_aware_repo_1 = require("../tenants/connection/tenant-aware-repo");
let TimeSlotsService = class TimeSlotsService {
    constructor(repo, connections) {
        this.repo = repo;
        this.repo = (0, tenant_aware_repo_1.tenantAwareRepo)(connections, time_slot_entity_1.TimeSlot, repo);
    }
    findByBranch(branchId) {
        return this.repo.find({ where: { branchId }, order: { day: 'ASC' } });
    }
    findAll() {
        return this.repo.find({ order: { day: 'ASC' } });
    }
    async upsertForBranch(branchId, slots) {
        await this.repo.delete({ branchId });
        const rows = slots.map((s) => this.repo.create({ ...s, branchId }));
        return this.repo.save(rows);
    }
    isWithinSlot(slots, date) {
        const day = date.getDay();
        const slot = slots.find((s) => s.day === day && s.isOpen);
        if (!slot)
            return false;
        const [oh, om] = slot.openingTime.split(':').map(Number);
        const [ch, cm] = slot.closingTime.split(':').map(Number);
        const mins = date.getHours() * 60 + date.getMinutes();
        return mins >= oh * 60 + om && mins <= ch * 60 + cm;
    }
};
exports.TimeSlotsService = TimeSlotsService;
exports.TimeSlotsService = TimeSlotsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(time_slot_entity_1.TimeSlot)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        tenant_connection_service_1.TenantConnectionService])
], TimeSlotsService);
//# sourceMappingURL=time-slots.service.js.map