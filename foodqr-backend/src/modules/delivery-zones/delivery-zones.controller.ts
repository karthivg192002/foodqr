import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { DeliveryZonesService } from './delivery-zones.service';
import { DeliveryZone } from './entities/delivery-zone.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators';
import { UserRole } from '../../common/enums';

@Controller()
export class DeliveryZonesController {
  constructor(private readonly service: DeliveryZonesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @Get('admin/delivery-zones')
  findAll(@Query('branchId') branchId?: string) {
    return this.service.findAll(branchId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @Get('admin/delivery-zones/:id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @Post('admin/delivery-zones')
  create(@Body() body: Partial<DeliveryZone>) {
    return this.service.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @Patch('admin/delivery-zones/:id')
  update(@Param('id') id: string, @Body() body: Partial<DeliveryZone>) {
    return this.service.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('admin/delivery-zones/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Public()
  @Post('frontend/delivery-zones/check')
  async checkDelivery(
    @Body() body: { lat: number; lng: number; branchId?: string },
  ) {
    const zone = await this.service.findZoneForPoint(body.lat, body.lng, body.branchId);
    if (!zone) {
      return { available: false, message: 'Address is outside our delivery area' };
    }
    return {
      available: true,
      zone: {
        id: zone.id,
        name: zone.name,
        baseCharge: zone.baseCharge,
        perKmCharge: zone.perKmCharge,
        minOrderAmount: zone.minOrderAmount,
        estimatedDeliveryMinutes: zone.estimatedDeliveryMinutes,
      },
    };
  }

  @Public()
  @Get('frontend/delivery-zones')
  getActiveZones(@Query('branchId') branchId?: string) {
    return this.service.findAll(branchId).then((zones) =>
      zones.filter((z) => z.isActive).map((z) => ({
        id: z.id,
        name: z.name,
        polygon: z.polygon,
        baseCharge: z.baseCharge,
        minOrderAmount: z.minOrderAmount,
        estimatedDeliveryMinutes: z.estimatedDeliveryMinutes,
      })),
    );
  }
}
