import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MenuSectionsService } from './menu-sections.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators';
import { UserRole } from '../../common/enums';

@ApiTags('Menus & Sections')
@Controller()
export class MenuSectionsController {
  constructor(private readonly service: MenuSectionsService) {}

  // Frontend: public menu listing for QR display
  @Public() @Get('frontend/menus') getAllMenus() { return this.service.findAllMenus(); }
  @Public() @Get('frontend/menus/:id/sections') getMenuSections(@Param('id', ParseUUIDPipe) id: string) { return this.service.findSectionsByMenu(id); }

  // Admin CRUD
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER) @ApiBearerAuth()
  @Get('admin/menus') getMenus() { return this.service.findAllMenus(); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER) @ApiBearerAuth()
  @Post('admin/menus') createMenu(@Body() data: any) { return this.service.createMenu(data); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER) @ApiBearerAuth()
  @Patch('admin/menus/:id') updateMenu(@Param('id', ParseUUIDPipe) id: string, @Body() data: any) { return this.service.updateMenu(id, data); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER) @ApiBearerAuth()
  @Delete('admin/menus/:id') deleteMenu(@Param('id', ParseUUIDPipe) id: string) { return this.service.deleteMenu(id); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER) @ApiBearerAuth()
  @Get('admin/menus/:id/sections') getSections(@Param('id', ParseUUIDPipe) id: string) { return this.service.findSectionsByMenu(id); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER) @ApiBearerAuth()
  @Post('admin/menus/:id/sections') createSection(@Param('id', ParseUUIDPipe) id: string, @Body() data: any) { return this.service.createSection(id, data); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER) @ApiBearerAuth()
  @Patch('admin/menus/sections/:id') updateSection(@Param('id', ParseUUIDPipe) id: string, @Body() data: any) { return this.service.updateSection(id, data); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER) @ApiBearerAuth()
  @Delete('admin/menus/sections/:id') deleteSection(@Param('id', ParseUUIDPipe) id: string) { return this.service.deleteSection(id); }
}
