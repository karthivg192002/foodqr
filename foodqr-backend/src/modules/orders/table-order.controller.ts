import {
  Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators';
import { OrdersService } from './orders.service';
import { DiningTablesService } from '../dining-tables/dining-tables.service';
import { CreateOrderDto } from './dto/order.dto';
import { OrderType } from '../../common/enums/index';

/**
 * Public table-ordering endpoints consumed when a customer scans a QR code.
 * No authentication required — orders are linked to the table's branchId/diningTableId.
 */
@ApiTags('Table Ordering (QR)')
@Controller('table')
export class TableOrderController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly diningTablesService: DiningTablesService,
  ) {}

  /** Resolve a table by its QR slug → returns table info including branchId */
  @Public()
  @Get('dining-tables/:slug')
  getTableBySlug(@Param('slug') slug: string) {
    return this.diningTablesService.findBySlug(slug);
  }

  /** List all tables for a branch (used for table selection UI) */
  @Public()
  @Get('dining-tables')
  listTables(@Query('branchId') branchId?: string) {
    return this.diningTablesService.findAll(branchId);
  }

  /** Place a dine-in order from the table QR flow */
  @Public()
  @Post('orders')
  @HttpCode(HttpStatus.CREATED)
  placeTableOrder(@Body() dto: CreateOrderDto & { guestName?: string }) {
    const payload: CreateOrderDto = { ...dto, orderType: OrderType.DINING_TABLE };
    return this.ordersService.create(dto.userId || 'guest', payload);
  }

  /** Track a table order by its token (shown on the receipt / confirmation screen) */
  @Public()
  @Get('orders/:token')
  trackOrder(@Param('token') token: string) {
    return this.ordersService.findByToken(token);
  }

  /** Customer cancels a pending table order */
  @Public()
  @Post('orders/:id/cancel')
  @HttpCode(HttpStatus.OK)
  cancelTableOrder(
    @Param('id') id: string,
    @Body() body: { userId: string; reason?: string },
  ) {
    return this.ordersService.cancelOrder(body.userId, id, body.reason);
  }

  /** Active orders on a given table (for the OSS / waiter view) */
  @Public()
  @Get('active-orders')
  getActiveTableOrders(@Query('diningTableId') diningTableId: string) {
    return this.ordersService.findAll({
      orderType: OrderType.DINING_TABLE,
      diningTableId,
    } as any);
  }
}
