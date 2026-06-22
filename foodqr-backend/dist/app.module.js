"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const tenant_middleware_1 = require("./modules/tenants/tenant.middleware");
const tenant_context_middleware_1 = require("./modules/tenants/connection/tenant-context.middleware");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const branches_module_1 = require("./modules/branches/branches.module");
const menu_module_1 = require("./modules/menu/menu.module");
const orders_module_1 = require("./modules/orders/orders.module");
const dining_tables_module_1 = require("./modules/dining-tables/dining-tables.module");
const kds_module_1 = require("./modules/kds/kds.module");
const oss_module_1 = require("./modules/oss/oss.module");
const loyalty_module_1 = require("./modules/loyalty/loyalty.module");
const payments_module_1 = require("./modules/payments/payments.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const offers_module_1 = require("./modules/offers/offers.module");
const reports_module_1 = require("./modules/reports/reports.module");
const settings_module_1 = require("./modules/settings/settings.module");
const upload_module_1 = require("./modules/upload/upload.module");
const currency_module_1 = require("./modules/currency/currency.module");
const tax_module_1 = require("./modules/tax/tax.module");
const item_attributes_module_1 = require("./modules/item-attributes/item-attributes.module");
const item_addons_module_1 = require("./modules/item-addons/item-addons.module");
const addresses_module_1 = require("./modules/addresses/addresses.module");
const time_slots_module_1 = require("./modules/time-slots/time-slots.module");
const notification_alerts_module_1 = require("./modules/notification-alerts/notification-alerts.module");
const loyalty_settings_module_1 = require("./modules/loyalty-settings/loyalty-settings.module");
const payment_gateways_module_1 = require("./modules/payment-gateways/payment-gateways.module");
const sms_gateways_module_1 = require("./modules/sms-gateways/sms-gateways.module");
const pages_module_1 = require("./modules/pages/pages.module");
const messaging_module_1 = require("./modules/messaging/messaging.module");
const push_notifications_module_1 = require("./modules/push-notifications/push-notifications.module");
const mail_module_1 = require("./modules/mail/mail.module");
const menu_sections_module_1 = require("./modules/menu-sections/menu-sections.module");
const analytics_sections_module_1 = require("./modules/analytics-sections/analytics-sections.module");
const events_module_1 = require("./modules/events/events.module");
const delivery_zones_module_1 = require("./modules/delivery-zones/delivery-zones.module");
const languages_module_1 = require("./modules/languages/languages.module");
const subscriptions_module_1 = require("./modules/subscriptions/subscriptions.module");
const newsletter_module_1 = require("./modules/newsletter/newsletter.module");
const nav_menus_module_1 = require("./modules/nav-menus/nav-menus.module");
const role_definitions_module_1 = require("./modules/role-definitions/role-definitions.module");
const menu_templates_module_1 = require("./modules/menu-templates/menu-templates.module");
const license_module_1 = require("./modules/license/license.module");
const default_access_module_1 = require("./modules/default-access/default-access.module");
const installer_module_1 = require("./modules/installer/installer.module");
const tenants_module_1 = require("./modules/tenants/tenants.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(tenant_middleware_1.TenantMiddleware, tenant_context_middleware_1.TenantContextMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (config) => {
                    const isProduction = config.get('NODE_ENV') === 'production';
                    return {
                        type: 'postgres',
                        host: config.get('DB_HOST', 'localhost'),
                        port: config.get('DB_PORT', 5432),
                        username: config.get('DB_USERNAME', 'postgres'),
                        password: config.get('DB_PASSWORD', 'password'),
                        database: config.get('DB_DATABASE', 'foodqr_db'),
                        entities: [__dirname + '/**/*.entity{.ts,.js}'],
                        migrations: [__dirname + '/migrations/*{.ts,.js}'],
                        autoLoadEntities: true,
                        synchronize: !isProduction,
                        migrationsRun: isProduction,
                        logging: !isProduction,
                    };
                },
                inject: [config_1.ConfigService],
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            branches_module_1.BranchesModule,
            menu_module_1.MenuModule,
            orders_module_1.OrdersModule,
            dining_tables_module_1.DiningTablesModule,
            kds_module_1.KdsModule,
            oss_module_1.OssModule,
            loyalty_module_1.LoyaltyModule,
            payments_module_1.PaymentsModule,
            notifications_module_1.NotificationsModule,
            offers_module_1.OffersModule,
            reports_module_1.ReportsModule,
            settings_module_1.SettingsModule,
            upload_module_1.UploadModule,
            currency_module_1.CurrencyModule,
            tax_module_1.TaxModule,
            item_attributes_module_1.ItemAttributesModule,
            item_addons_module_1.ItemAddonsModule,
            addresses_module_1.AddressesModule,
            time_slots_module_1.TimeSlotsModule,
            notification_alerts_module_1.NotificationAlertsModule,
            loyalty_settings_module_1.LoyaltySettingsModule,
            payment_gateways_module_1.PaymentGatewaysModule,
            sms_gateways_module_1.SmsGatewaysModule,
            pages_module_1.PagesModule,
            messaging_module_1.MessagingModule,
            push_notifications_module_1.PushNotificationsModule,
            mail_module_1.MailModule,
            menu_sections_module_1.MenuSectionsModule,
            analytics_sections_module_1.AnalyticsSectionsModule,
            events_module_1.EventsModule,
            delivery_zones_module_1.DeliveryZonesModule,
            languages_module_1.LanguagesModule,
            subscriptions_module_1.SubscriptionsModule,
            newsletter_module_1.NewsletterModule,
            nav_menus_module_1.NavMenusModule,
            role_definitions_module_1.RoleDefinitionsModule,
            menu_templates_module_1.MenuTemplatesModule,
            license_module_1.LicenseModule,
            default_access_module_1.DefaultAccessModule,
            installer_module_1.InstallerModule,
            tenants_module_1.TenantsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map