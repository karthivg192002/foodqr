import { Controller, Get, Query, Sse, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OssService } from './oss.service';
import { OrdersService } from '../orders/orders.service';
import { EventsService } from '../events/events.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { UserRole } from '../../common/enums';

@ApiTags('OSS - Order Status Screen')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/oss')
export class OssController {
  constructor(
    private readonly ossService: OssService,
    private readonly ordersService: OrdersService,
    private readonly eventsService: EventsService,
  ) {}

  @Get('orders')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.STAFF)
  getOrders(@Query('branchId') branchId?: string) {
    return this.ossService.getOssOrders(branchId);
  }

  @Get('popular-items')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.STAFF)
  getPopularItems(@Query('branchId') branchId?: string) {
    return this.ordersService.getOssPopularItems(branchId);
  }

  /** SSE stream — emits whenever an order is created or status changes */
  @Sse('stream')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.STAFF)
  stream(@Query('branchId') branchId?: string): Observable<MessageEvent> {
    return this.eventsService.stream(branchId).pipe(
      map((event) => ({ data: JSON.stringify(event) }) as MessageEvent),
    );
  }
}
