import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseUUIDPipe, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BranchesService, CreateBranchDto } from './branches.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public, CurrentUser } from '../../common/decorators';
import { UserRole } from '../../common/enums';
import { User } from '../users/entities/user.entity';

@ApiTags('Branches')
@Controller()
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Public()
  @Get('frontend/branches')
  findAll() { return this.branchesService.findAll(); }

  @Public()
  @Get('frontend/branches/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.branchesService.findOne(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Get('admin/branches')
  findAllAdmin(@CurrentUser() user: User) { return this.branchesService.findAll(user.tenantId); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Post('admin/branches')
  create(@Body() dto: CreateBranchDto, @CurrentUser() user: User) {
    return this.branchesService.create(dto, user.tenantId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Patch('admin/branches/:id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateBranchDto>, @CurrentUser() user: User) {
    return this.branchesService.update(id, dto, user.tenantId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Patch('admin/branches/:id/set-default')
  setDefault(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.branchesService.setDefault(id, user.tenantId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Delete('admin/branches/:id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.branchesService.remove(id, user.tenantId);
  }

  /** Export branches to Excel */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Get('admin/branches/export/excel')
  async exportExcel(@Res() res: Response) {
    return this.branchesService.exportExcel(res);
  }
}
