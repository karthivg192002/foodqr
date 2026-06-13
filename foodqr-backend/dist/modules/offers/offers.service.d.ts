import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { Banner } from './entities/banner.entity';
import { OfferItem } from './entities/offer-item.entity';
export declare class OffersService {
    private offerRepo;
    private bannerRepo;
    private offerItemRepo;
    constructor(offerRepo: Repository<Offer>, bannerRepo: Repository<Banner>, offerItemRepo: Repository<OfferItem>);
    getActiveOffers(): Promise<Offer[]>;
    getAllOffers(): Promise<Offer[]>;
    createOffer(data: Partial<Offer>): Promise<Offer>;
    updateOffer(id: string, data: Partial<Offer>): Promise<Offer>;
    deleteOffer(id: string): Promise<{
        message: string;
    }>;
    getActiveBanners(): Promise<Banner[]>;
    getAllBanners(): Promise<Banner[]>;
    createBanner(data: Partial<Banner>): Promise<Banner>;
    updateBanner(id: string, data: Partial<Banner>): Promise<Banner>;
    deleteBanner(id: string): Promise<{
        message: string;
    }>;
    getOfferItems(offerId: string): Promise<OfferItem[]>;
    addOfferItem(offerId: string, itemId: string): Promise<OfferItem>;
    removeOfferItem(offerItemId: string): Promise<{
        message: string;
    }>;
}
