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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const user_entity_1 = require("../users/entities/user.entity");
const sms_gateways_service_1 = require("../sms-gateways/sms-gateways.service");
const tenant_connection_service_1 = require("../tenants/connection/tenant-connection.service");
const tenant_aware_repo_1 = require("../tenants/connection/tenant-aware-repo");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(userRepo, configService, smsService, connections) {
        this.userRepo = userRepo;
        this.configService = configService;
        this.smsService = smsService;
        this.logger = new common_1.Logger(NotificationsService_1.name);
        this.firebaseInitialized = false;
        this.userRepo = (0, tenant_aware_repo_1.tenantAwareRepo)(connections, user_entity_1.User, userRepo);
        this.initFirebase();
        this.initEmail();
    }
    initFirebase() {
        const projectId = this.configService.get('FIREBASE_PROJECT_ID');
        if (!projectId || admin.apps.length)
            return;
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    privateKey: this.configService.get('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
                    clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL'),
                }),
            });
            this.firebaseInitialized = true;
        }
        catch (e) {
            this.logger.warn('Firebase not configured: ' + e.message);
        }
    }
    initEmail() {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('MAIL_HOST'),
            port: this.configService.get('MAIL_PORT', 587),
            auth: {
                user: this.configService.get('MAIL_USER'),
                pass: this.configService.get('MAIL_PASS'),
            },
        });
    }
    async sendPushNotification(token, title, body, data) {
        if (!this.firebaseInitialized)
            return;
        try {
            await admin.messaging().send({ token, notification: { title, body }, data });
        }
        catch (e) {
            this.logger.error('Push notification failed: ' + e.message);
        }
    }
    async sendOrderNotification(userId, orderSerial, status) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            return;
        const title = 'Order Update';
        const body = `Your order #${orderSerial} is now ${status}`;
        if (user.deviceToken) {
            await this.sendPushNotification(user.deviceToken, title, body, { orderId: orderSerial, status });
        }
        if (user.webToken) {
            await this.sendPushNotification(user.webToken, title, body, { orderId: orderSerial, status });
        }
        if (user.email) {
            await this.sendEmail(user.email, title, `<p>${body}</p>`);
        }
        if (user.phone) {
            this.smsService.send(user.phone, `FoodQR: Your order #${orderSerial} is now ${status}.`).catch(() => null);
        }
    }
    async sendEmail(to, subject, html) {
        try {
            await this.transporter.sendMail({
                from: this.configService.get('MAIL_FROM', 'noreply@foodqr.com'),
                to,
                subject,
                html,
            });
        }
        catch (e) {
            this.logger.error('Email failed: ' + e.message);
        }
    }
    async broadcastToAll(title, body) {
        const users = await this.userRepo.find({ where: { status: 'active' } });
        const tokens = users.map((u) => u.deviceToken || u.webToken).filter(Boolean);
        if (!tokens.length || !this.firebaseInitialized)
            return { sent: 0 };
        const batches = [];
        for (let i = 0; i < tokens.length; i += 500) {
            batches.push(tokens.slice(i, i + 500));
        }
        let sent = 0;
        for (const batch of batches) {
            try {
                const response = await admin.messaging().sendEachForMulticast({ tokens: batch, notification: { title, body } });
                sent += response.successCount;
            }
            catch (e) {
                this.logger.error('Broadcast failed: ' + e.message);
            }
        }
        return { sent };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService,
        sms_gateways_service_1.SmsGatewaysService,
        tenant_connection_service_1.TenantConnectionService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map