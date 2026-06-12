import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { Banner } from './entities/banner.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer) private offerRepo: Repository<Offer>,
    @InjectRepository(Banner) private bannerRepo: Repository<Banner>,
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
}
