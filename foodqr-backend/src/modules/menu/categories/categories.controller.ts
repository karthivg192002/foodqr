import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService, CreateCategoryDto } from './categories.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles, Public } from '../../../common/decorators';
import { UserRole } from '../../../common/enums';

@ApiTags('Menu - Categories')
@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get('frontend/categories')
  findAll() { return this.categoriesService.findAll(); }

  @Public()
  @Get('frontend/categories/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.categoriesService.findOne(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Get('admin/categories')
  findAllAdmin() { return this.categoriesService.findAllFlat(); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Post('admin/categories')
  create(@Body() dto: CreateCategoryDto) { return this.categoriesService.create(dto); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Patch('admin/categories/:id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateCategoryDto>) {
    return this.categoriesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Patch('admin/categories/sort-order')
  updateSortOrder(@Body() items: Array<{ id: string; sortOrder: number }>) {
    return this.categoriesService.updateSortOrder(items);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Delete('admin/categories/:id')
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.categoriesService.remove(id); }
}
