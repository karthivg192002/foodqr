import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { Banner } from './entities/banner.entity';
import { PromotionBanner } from './entities/promotion-banner.entity';
import { OfferItem } from './entities/offer-item.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer) private offerRepo: Repository<Offer>,
    @InjectRepository(Banner) private bannerRepo: Repository<Banner>,
    @InjectRepository(PromotionBanner) private promoRepo: Repository<PromotionBanner>,
    @InjectRepository(OfferItem) private offerItemRepo: Repository<OfferItem>,
  ) {}

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

  async createOffer(data: Partial<Offer>) {
    const offer = this.offerRepo.create(data);
    return this.offerRepo.save(offer);
  }

  async updateOffer(id: string, data: Partial<Offer>) {
    const offer = await this.offerRepo.findOne({ where: { id } });
    if (!offer) throw new NotFoundException('Offer not found');
    await this.offerRepo.update(id, data);
    return this.offerRepo.findOne({ where: { id } });
  }

  async deleteOffer(id: string) {
    await this.offerRepo.delete(id);
    return { message: 'Offer deleted' };
  }

  getActiveBanners() {
    return this.bannerRepo.find({ where: { status: true }, order: { sortOrder: 'ASC' } });
  }

  getAllBanners() {
    return this.bannerRepo.find({ order: { sortOrder: 'ASC', createdAt: 'DESC' } });
  }

  async createBanner(data: Partial<Banner>) {
    const banner = this.bannerRepo.create(data);
    return this.bannerRepo.save(banner);
  }

  async updateBanner(id: string, data: Partial<Banner>) {
    await this.bannerRepo.update(id, data);
    return this.bannerRepo.findOne({ where: { id } });
  }

  async deleteBanner(id: string) {
    await this.bannerRepo.delete(id);
    return { message: 'Banner deleted' };
  }

  async getOfferItems(offerId: string) {
    return this.offerItemRepo.find({ where: { offerId }, relations: ['item'] });
  }

  async addOfferItem(offerId: string, itemId: string) {
    const existing = await this.offerItemRepo.findOne({ where: { offerId, itemId } });
    if (existing) return existing;
    return this.offerItemRepo.save(this.offerItemRepo.create({ offerId, itemId }));
  }

  async removeOfferItem(offerItemId: string) {
    await this.offerItemRepo.delete(offerItemId);
    return { message: 'Item removed from offer' };
  }

  // ─── Promotion Banners ────────────────────────────────────────────────────

  getActivePromotionBanners() {
    const now = new Date();
    return this.promoRepo.createQueryBuilder('pb')
      .where('pb.status = true')
      .andWhere('(pb.startDate IS NULL OR pb.startDate <= :now)', { now })
      .andWhere('(pb.endDate IS NULL OR pb.endDate >= :now)', { now })
      .orderBy('pb.sortOrder', 'ASC')
      .getMany();
  }

  getAllPromotionBanners() {
    return this.promoRepo.find({ order: { sortOrder: 'ASC', createdAt: 'DESC' } });
  }

  async createPromotionBanner(data: Partial<PromotionBanner>) {
    return this.promoRepo.save(this.promoRepo.create(data));
  }

  async updatePromotionBanner(id: string, data: Partial<PromotionBanner>) {
    const promo = await this.promoRepo.findOne({ where: { id } });
    if (!promo) throw new NotFoundException('Promotion banner not found');
    await this.promoRepo.update(id, data);
    return this.promoRepo.findOne({ where: { id } });
  }

  async deletePromotionBanner(id: string) {
    await this.promoRepo.delete(id);
    return { message: 'Promotion banner deleted' };
  }
}
