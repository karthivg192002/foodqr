import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NavMenusService } from './nav-menus.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { UserRole } from '../../common/enums';
import { NavMenu } from './entities/nav-menu.entity';

@ApiTags('NavMenus')
@Controller('admin/nav-menus')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NavMenusController {
  constructor(private readonly service: NavMenusService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() { return this.service.findAll(); }

  @Get('my-nav')
  getMyNav(@Request() req: any) {
    return this.service.findForRole(req.user.role);
  }

  @Post('seed')
  @Roles(UserRole.ADMIN)
  seed(@Query('force') force?: string) {
    return this.service.seed(force === 'true');
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: Partial<NavMenu>) { return this.service.create(dto); }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: Partial<NavMenu>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
