import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { UserRole } from '../../common/enums';
import { RoleDefinitionsService } from './role-definitions.service';

@Controller('admin/role-definitions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoleDefinitionsController {
  constructor(private service: RoleDefinitionsService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.service.findAll();
  }

  // Accessible by any authenticated user for role dropdowns
  @Get('public')
  findActive() {
    return this.service.findActive();
  }

  @Post('seed')
  @Roles(UserRole.ADMIN)
  seed(@Query('force') force?: string) {
    return this.service.seed(force === 'true');
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: any) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  /** Get full permissions matrix for a role */
  @Get(':id/permissions')
  @Roles(UserRole.ADMIN)
  getPermissions(@Param('id') id: string) {
    return this.service.getPermissions(id);
  }

  /** Set all permissions for a role at once */
  @Patch(':id/permissions')
  @Roles(UserRole.ADMIN)
  setPermissions(@Param('id') id: string, @Body() body: { permissions: Record<string, boolean> }) {
    return this.service.setPermissions(id, body.permissions);
  }

  /** Toggle a single permission on/off */
  @Patch(':id/permissions/:permission')
  @Roles(UserRole.ADMIN)
  togglePermission(@Param('id') id: string, @Param('permission') permission: string, @Body() body: { enabled: boolean }) {
    return this.service.togglePermission(id, permission, body.enabled);
  }

  /** Returns the list of all available permission keys */
  @Get('available-permissions')
  @Roles(UserRole.ADMIN)
  getAvailablePermissions() {
    return this.service.getAvailablePermissions();
  }
}
