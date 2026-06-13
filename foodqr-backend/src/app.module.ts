import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BranchesModule } from './modules/branches/branches.module';
import { MenuModule } from './modules/menu/menu.module';
import { OrdersModule } from './modules/orders/orders.module';
import { DiningTablesModule } from './modules/dining-tables/dining-tables.module';
import { KdsModule } from './modules/kds/kds.module';
import { OssModule } from './modules/oss/oss.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OffersModule } from './modules/offers/offers.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SettingsModule } from './modules/settings/settings.module';
import { UploadModule } from './modules/upload/upload.module';
import { CurrencyModule } from './modules/currency/currency.module';
import { TaxModule } from './modules/tax/tax.module';
import { ItemAttributesModule } from './modules/item-attributes/item-attributes.module';
import { ItemAddonsModule } from './modules/item-addons/item-addons.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { TimeSlotsModule } from './modules/time-slots/time-slots.module';
import { NotificationAlertsModule } from './modules/notification-alerts/notification-alerts.module';
import { LoyaltySettingsModule } from './modules/loyalty-settings/loyalty-settings.module';
import { PaymentGatewaysModule } from './modules/payment-gateways/payment-gateways.module';
import { SmsGatewaysModule } from './modules/sms-gateways/sms-gateways.module';
import { PagesModule } from './modules/pages/pages.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { PushNotificationsModule } from './modules/push-notifications/push-notifications.module';
import { MailModule } from './modules/mail/mail.module';
import { MenuSectionsModule } from './modules/menu-sections/menu-sections.module';
import { AnalyticsSectionsModule } from './modules/analytics-sections/analytics-sections.module';
import { EventsModule } from './modules/events/events.module';
import { DeliveryZonesModule } from './modules/delivery-zones/delivery-zones.module';
import { LanguagesModule } from './modules/languages/languages.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { NewsletterModule } from './modules/newsletter/newsletter.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const isProduction = config.get('NODE_ENV') === 'production';
        return {
          type: 'postgres',
          host: config.get('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 5432),
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
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    BranchesModule,
    MenuModule,
    OrdersModule,
    DiningTablesModule,
    KdsModule,
    OssModule,
    LoyaltyModule,
    PaymentsModule,
    NotificationsModule,
    OffersModule,
    ReportsModule,
    SettingsModule,
    UploadModule,
    CurrencyModule,
    TaxModule,
    ItemAttributesModule,
    ItemAddonsModule,
    AddressesModule,
    TimeSlotsModule,
    NotificationAlertsModule,
    LoyaltySettingsModule,
    PaymentGatewaysModule,
    SmsGatewaysModule,
    PagesModule,
    MessagingModule,
    PushNotificationsModule,
    MailModule,
    MenuSectionsModule,
    AnalyticsSectionsModule,
    EventsModule,
    DeliveryZonesModule,
    LanguagesModule,
    SubscriptionsModule,
    NewsletterModule,
  ],
})
export class AppModule {}
