import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseUUIDPipe, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { memoryStorage } from 'multer';
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

  /** POS: get top-level categories with their sub-categories for drill-down */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.POS_OPERATOR, UserRole.STAFF)
  @ApiBearerAuth()
  @Get('admin/pos/categories')
  getPosCategories() { return this.categoriesService.findAll(true); }

  /** POS: get sub-categories of a specific category */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.POS_OPERATOR, UserRole.STAFF)
  @ApiBearerAuth()
  @Get('admin/pos/categories/:id/sub-categories')
  getPosSubCategories(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findOne(id).then((cat) => cat.children || []);
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

  /** Export all categories as Excel */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Get('admin/categories/export/excel')
  async exportExcel(@Res() res: Response) {
    return this.categoriesService.exportExcel(res);
  }

  /** Sample CSV for import */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Get('admin/categories/export/sample')
  downloadSample(@Res() res: Response) {
    const csv = ['name,description,parentCategoryId,status,variationOnly',
      '"Burgers","All burger options",,true,false',
      '"Veggie Burgers","Plant-based burgers",,true,false',
    ].join('\n');
    res.set({ 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="categories-import-sample.csv"' });
    res.send(csv);
  }

  /** Bulk import categories from CSV */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Post('admin/categories/import')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async importCsv(@UploadedFile() file: Express.Multer.File) {
    return this.categoriesService.importFromCsv(file.buffer.toString('utf-8'));
  }
}
