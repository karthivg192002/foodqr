import {
  Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsSectionsService } from './analytics-sections.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { UserRole } from '../../common/enums';

@ApiTags('Analytics Sections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/analytics-sections')
@Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
export class AnalyticsSectionsController {
  constructor(private readonly service: AnalyticsSectionsService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Post()
  create(@Body() data: any) { return this.service.create(data); }

  @Patch('reorder')
  reorder(@Body() body: { ids: string[] }) { return this.service.reorder(body.ids); }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.service.remove(id); }
}
