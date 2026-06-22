import { Controller, Get, Post, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { TenantBillingService } from './billing/tenant-billing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, CurrentUser } from '../../common/decorators';
import { UserRole } from '../../common/enums';
import { User } from '../users/entities/user.entity';

@ApiTags('Tenant Self-Service')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
@Controller('tenant-info')
export class TenantSelfController {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly billing: TenantBillingService,
  ) {}

  @Get('mine')
  @ApiOperation({ summary: "Current tenant admin's own subscription/plan status and usage" })
  getMine(@CurrentUser() user: User) {
    if (!user.tenantId) throw new NotFoundException('No tenant associated with this account');
    return this.tenantsService.getMyTenant(user.tenantId);
  }

  @Post('run-migration')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Run pending schema migrations against this tenant's own database" })
  runMigration(@CurrentUser() user: User) {
    if (!user.tenantId) throw new NotFoundException('No tenant associated with this account');
    return this.tenantsService.runMigration(user.tenantId);
  }

  @Get('invoices')
  @ApiOperation({ summary: "This tenant's billing/invoice history" })
  getInvoices(@CurrentUser() user: User) {
    if (!user.tenantId) throw new NotFoundException('No tenant associated with this account');
    return this.billing.listForTenant(user.tenantId);
  }
}
