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
exports.MessagingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const message_entity_1 = require("./entities/message.entity");
const message_history_entity_1 = require("./entities/message-history.entity");
let MessagingService = class MessagingService {
    constructor(msgRepo, historyRepo) {
        this.msgRepo = msgRepo;
        this.historyRepo = historyRepo;
    }
    async getOrCreateThread(userId, branchId) {
        let thread = await this.msgRepo.findOne({ where: { userId, branchId } });
        if (!thread) {
            thread = await this.msgRepo.save(this.msgRepo.create({ userId, branchId }));
        }
        return thread;
    }
    async getThreadsForBranch(branchId) {
        return this.msgRepo.find({ where: { branchId }, relations: ['user'], order: { updatedAt: 'DESC' } });
    }
    async getHistory(messageId) {
        return this.historyRepo.find({ where: { messageId }, order: { createdAt: 'ASC' } });
    }
    async sendMessage(messageId, userId, text) {
        const thread = await this.msgRepo.findOne({ where: { id: messageId } });
        if (!thread)
            throw new common_1.NotFoundException('Thread not found');
        const history = await this.historyRepo.save(this.historyRepo.create({ messageId, userId, text }));
        await this.msgRepo.update(messageId, { updatedAt: new Date() });
        return history;
    }
    async markRead(messageId) {
        await this.historyRepo.update({ messageId, isRead: false }, { isRead: true });
        return { message: 'Marked as read' };
    }
};
exports.MessagingService = MessagingService;
exports.MessagingService = MessagingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(1, (0, typeorm_1.InjectRepository)(message_history_entity_1.MessageHistory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], MessagingService);
//# sourceMappingURL=messaging.service.js.map