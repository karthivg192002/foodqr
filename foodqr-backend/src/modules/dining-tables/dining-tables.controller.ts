import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { DiningTablesService, CreateDiningTableDto } from './dining-tables.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators';
import { UserRole, TableStatus } from '../../common/enums';

@ApiTags('Dining Tables')
@Controller()
export class DiningTablesController {
  constructor(
    private readonly diningTablesService: DiningTablesService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Get('frontend/dining-tables')
  findAll(@Query('branchId') branchId?: string) {
    return this.diningTablesService.findAll(branchId);
  }

  @Public()
  @Get('frontend/dining-tables/slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.diningTablesService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.WAITER)
  @ApiBearerAuth()
  @Get('admin/dining-tables')
  findAllAdmin(@Query('branchId') branchId?: string) {
    return this.diningTablesService.findAll(branchId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Post('admin/dining-tables')
  create(@Body() dto: CreateDiningTableDto) {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:4200');
    return this.diningTablesService.create(dto, frontendUrl);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Patch('admin/dining-tables/:id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateDiningTableDto>) {
    return this.diningTablesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Post('admin/dining-tables/:id/regenerate-qr')
  regenerateQr(@Param('id', ParseUUIDPipe) id: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:4200');
    return this.diningTablesService.regenerateQr(id, frontendUrl);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.WAITER)
  @ApiBearerAuth()
  @Patch('admin/dining-tables/:id/status')
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body('status') status: TableStatus) {
    return this.diningTablesService.updateStatus(id, status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Delete('admin/dining-tables/:id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.diningTablesService.remove(id);
  }

  /** Regenerate the session access token for a table */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Post('admin/dining-tables/:id/regenerate-token')
  regenerateToken(@Param('id', ParseUUIDPipe) id: string) {
    return this.diningTablesService.regenerateToken(id);
  }

  /** Assign a waiter to a dining table */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Patch('admin/dining-tables/:id/waiter')
  assignWaiter(@Param('id', ParseUUIDPipe) id: string, @Body('waiterId') waiterId: string) {
    return this.diningTablesService.update(id, { waiterId });
  }

  /** Export dining tables to Excel */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Get('admin/dining-tables/export/excel')
  async exportExcel(@Query('branchId') branchId: string, @Res() res: Response) {
    return this.diningTablesService.exportExcel(branchId, res);
  }
}
