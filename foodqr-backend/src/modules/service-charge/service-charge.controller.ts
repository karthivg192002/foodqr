import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ServiceChargeService, CreateServiceChargeDto } from './service-charge.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators';
import { UserRole } from '../../common/enums';

@ApiTags('Service Charge')
@Controller()
export class ServiceChargeController {
  constructor(private readonly serviceChargeService: ServiceChargeService) {}

  @Public()
  @Get('frontend/service-charges')
  findActive() { return this.serviceChargeService.findActive(); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Get('admin/service-charges')
  findAll() { return this.serviceChargeService.findAll(); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Post('admin/service-charges')
  create(@Body() dto: CreateServiceChargeDto) { return this.serviceChargeService.create(dto); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Patch('admin/service-charges/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateServiceChargeDto>,
  ) { return this.serviceChargeService.update(id, dto); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Patch('admin/service-charges/:id/set-default')
  setDefault(@Param('id', ParseUUIDPipe) id: string) {
    return this.serviceChargeService.setDefault(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Delete('admin/service-charges/:id')
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.serviceChargeService.remove(id); }
}
