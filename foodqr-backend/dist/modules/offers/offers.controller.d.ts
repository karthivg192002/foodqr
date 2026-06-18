import { Response } from 'express';
import { OffersService } from './offers.service';
export declare class OffersController {
    private readonly offersService;
    constructor(offersService: OffersService);
    getActiveOffers(): Promise<import("./entities/offer.entity").Offer[]>;
    getActiveBanners(): Promise<import("./entities/banner.entity").Banner[]>;
    getAllOffers(): Promise<import("./entities/offer.entity").Offer[]>;
    createOffer(data: any): Promise<import("./entities/offer.entity").Offer>;
    updateOffer(id: string, data: any): Promise<import("./entities/offer.entity").Offer>;
    deleteOffer(id: string): Promise<{
        message: string;
    }>;
    updateOfferImage(id: string, body: {
        image: string;
    }): Promise<import("./entities/offer.entity").Offer>;
    uploadOfferImage(id: string, file: Express.Multer.File): Promise<import("./entities/offer.entity").Offer>;
    getAllBanners(): Promise<import("./entities/banner.entity").Banner[]>;
    createBanner(data: any): Promise<import("./entities/banner.entity").Banner>;
    updateBanner(id: string, data: any): Promise<import("./entities/banner.entity").Banner>;
    deleteBanner(id: string): Promise<{
        message: string;
    }>;
    getOfferItems(id: string): Promise<import("./entities/offer-item.entity").OfferItem[]>;
    addOfferItem(id: string, body: {
        itemId: string;
    }): Promise<import("./entities/offer-item.entity").OfferItem>;
    removeOfferItem(offerItemId: string): Promise<{
        message: string;
    }>;
    getActivePromoBanners(): Promise<import("./entities/promotion-banner.entity").PromotionBanner[]>;
    getAllPromoBanners(): Promise<import("./entities/promotion-banner.entity").PromotionBanner[]>;
    createPromoBanner(data: any): Promise<import("./entities/promotion-banner.entity").PromotionBanner>;
    updatePromoBanner(id: string, data: any): Promise<import("./entities/promotion-banner.entity").PromotionBanner>;
    deletePromoBanner(id: string): Promise<{
        message: string;
    }>;
    exportOffersExcel(res: Response): Promise<void>;
}
