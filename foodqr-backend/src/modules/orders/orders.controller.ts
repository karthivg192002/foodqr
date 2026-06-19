import {
  Controller, Get, Post, Patch, Body, Param, Query, Res,
  UseGuards, ParseUUIDPipe, DefaultValuePipe, ParseIntPipe, ParseFloatPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, CurrentUser, Public } from '../../common/decorators';
import { UserRole } from '../../common/enums';
import { User } from '../users/entities/user.entity';

@ApiTags('Orders')
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('orders')
  create(@CurrentUser() user: User, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.WAITER, UserRole.STAFF)
  @ApiBearerAuth()
  @Get('admin/orders')
  findAll(
    @Query('status') status?: string,
    @Query('orderType') orderType?: string,
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.ordersService.findAll({ status, orderType, search, page, limit });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('orders/my-orders')
  getMyOrders(
    @CurrentUser() user: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.ordersService.getCustomerOrders(user.id, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('orders/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @Public()
  @Get('orders/track/:token')
  trackByToken(@Param('token') token: string) {
    return this.ordersService.findByToken(token);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.WAITER, UserRole.CHEF, UserRole.STAFF)
  @ApiBearerAuth()
  @Patch('admin/orders/:id/status')
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Get('admin/dashboard/stats')
  getDashboardStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.ordersService.getDashboardStats(startDate, endDate);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('orders/:id/cancel')
  cancelOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() body: { reason?: string },
  ) {
    return this.ordersService.cancelOrder(user.id, id, body.reason);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Patch('admin/orders/:id/assign-delivery-boy')
  assignDeliveryBoy(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { deliveryBoyId: string },
  ) {
    return this.ordersService.assignDeliveryBoy(id, body.deliveryBoyId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.STAFF)
  @ApiBearerAuth()
  @Get('admin/delivery-boy/:deliveryBoyId/orders')
  getDeliveryBoyOrders(
    @Param('deliveryBoyId', ParseUUIDPipe) deliveryBoyId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.ordersService.getOrdersByDeliveryBoy(deliveryBoyId, page, limit);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.WAITER, UserRole.CHEF, UserRole.STAFF, UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Get('staff/dashboard')
  getStaffDashboard(@CurrentUser() user: User) {
    return this.ordersService.getStaffDashboardWithKds(user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.POS_OPERATOR, UserRole.STAFF)
  @ApiBearerAuth()
  @Get('admin/orders/:id/pos-change')
  getPosChange(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('received', ParseFloatPipe) received: number,
  ) {
    return this.ordersService.findOne(id).then((order) =>
      this.ordersService.posChangeCalc(Number(order.total), received),
    );
  }

  /** Assign or update the serving staff on a table order */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.WAITER)
  @ApiBearerAuth()
  @Patch('admin/orders/:id/staff')
  changeOrderStaff(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { staffId: string },
  ) {
    return this.ordersService.changeOrderStaff(id, body.staffId);
  }

  /** Admin toggles payment status on any order */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Patch('admin/orders/:id/payment-status')
  changePaymentStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { paymentStatus: string },
  ) {
    return this.ordersService.changePaymentStatus(id, body.paymentStatus as any);
  }

  /** Export dine-in (table) orders to Excel */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiBearerAuth()
  @Get('admin/orders/export/dining-tables')
  async exportTableOrders(@Res() res: Response) {
    return this.ordersService.exportTableOrdersExcel(res);
  }

  /** POS-only orders view */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.POS_OPERATOR)
  @ApiBearerAuth()
  @Get('admin/pos/orders')
  getPosOrders(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.ordersService.findAll({ status, search, page, limit, orderType: 'pos' });
  }
}
