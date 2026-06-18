import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseUUIDPipe, UploadedFile, UseInterceptors, Res } from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OffersService } from './offers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators';
import { UserRole } from '../../common/enums';

@ApiTags('Offers & Banners')
@Controller()
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Public() @Get('frontend/offers') getActiveOffers() { return this.offersService.getActiveOffers(); }
  @Public() @Get('frontend/banners') getActiveBanners() { return this.offersService.getActiveBanners(); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) @ApiBearerAuth()
  @Get('admin/offers') getAllOffers() { return this.offersService.getAllOffers(); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) @ApiBearerAuth()
  @Post('admin/offers') createOffer(@Body() data: any) { return this.offersService.createOffer(data); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) @ApiBearerAuth()
  @Patch('admin/offers/:id') updateOffer(@Param('id', ParseUUIDPipe) id: string, @Body() data: any) { return this.offersService.updateOffer(id, data); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) @ApiBearerAuth()
  @Delete('admin/offers/:id') deleteOffer(@Param('id', ParseUUIDPipe) id: string) { return this.offersService.deleteOffer(id); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) @ApiBearerAuth()
  @Patch('admin/offers/:id/image')
  updateOfferImage(@Param('id', ParseUUIDPipe) id: string, @Body() body: { image: string }) {
    return this.offersService.updateOffer(id, { image: body.image });
  }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) @ApiBearerAuth()
  @Post('admin/offers/:id/upload-image')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/offers',
      filename: (_req, file, cb) => cb(null, `offer-${Date.now()}${extname(file.originalname)}`),
    }),
  }))
  uploadOfferImage(@Param('id', ParseUUIDPipe) id: string, @UploadedFile() file: Express.Multer.File) {
    const imageUrl = `/uploads/offers/${file.filename}`;
    return this.offersService.updateOffer(id, { image: imageUrl });
  }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) @ApiBearerAuth()
  @Get('admin/banners') getAllBanners() { return this.offersService.getAllBanners(); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) @ApiBearerAuth()
  @Post('admin/banners') createBanner(@Body() data: any) { return this.offersService.createBanner(data); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) @ApiBearerAuth()
  @Patch('admin/banners/:id') updateBanner(@Param('id', ParseUUIDPipe) id: string, @Body() data: any) { return this.offersService.updateBanner(id, data); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) @ApiBearerAuth()
  @Delete('admin/banners/:id') deleteBanner(@Param('id', ParseUUIDPipe) id: string) { return this.offersService.deleteBanner(id); }

  // Offer Items
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) @ApiBearerAuth()
  @Get('admin/offers/:id/items') getOfferItems(@Param('id', ParseUUIDPipe) id: string) { return this.offersService.getOfferItems(id); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) @ApiBearerAuth()
  @Post('admin/offers/:id/items') addOfferItem(@Param('id', ParseUUIDPipe) id: string, @Body() body: { itemId: string }) { return this.offersService.addOfferItem(id, body.itemId); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) @ApiBearerAuth()
  @Delete('admin/offers/items/:offerItemId') removeOfferItem(@Param('offerItemId', ParseUUIDPipe) offerItemId: string) { return this.offersService.removeOfferItem(offerItemId); }

  // ─── Promotion Banners ────────────────────────────────────────────────────
  @Public() @Get('frontend/promotion-banners') getActivePromoBanners() { return this.offersService.getActivePromotionBanners(); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) @ApiBearerAuth()
  @Get('admin/promotion-banners') getAllPromoBanners() { return this.offersService.getAllPromotionBanners(); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) @ApiBearerAuth()
  @Post('admin/promotion-banners') createPromoBanner(@Body() data: any) { return this.offersService.createPromotionBanner(data); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) @ApiBearerAuth()
  @Patch('admin/promotion-banners/:id') updatePromoBanner(@Param('id', ParseUUIDPipe) id: string, @Body() data: any) { return this.offersService.updatePromotionBanner(id, data); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) @ApiBearerAuth()
  @Delete('admin/promotion-banners/:id') deletePromoBanner(@Param('id', ParseUUIDPipe) id: string) { return this.offersService.deletePromotionBanner(id); }

  /** Export offers to Excel */
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) @ApiBearerAuth()
  @Get('admin/offers/export/excel')
  async exportOffersExcel(@Res() res: Response) {
    return this.offersService.exportOffersExcel(res);
  }
}
