import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ItemAttributesService } from './item-attributes.service';

@ApiTags('Item Attributes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('item-attributes')
export class ItemAttributesController {
  constructor(private readonly service: ItemAttributesService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() body: { name: string; status?: boolean }) { return this.service.create(body); }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: { name?: string; status?: boolean }) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }

  @Get('category/:categoryId')
  getByCategory(@Param('categoryId') categoryId: string) {
    return this.service.getByCategory(categoryId);
  }

  @Post('category/:categoryId/assign')
  assignToCategory(@Param('categoryId') categoryId: string, @Body() body: { attributeIds: string[] }) {
    return this.service.assignToCategory(categoryId, body.attributeIds);
  }
}
