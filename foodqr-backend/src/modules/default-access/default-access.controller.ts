import { Controller, Get, Post, Delete, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DefaultAccessService } from './default-access.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { UserRole } from '../../common/enums';

@ApiTags('Default Access')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/default-access')
export class DefaultAccessController {
  constructor(private readonly service: DefaultAccessService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() { return this.service.findAll(); }

  @Get('user/:userId')
  @Roles(UserRole.ADMIN)
  findByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.service.findByUser(userId);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  upsert(@Body() body: { userId: string; branchId?: string; resourceType?: string; resourceId?: string; permissions?: string[] }) {
    const { userId, ...dto } = body;
    return this.service.upsert(userId, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.service.remove(id); }
}
