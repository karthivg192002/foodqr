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
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const swagger_1 = require("@nestjs/swagger");
const settings_service_1 = require("./settings.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const decorators_1 = require("../../common/decorators");
const enums_1 = require("../../common/enums");
let SettingsController = class SettingsController {
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    getAll(group) { return this.settingsService.getAll(group); }
    getCompany() { return this.settingsService.getCompanySettings(); }
    setCompany(settings) {
        return this.settingsService.setMany(settings, 'company');
    }
    getSite() { return this.settingsService.getSiteSettings(); }
    setSite(settings) {
        return this.settingsService.setMany(settings, 'site');
    }
    getMail() { return this.settingsService.getMailSettings(); }
    setMail(settings) {
        return this.settingsService.setMany(settings, 'mail');
    }
    getPayment() { return this.settingsService.getPaymentSettings(); }
    setPayment(settings) {
        return this.settingsService.setMany(settings, 'payment');
    }
    getSms() { return this.settingsService.getSmsSettings(); }
    setSms(settings) {
        return this.settingsService.setMany(settings, 'sms');
    }
    getBusiness() { return this.settingsService.getBusinessSettings(); }
    setBusiness(settings) {
        return this.settingsService.setMany(settings, 'business');
    }
    getOrder() { return this.settingsService.getOrderSettings(); }
    setOrder(settings) {
        return this.settingsService.setMany(settings, 'order');
    }
    getNotification() { return this.settingsService.getNotificationSettings(); }
    setNotification(settings) {
        return this.settingsService.setMany(settings, 'notification');
    }
    getOrderSetup() { return this.settingsService.getAll('order_setup'); }
    setOrderSetup(settings) {
        return this.settingsService.setMany(settings, 'order_setup');
    }
    getSocialMedia() { return this.settingsService.getAll('social_media'); }
    setSocialMedia(settings) {
        return this.settingsService.setMany(settings, 'social_media');
    }
    getTheme() { return this.settingsService.getAll('theme'); }
    setTheme(settings) {
        return this.settingsService.setMany(settings, 'theme');
    }
    getOtp() { return this.settingsService.getAll('otp'); }
    setOtp(settings) {
        return this.settingsService.setMany(settings, 'otp');
    }
    getFirebase() { return this.settingsService.getAll('firebase'); }
    setFirebase(settings) {
        return this.settingsService.setMany(settings, 'firebase');
    }
    async uploadLogo(file) {
        if (!file)
            throw new common_1.BadRequestException('No file uploaded');
        const url = `/uploads/branding/${file.filename}`;
        await this.settingsService.setMany({ logo: url }, 'theme');
        return { url };
    }
    async uploadFavicon(file) {
        if (!file)
            throw new common_1.BadRequestException('No file uploaded');
        const url = `/uploads/branding/${file.filename}`;
        await this.settingsService.setMany({ favicon: url }, 'theme');
        return { url };
    }
    getPublic() { return this.settingsService.getPublicSettings(); }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, common_1.Get)(),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Query)('group')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('company'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getCompany", null);
__decorate([
    (0, common_1.Post)('company'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "setCompany", null);
__decorate([
    (0, common_1.Get)('site'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getSite", null);
__decorate([
    (0, common_1.Post)('site'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "setSite", null);
__decorate([
    (0, common_1.Get)('mail'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getMail", null);
__decorate([
    (0, common_1.Post)('mail'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "setMail", null);
__decorate([
    (0, common_1.Get)('payment'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getPayment", null);
__decorate([
    (0, common_1.Post)('payment'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "setPayment", null);
__decorate([
    (0, common_1.Get)('sms'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getSms", null);
__decorate([
    (0, common_1.Post)('sms'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "setSms", null);
__decorate([
    (0, common_1.Get)('business'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getBusiness", null);
__decorate([
    (0, common_1.Post)('business'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "setBusiness", null);
__decorate([
    (0, common_1.Get)('order'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getOrder", null);
__decorate([
    (0, common_1.Post)('order'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "setOrder", null);
__decorate([
    (0, common_1.Get)('notification'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getNotification", null);
__decorate([
    (0, common_1.Post)('notification'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "setNotification", null);
__decorate([
    (0, common_1.Get)('order_setup'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getOrderSetup", null);
__decorate([
    (0, common_1.Post)('order_setup'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "setOrderSetup", null);
__decorate([
    (0, common_1.Get)('social_media'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getSocialMedia", null);
__decorate([
    (0, common_1.Post)('social_media'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "setSocialMedia", null);
__decorate([
    (0, common_1.Get)('theme'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getTheme", null);
__decorate([
    (0, common_1.Post)('theme'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "setTheme", null);
__decorate([
    (0, common_1.Get)('otp'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getOtp", null);
__decorate([
    (0, common_1.Post)('otp'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "setOtp", null);
__decorate([
    (0, common_1.Get)('firebase'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getFirebase", null);
__decorate([
    (0, common_1.Post)('firebase'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "setFirebase", null);
__decorate([
    (0, common_1.Post)('upload-logo'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/branding',
            filename: (_req, file, cb) => cb(null, `logo-${Date.now()}${(0, path_1.extname)(file.originalname)}`),
        }),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "uploadLogo", null);
__decorate([
    (0, common_1.Post)('upload-favicon'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/branding',
            filename: (_req, file, cb) => cb(null, `favicon-${Date.now()}${(0, path_1.extname)(file.originalname)}`),
        }),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "uploadFavicon", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)('public'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getPublic", null);
exports.SettingsController = SettingsController = __decorate([
    (0, swagger_1.ApiTags)('Settings'),
    (0, common_1.Controller)('admin/settings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map