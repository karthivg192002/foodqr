import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { Tenant, TenantStatus } from './entities/tenant.entity';
import { SaasPlan } from './entities/saas-plan.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { UserRole } from '../../common/enums';

@ApiTags('Super Admin — Tenancy')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@Controller('super-admin')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  // ── Dashboard ──────────────────────────────────────────────────────────

  @Get('dashboard')
  @ApiOperation({ summary: 'Super-admin aggregate dashboard across all tenants' })
  getDashboard() {
    return this.tenantsService.getSuperAdminDashboard();
  }

  // ── Subscription Plans ─────────────────────────────────────────────────

  @Get('plans')
  @ApiOperation({ summary: 'List all subscription plans' })
  findAllPlans() {
    return this.tenantsService.findAllPlans();
  }

  @Post('plans')
  @ApiOperation({ summary: 'Create a subscription plan' })
  createPlan(@Body() data: Partial<SaasPlan>) {
    return this.tenantsService.createPlan(data);
  }

  @Patch('plans/:id')
  @ApiOperation({ summary: 'Update a subscription plan' })
  updatePlan(@Param('id', ParseUUIDPipe) id: string, @Body() data: Partial<SaasPlan>) {
    return this.tenantsService.updatePlan(id, data);
  }

  @Delete('plans/:id')
  @ApiOperation({ summary: 'Delete a subscription plan (must not be in use)' })
  removePlan(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantsService.removePlan(id);
  }

  // ── Tenants ────────────────────────────────────────────────────────────

  @Get('tenants')
  @ApiOperation({ summary: 'List all tenants with optional status filter' })
  findAll(@Query('status') status?: TenantStatus) {
    return this.tenantsService.findAll(status);
  }

  @Get('tenants/:id')
  @ApiOperation({ summary: 'Get a specific tenant' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantsService.findOne(id);
  }

  @Post('tenants')
  @ApiOperation({ summary: 'Create a new tenant' })
  create(@Body() data: Partial<Tenant>) {
    return this.tenantsService.create(data);
  }

  @Patch('tenants/:id')
  @ApiOperation({ summary: 'Update tenant details' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() data: Partial<Tenant>) {
    return this.tenantsService.update(id, data);
  }

  @Post('tenants/:id/suspend')
  @ApiOperation({ summary: 'Suspend a tenant' })
  suspend(@Param('id', ParseUUIDPipe) id: string, @Body() body: { reason?: string }) {
    return this.tenantsService.suspend(id, body.reason);
  }

  @Post('tenants/:id/activate')
  @ApiOperation({ summary: 'Activate / reinstate a suspended tenant' })
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantsService.activate(id);
  }

  @Post('tenants/:id/assign-plan')
  @ApiOperation({ summary: 'Assign a subscription plan to a tenant' })
  assignPlan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { planId: string; subscriptionMonths?: number },
  ) {
    return this.tenantsService.assignPlan(id, body.planId, body.subscriptionMonths || 1);
  }

  @Delete('tenants/:id')
  @ApiOperation({ summary: 'Permanently remove a tenant' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantsService.remove(id);
  }
}
