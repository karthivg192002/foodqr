import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TaxService, CreateTaxDto } from './tax.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators';
import { UserRole } from '../../common/enums';

@ApiTags('Tax')
@Controller()
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @Public()
  @Get('frontend/taxes')
  findActive() { return this.taxService.findActive(); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Get('admin/taxes')
  findAll() { return this.taxService.findAll(); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Post('admin/taxes')
  create(@Body() dto: CreateTaxDto) { return this.taxService.create(dto); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Patch('admin/taxes/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateTaxDto>,
  ) { return this.taxService.update(id, dto); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Patch('admin/taxes/:id/set-default')
  setDefault(@Param('id', ParseUUIDPipe) id: string) {
    return this.taxService.setDefault(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Delete('admin/taxes/:id')
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.taxService.remove(id); }
}
