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
const branch_entity_1 = require("./entities/branch.entity");
class CreateBranchDto {
}
exports.CreateBranchDto = CreateBranchDto;
let BranchesService = class BranchesService {
    constructor(branchRepo) {
        this.branchRepo = branchRepo;
    }
    findAll() {
        return this.branchRepo.find({ where: { status: true }, order: { isDefault: 'DESC', createdAt: 'ASC' } });
    }
    async findOne(id) {
        const branch = await this.branchRepo.findOne({ where: { id } });
        if (!branch)
            throw new common_1.NotFoundException('Branch not found');
        return branch;
    }
    async create(dto) {
        const slug = dto.name.toLowerCase().replace(/\s+/g, '-');
        const branch = this.branchRepo.create({ ...dto, slug });
        return this.branchRepo.save(branch);
    }
    async update(id, dto) {
        await this.findOne(id);
        await this.branchRepo.update(id, dto);
        return this.findOne(id);
    }
    async remove(id) {
        await this.findOne(id);
        await this.branchRepo.delete(id);
        return { message: 'Branch deleted' };
    }
    async setDefault(id) {
        await this.branchRepo.update({}, { isDefault: false });
        await this.branchRepo.update(id, { isDefault: true });
        return this.findOne(id);
    }
};
exports.BranchesService = BranchesService;
exports.BranchesService = BranchesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(branch_entity_1.Branch)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BranchesService);
//# sourceMappingURL=branches.service.js.map