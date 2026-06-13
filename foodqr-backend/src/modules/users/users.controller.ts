import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, ParseUUIDPipe, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto, UpdateDeviceTokenDto } from './dto/user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, CurrentUser } from '../../common/decorators';
import { UserRole } from '../../common/enums';
import { User } from './entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('admin/users')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  createUser(@Body() body: {
    name: string; email?: string; phone?: string; password: string;
    role?: UserRole; branchId?: string; countryCode?: string;
  }) {
    return this.usersService.createUser(body);
  }

  @Patch('admin/users/:id/password')
  @Roles(UserRole.ADMIN)
  changePassword(@Param('id', ParseUUIDPipe) id: string, @Body() body: { password: string }) {
    return this.usersService.changeUserPassword(id, body.password);
  }

  @Get('admin/customers')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  getCustomers(
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.usersService.getCustomers(search, page, limit);
  }

  @Get('admin/staff')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  getStaff(
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.usersService.getStaff(search, page, limit);
  }

  @Get('admin/users/:id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('admin/users/:id')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete('admin/users/:id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }

  @Patch('profile')
  updateProfile(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.id, dto);
  }

  @Patch('profile/device-token')
  updateDeviceToken(@CurrentUser() user: User, @Body() dto: UpdateDeviceTokenDto) {
    return this.usersService.updateDeviceToken(user.id, dto);
  }

  @Get('profile/default-branch')
  getDefaultBranch(@CurrentUser() user: User) {
    return this.usersService.getDefaultBranch(user.id);
  }

  @Patch('profile/default-branch')
  setDefaultBranch(@CurrentUser() user: User, @Body() body: { branchId: string }) {
    return this.usersService.setDefaultBranch(user.id, body.branchId);
  }

  @Patch('admin/users/:id/default-branch')
  @Roles(UserRole.ADMIN)
  setUserDefaultBranch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { branchId: string },
  ) {
    return this.usersService.setDefaultBranch(id, body.branchId);
  }

  /** Returns all defined roles with descriptions */
  @Get('admin/roles')
  @Roles(UserRole.ADMIN)
  getRoles() {
    return {
      roles: [
        { value: UserRole.ADMIN, label: 'Admin', description: 'Full system access — manages all settings, users, and reports' },
        { value: UserRole.BRANCH_MANAGER, label: 'Branch Manager', description: 'Manages a single branch — orders, staff, and settings' },
        { value: UserRole.WAITER, label: 'Waiter', description: 'Takes orders at the table, views dining orders' },
        { value: UserRole.CHEF, label: 'Chef', description: 'Views and updates KDS order status' },
        { value: UserRole.STAFF, label: 'Staff', description: 'General staff — limited order access' },
        { value: UserRole.POS_OPERATOR, label: 'POS Operator', description: 'Operates the point-of-sale terminal' },
        { value: UserRole.CUSTOMER, label: 'Customer', description: 'End-customer account for ordering and loyalty' },
      ],
    };
  }

  /** Assign a role to a specific user */
  @Patch('admin/users/:id/role')
  @Roles(UserRole.ADMIN)
  assignRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { role: UserRole },
  ) {
    return this.usersService.update(id, { role: body.role } as any);
  }
}
