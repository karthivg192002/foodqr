import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
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
  @Get('admin/banners') getAllBanners() { return this.offersService.getAllBanners(); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) @ApiBearerAuth()
  @Post('admin/banners') createBanner(@Body() data: any) { return this.offersService.createBanner(data); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) @ApiBearerAuth()
  @Patch('admin/banners/:id') updateBanner(@Param('id', ParseUUIDPipe) id: string, @Body() data: any) { return this.offersService.updateBanner(id, data); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) @ApiBearerAuth()
  @Delete('admin/banners/:id') deleteBanner(@Param('id', ParseUUIDPipe) id: string) { return this.offersService.deleteBanner(id); }
}
