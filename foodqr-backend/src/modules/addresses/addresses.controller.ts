import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AddressesService } from './addresses.service';

@ApiTags('Addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly service: AddressesService) {}

  @Get()
  findAll(@Request() req) { return this.service.findByUser(req.user.sub); }

  @Post()
  create(@Request() req, @Body() body: { label: string; address: string; apartment?: string; latitude?: string; longitude?: string; isDefault?: boolean }) {
    return this.service.create(req.user.sub, body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Request() req, @Body() body: any) {
    return this.service.update(id, req.user.sub, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.service.remove(id, req.user.sub);
  }
}
