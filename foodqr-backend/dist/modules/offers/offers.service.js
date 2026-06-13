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
exports.OffersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const offer_entity_1 = require("./entities/offer.entity");
const banner_entity_1 = require("./entities/banner.entity");
const offer_item_entity_1 = require("./entities/offer-item.entity");
let OffersService = class OffersService {
    constructor(offerRepo, bannerRepo, offerItemRepo) {
        this.offerRepo = offerRepo;
        this.bannerRepo = bannerRepo;
        this.offerItemRepo = offerItemRepo;
    }
    getActiveOffers() {
        const now = new Date();
        return this.offerRepo.find({
            where: { status: true },
            order: { sortOrder: 'ASC', createdAt: 'DESC' },
        });
    }
    getAllOffers() {
        return this.offerRepo.find({ order: { sortOrder: 'ASC', createdAt: 'DESC' } });
    }
    async createOffer(data) {
        const offer = this.offerRepo.create(data);
        return this.offerRepo.save(offer);
    }
    async updateOffer(id, data) {
        const offer = await this.offerRepo.findOne({ where: { id } });
        if (!offer)
            throw new common_1.NotFoundException('Offer not found');
        await this.offerRepo.update(id, data);
        return this.offerRepo.findOne({ where: { id } });
    }
    async deleteOffer(id) {
        await this.offerRepo.delete(id);
        return { message: 'Offer deleted' };
    }
    getActiveBanners() {
        return this.bannerRepo.find({ where: { status: true }, order: { sortOrder: 'ASC' } });
    }
    getAllBanners() {
        return this.bannerRepo.find({ order: { sortOrder: 'ASC', createdAt: 'DESC' } });
    }
    async createBanner(data) {
        const banner = this.bannerRepo.create(data);
        return this.bannerRepo.save(banner);
    }
    async updateBanner(id, data) {
        await this.bannerRepo.update(id, data);
        return this.bannerRepo.findOne({ where: { id } });
    }
    async deleteBanner(id) {
        await this.bannerRepo.delete(id);
        return { message: 'Banner deleted' };
    }
    async getOfferItems(offerId) {
        return this.offerItemRepo.find({ where: { offerId }, relations: ['item'] });
    }
    async addOfferItem(offerId, itemId) {
        const existing = await this.offerItemRepo.findOne({ where: { offerId, itemId } });
        if (existing)
            return existing;
        return this.offerItemRepo.save(this.offerItemRepo.create({ offerId, itemId }));
    }
    async removeOfferItem(offerItemId) {
        await this.offerItemRepo.delete(offerItemId);
        return { message: 'Item removed from offer' };
    }
};
exports.OffersService = OffersService;
exports.OffersService = OffersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(offer_entity_1.Offer)),
    __param(1, (0, typeorm_1.InjectRepository)(banner_entity_1.Banner)),
    __param(2, (0, typeorm_1.InjectRepository)(offer_item_entity_1.OfferItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], OffersService);
//# sourceMappingURL=offers.service.js.map