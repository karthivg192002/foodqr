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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME', 'postgres'),
        password: config.get('DB_PASSWORD', 'password'),
        database: config.get('DB_DATABASE', 'foodqr_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: config.get('NODE_ENV') !== 'production',
        logging: config.get('NODE_ENV') === 'development',
      }),
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
  ],
})
export class AppModule {}
