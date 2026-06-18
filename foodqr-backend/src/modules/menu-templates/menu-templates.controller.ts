import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MenuTemplatesService, CreateMenuTemplateDto } from './menu-templates.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { UserRole } from '../../common/enums';

@ApiTags('Menu Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/menu-templates')
export class MenuTemplatesController {
  constructor(private readonly service: MenuTemplatesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  findAll() { return this.service.findAll(); }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.service.findOne(id); }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateMenuTemplateDto) { return this.service.create(dto); }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateMenuTemplateDto>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.service.remove(id); }

  /** Apply a template to a branch */
  @Post(':id/apply')
  @Roles(UserRole.ADMIN)
  applyToBranch(@Param('id', ParseUUIDPipe) id: string, @Body() body: { branchId: string }) {
    return this.service.applyToBranch(id, body.branchId);
  }
}
