import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ItemExtrasService, CreateItemExtraDto } from './item-extras.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles, Public } from '../../../common/decorators';
import { UserRole } from '../../../common/enums';

@ApiTags('Menu - Item Extras')
@Controller()
export class ItemExtrasController {
  constructor(private readonly itemExtrasService: ItemExtrasService) {}

  @Public()
  @Get('frontend/items/:itemId/extras')
  findForFrontend(@Param('itemId', ParseUUIDPipe) itemId: string) {
    return this.itemExtrasService.findByItem(itemId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Get('admin/items/:itemId/extras')
  findForAdmin(@Param('itemId', ParseUUIDPipe) itemId: string) {
    return this.itemExtrasService.findByItemAdmin(itemId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Post('admin/items/:itemId/extras')
  create(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: CreateItemExtraDto,
  ) {
    return this.itemExtrasService.create(itemId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Patch('admin/items/extras/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateItemExtraDto>,
  ) {
    return this.itemExtrasService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Delete('admin/items/extras/:id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.itemExtrasService.remove(id);
  }
}
