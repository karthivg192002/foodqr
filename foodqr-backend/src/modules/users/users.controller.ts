import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, ParseUUIDPipe, ParseIntPipe, DefaultValuePipe, Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto, UpdateDeviceTokenDto } from './dto/user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, CurrentUser, Public } from '../../common/decorators';
import { UserRole } from '../../common/enums';
import { User } from './entities/user.entity';

const COUNTRY_CODES = [
  { name: 'Afghanistan', code: 'AF', dialCode: '+93' },
  { name: 'Albania', code: 'AL', dialCode: '+355' },
  { name: 'Algeria', code: 'DZ', dialCode: '+213' },
  { name: 'Argentina', code: 'AR', dialCode: '+54' },
  { name: 'Australia', code: 'AU', dialCode: '+61' },
  { name: 'Austria', code: 'AT', dialCode: '+43' },
  { name: 'Bahrain', code: 'BH', dialCode: '+973' },
  { name: 'Bangladesh', code: 'BD', dialCode: '+880' },
  { name: 'Belgium', code: 'BE', dialCode: '+32' },
  { name: 'Brazil', code: 'BR', dialCode: '+55' },
  { name: 'Canada', code: 'CA', dialCode: '+1' },
  { name: 'China', code: 'CN', dialCode: '+86' },
  { name: 'Denmark', code: 'DK', dialCode: '+45' },
  { name: 'Egypt', code: 'EG', dialCode: '+20' },
  { name: 'Finland', code: 'FI', dialCode: '+358' },
  { name: 'France', code: 'FR', dialCode: '+33' },
  { name: 'Germany', code: 'DE', dialCode: '+49' },
  { name: 'Ghana', code: 'GH', dialCode: '+233' },
  { name: 'Greece', code: 'GR', dialCode: '+30' },
  { name: 'India', code: 'IN', dialCode: '+91' },
  { name: 'Indonesia', code: 'ID', dialCode: '+62' },
  { name: 'Iran', code: 'IR', dialCode: '+98' },
  { name: 'Iraq', code: 'IQ', dialCode: '+964' },
  { name: 'Ireland', code: 'IE', dialCode: '+353' },
  { name: 'Israel', code: 'IL', dialCode: '+972' },
  { name: 'Italy', code: 'IT', dialCode: '+39' },
  { name: 'Japan', code: 'JP', dialCode: '+81' },
  { name: 'Jordan', code: 'JO', dialCode: '+962' },
  { name: 'Kenya', code: 'KE', dialCode: '+254' },
  { name: 'Kuwait', code: 'KW', dialCode: '+965' },
  { name: 'Lebanon', code: 'LB', dialCode: '+961' },
  { name: 'Libya', code: 'LY', dialCode: '+218' },
  { name: 'Malaysia', code: 'MY', dialCode: '+60' },
  { name: 'Maldives', code: 'MV', dialCode: '+960' },
  { name: 'Mexico', code: 'MX', dialCode: '+52' },
  { name: 'Morocco', code: 'MA', dialCode: '+212' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31' },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64' },
  { name: 'Nigeria', code: 'NG', dialCode: '+234' },
  { name: 'Norway', code: 'NO', dialCode: '+47' },
  { name: 'Oman', code: 'OM', dialCode: '+968' },
  { name: 'Pakistan', code: 'PK', dialCode: '+92' },
  { name: 'Philippines', code: 'PH', dialCode: '+63' },
  { name: 'Poland', code: 'PL', dialCode: '+48' },
  { name: 'Portugal', code: 'PT', dialCode: '+351' },
  { name: 'Qatar', code: 'QA', dialCode: '+974' },
  { name: 'Romania', code: 'RO', dialCode: '+40' },
  { name: 'Russia', code: 'RU', dialCode: '+7' },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966' },
  { name: 'Singapore', code: 'SG', dialCode: '+65' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27' },
  { name: 'South Korea', code: 'KR', dialCode: '+82' },
  { name: 'Spain', code: 'ES', dialCode: '+34' },
  { name: 'Sri Lanka', code: 'LK', dialCode: '+94' },
  { name: 'Sweden', code: 'SE', dialCode: '+46' },
  { name: 'Switzerland', code: 'CH', dialCode: '+41' },
  { name: 'Syria', code: 'SY', dialCode: '+963' },
  { name: 'Taiwan', code: 'TW', dialCode: '+886' },
  { name: 'Thailand', code: 'TH', dialCode: '+66' },
  { name: 'Tunisia', code: 'TN', dialCode: '+216' },
  { name: 'Turkey', code: 'TR', dialCode: '+90' },
  { name: 'UAE', code: 'AE', dialCode: '+971' },
  { name: 'Ukraine', code: 'UA', dialCode: '+380' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44' },
  { name: 'United States', code: 'US', dialCode: '+1' },
  { name: 'Vietnam', code: 'VN', dialCode: '+84' },
  { name: 'Yemen', code: 'YE', dialCode: '+967' },
];

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

  @Patch('profile/preferences')
  updatePreferences(
    @CurrentUser() user: User,
    @Body() body: { dietaryPreferences?: string[]; cuisinePreferences?: string[] },
  ) {
    return this.usersService.update(user.id, body as any);
  }

  @Get('profile/preferences')
  getPreferences(@CurrentUser() user: User) {
    return this.usersService.findOne(user.id).then((u) => ({
      dietaryPreferences: u.dietaryPreferences || [],
      cuisinePreferences: u.cuisinePreferences || [],
    }));
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
        { value: UserRole.SUPER_ADMIN, label: 'Super Admin', description: 'Platform owner — manages all tenants, plans, and global configuration' },
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

  /** Returns all country dial codes for phone number inputs */
  @Public()
  @Get('country-codes')
  getCountryCodes() {
    return { data: COUNTRY_CODES };
  }

  /** Administrator-specific list (admin-only — mirrors super-admin access in the legacy system) */
  @Get('admin/administrators')
  @Roles(UserRole.ADMIN)
  getAdministrators(@Query('search') search?: string, @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number, @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number) {
    return this.usersService.getByRole(UserRole.ADMIN, search, page, limit);
  }

  /** Waiter-specific list, create, update, delete, password change, image, order history */
  @Get('admin/waiters')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  getWaiters(@Query('search') search?: string, @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number, @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number) {
    return this.usersService.getByRole(UserRole.WAITER, search, page, limit);
  }

  @Get('admin/waiters/:id/orders')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  getWaiterOrders(@Param('id', ParseUUIDPipe) id: string, @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number, @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number) {
    return this.usersService.getStaffOrders(id, page, limit);
  }

  /** Chef-specific */
  @Get('admin/chefs')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  getChefs(@Query('search') search?: string, @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number, @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number) {
    return this.usersService.getByRole(UserRole.CHEF, search, page, limit);
  }

  @Get('admin/chefs/:id/orders')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  getChefOrders(@Param('id', ParseUUIDPipe) id: string, @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number, @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number) {
    return this.usersService.getStaffOrders(id, page, limit);
  }

  /** POS Operator-specific */
  @Get('admin/pos-operators')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  getPosOperators(@Query('search') search?: string, @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number, @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number) {
    return this.usersService.getByRole(UserRole.POS_OPERATOR, search, page, limit);
  }

  /** Branch Manager-specific */
  @Get('admin/branch-managers')
  @Roles(UserRole.ADMIN)
  getBranchManagers(@Query('search') search?: string, @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number, @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number) {
    return this.usersService.getByRole(UserRole.BRANCH_MANAGER, search, page, limit);
  }

  /** Export staff list (all non-customer roles) to Excel */
  @Get('admin/staff/export/excel')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  async exportStaffExcel(@Res() res: any) {
    return this.usersService.exportStaffExcel(res);
  }

  /** Admin views/manages customer addresses */
  @Get('admin/customers/:id/addresses')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  getCustomerAddresses(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getUserAddresses(id);
  }

  /** Admin views/manages staff addresses */
  @Get('admin/staff/:id/addresses')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  getStaffAddresses(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getUserAddresses(id);
  }

  /** Admin view of a customer's order history */
  @Get('admin/customers/:id/orders')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  getCustomerOrders(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.usersService.getCustomerOrders(id, page, limit);
  }

  /** Admin updates a customer/user's profile image */
  @Patch('admin/users/:id/image')
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  changeImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { profileImage: string },
  ) {
    return this.usersService.update(id, { profileImage: body.profileImage } as any);
  }
}
