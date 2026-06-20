"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const user_dto_1 = require("./dto/user.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const decorators_1 = require("../../common/decorators");
const enums_1 = require("../../common/enums");
const user_entity_1 = require("./entities/user.entity");
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
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    createUser(body) {
        return this.usersService.createUser(body);
    }
    changePassword(id, body) {
        return this.usersService.changeUserPassword(id, body.password);
    }
    getCustomers(search, page, limit) {
        return this.usersService.getCustomers(search, page, limit);
    }
    getStaff(search, page, limit) {
        return this.usersService.getStaff(search, page, limit);
    }
    findOne(id) {
        return this.usersService.findOne(id);
    }
    update(id, dto) {
        return this.usersService.update(id, dto);
    }
    remove(id) {
        return this.usersService.remove(id);
    }
    updateProfile(user, dto) {
        return this.usersService.update(user.id, dto);
    }
    updatePreferences(user, body) {
        return this.usersService.update(user.id, body);
    }
    getPreferences(user) {
        return this.usersService.findOne(user.id).then((u) => ({
            dietaryPreferences: u.dietaryPreferences || [],
            cuisinePreferences: u.cuisinePreferences || [],
        }));
    }
    updateDeviceToken(user, dto) {
        return this.usersService.updateDeviceToken(user.id, dto);
    }
    getDefaultBranch(user) {
        return this.usersService.getDefaultBranch(user.id);
    }
    setDefaultBranch(user, body) {
        return this.usersService.setDefaultBranch(user.id, body.branchId);
    }
    setUserDefaultBranch(id, body) {
        return this.usersService.setDefaultBranch(id, body.branchId);
    }
    getRoles() {
        return {
            roles: [
                { value: enums_1.UserRole.SUPER_ADMIN, label: 'Super Admin', description: 'Platform owner — manages all tenants, plans, and global configuration' },
                { value: enums_1.UserRole.ADMIN, label: 'Admin', description: 'Full system access — manages all settings, users, and reports' },
                { value: enums_1.UserRole.BRANCH_MANAGER, label: 'Branch Manager', description: 'Manages a single branch — orders, staff, and settings' },
                { value: enums_1.UserRole.WAITER, label: 'Waiter', description: 'Takes orders at the table, views dining orders' },
                { value: enums_1.UserRole.CHEF, label: 'Chef', description: 'Views and updates KDS order status' },
                { value: enums_1.UserRole.STAFF, label: 'Staff', description: 'General staff — limited order access' },
                { value: enums_1.UserRole.POS_OPERATOR, label: 'POS Operator', description: 'Operates the point-of-sale terminal' },
                { value: enums_1.UserRole.CUSTOMER, label: 'Customer', description: 'End-customer account for ordering and loyalty' },
            ],
        };
    }
    assignRole(id, body) {
        return this.usersService.update(id, { role: body.role });
    }
    getCountryCodes() {
        return { data: COUNTRY_CODES };
    }
    getAdministrators(search, page, limit) {
        return this.usersService.getByRole(enums_1.UserRole.ADMIN, search, page, limit);
    }
    getWaiters(search, page, limit) {
        return this.usersService.getByRole(enums_1.UserRole.WAITER, search, page, limit);
    }
    getWaiterOrders(id, page, limit) {
        return this.usersService.getStaffOrders(id, page, limit);
    }
    getChefs(search, page, limit) {
        return this.usersService.getByRole(enums_1.UserRole.CHEF, search, page, limit);
    }
    getChefOrders(id, page, limit) {
        return this.usersService.getStaffOrders(id, page, limit);
    }
    getPosOperators(search, page, limit) {
        return this.usersService.getByRole(enums_1.UserRole.POS_OPERATOR, search, page, limit);
    }
    getBranchManagers(search, page, limit) {
        return this.usersService.getByRole(enums_1.UserRole.BRANCH_MANAGER, search, page, limit);
    }
    async exportStaffExcel(res) {
        return this.usersService.exportStaffExcel(res);
    }
    getCustomerAddresses(id) {
        return this.usersService.getUserAddresses(id);
    }
    getStaffAddresses(id) {
        return this.usersService.getUserAddresses(id);
    }
    getCustomerOrders(id, page, limit) {
        return this.usersService.getCustomerOrders(id, page, limit);
    }
    changeImage(id, body) {
        return this.usersService.update(id, { profileImage: body.profileImage });
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)('admin/users'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "createUser", null);
__decorate([
    (0, common_1.Patch)('admin/users/:id/password'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Get)('admin/customers'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getCustomers", null);
__decorate([
    (0, common_1.Get)('admin/staff'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getStaff", null);
__decorate([
    (0, common_1.Get)('admin/users/:id'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('admin/users/:id'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('admin/users/:id'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)('profile'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Patch)('profile/preferences'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updatePreferences", null);
__decorate([
    (0, common_1.Get)('profile/preferences'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getPreferences", null);
__decorate([
    (0, common_1.Patch)('profile/device-token'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, user_dto_1.UpdateDeviceTokenDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateDeviceToken", null);
__decorate([
    (0, common_1.Get)('profile/default-branch'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getDefaultBranch", null);
__decorate([
    (0, common_1.Patch)('profile/default-branch'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "setDefaultBranch", null);
__decorate([
    (0, common_1.Patch)('admin/users/:id/default-branch'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "setUserDefaultBranch", null);
__decorate([
    (0, common_1.Get)('admin/roles'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getRoles", null);
__decorate([
    (0, common_1.Patch)('admin/users/:id/role'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "assignRole", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)('country-codes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getCountryCodes", null);
__decorate([
    (0, common_1.Get)('admin/administrators'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getAdministrators", null);
__decorate([
    (0, common_1.Get)('admin/waiters'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getWaiters", null);
__decorate([
    (0, common_1.Get)('admin/waiters/:id/orders'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getWaiterOrders", null);
__decorate([
    (0, common_1.Get)('admin/chefs'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getChefs", null);
__decorate([
    (0, common_1.Get)('admin/chefs/:id/orders'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getChefOrders", null);
__decorate([
    (0, common_1.Get)('admin/pos-operators'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getPosOperators", null);
__decorate([
    (0, common_1.Get)('admin/branch-managers'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getBranchManagers", null);
__decorate([
    (0, common_1.Get)('admin/staff/export/excel'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "exportStaffExcel", null);
__decorate([
    (0, common_1.Get)('admin/customers/:id/addresses'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getCustomerAddresses", null);
__decorate([
    (0, common_1.Get)('admin/staff/:id/addresses'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getStaffAddresses", null);
__decorate([
    (0, common_1.Get)('admin/customers/:id/orders'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getCustomerOrders", null);
__decorate([
    (0, common_1.Patch)('admin/users/:id/image'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.BRANCH_MANAGER),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "changeImage", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map