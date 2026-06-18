import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, Res,
  UseGuards, ParseUUIDPipe, DefaultValuePipe, ParseIntPipe,
  UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { memoryStorage } from 'multer';
import { ItemsService, CreateItemDto } from './items.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles, Public } from '../../../common/decorators';
import { UserRole } from '../../../common/enums';

@ApiTags('Menu - Items')
@Controller()
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Public()
  @Get('frontend/items')
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'page', required: false })
  findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.itemsService.findAll(search, categoryId, undefined, page, limit);
  }

  @Public()
  @Get('frontend/items/featured')
  getFeatured() { return this.itemsService.getFeatured(); }

  @Public()
  @Get('frontend/items/popular')
  getPopular() { return this.itemsService.getPopular(); }

  @Public()
  @Get('frontend/items/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.itemsService.findOne(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Get('admin/items')
  findAllAdmin(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.itemsService.findAllAdmin(search, categoryId, page, limit);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Post('admin/items')
  create(@Body() dto: CreateItemDto) { return this.itemsService.create(dto); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Patch('admin/items/:id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateItemDto>) {
    return this.itemsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Patch('admin/items/:id/toggle-status')
  toggleStatus(@Param('id', ParseUUIDPipe) id: string) { return this.itemsService.toggleStatus(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Patch('admin/items/:id/toggle-featured')
  toggleFeatured(@Param('id', ParseUUIDPipe) id: string) { return this.itemsService.toggleFeatured(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Delete('admin/items/:id')
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.itemsService.remove(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Post('admin/items/:id/restore')
  restore(@Param('id', ParseUUIDPipe) id: string) { return this.itemsService.restore(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Get('admin/items/archived')
  findArchived(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.itemsService.findAllWithDeleted(search, categoryId, page, limit);
  }

  /** Export all items as an Excel-compatible file */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Get('admin/items/export/excel')
  async exportExcel(@Res() res: Response) {
    return this.itemsService.exportExcel(res);
  }

  /** Download a sample CSV template for bulk import */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Get('admin/items/export/sample')
  downloadSample(@Res() res: Response) {
    const csv = ['name,description,price,categoryId,itemType,caution,ingredients,calories,protein,carbs,fat,taxRate,isFeatured,status',
      '"Sample Burger","Juicy beef burger",12.99,,non_veg,"Contains allergens","Beef, Lettuce, Tomato",450,30,35,18,5,false,true',
    ].join('\n');
    res.set({ 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="items-import-sample.csv"' });
    res.send(csv);
  }

  /** Bulk import items from CSV */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Post('admin/items/import')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async importCsv(@UploadedFile() file: Express.Multer.File) {
    return this.itemsService.importFromCsv(file.buffer.toString('utf-8'));
  }
}
