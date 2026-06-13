import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ItemAddonsService } from './item-addons.service';

@ApiTags('Item Addons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('item-addons')
export class ItemAddonsController {
  constructor(private readonly service: ItemAddonsService) {}

  @Get('item/:itemId')
  findByItem(@Param('itemId') itemId: string) { return this.service.findByItem(itemId); }

  @Post()
  create(@Body() body: { itemId: string; addonItemId: string; addonItemVariation?: object }) {
    return this.service.create(body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
