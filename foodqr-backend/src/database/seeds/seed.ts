import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../modules/users/entities/user.entity';
import { Branch } from '../../modules/branches/entities/branch.entity';
import { AppSetting } from '../../modules/settings/entities/app-setting.entity';
import { ItemCategory } from '../../modules/menu/categories/entities/item-category.entity';
import { Item } from '../../modules/menu/items/entities/item.entity';
import { ItemVariation } from '../../modules/menu/variations/entities/item-variation.entity';
import { PaymentGateway } from '../../modules/payment-gateways/entities/payment-gateway.entity';
import { Currency } from '../../modules/currency/entities/currency.entity';
import { Language } from '../../modules/languages/entities/language.entity';
import { SmsGateway } from '../../modules/sms-gateways/entities/sms-gateway.entity';
import { RoleDefinition } from '../../modules/role-definitions/entities/role-definition.entity';
import { Tax } from '../../modules/tax/entities/tax.entity';
import { UserRole, UserStatus, ItemType } from '../../common/enums';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'foodqr_db',
  entities: [User, Branch, AppSetting, ItemCategory, Item, ItemVariation, PaymentGateway, Currency, Language, SmsGateway, RoleDefinition, Tax],
  synchronize: false,
});

const SEED_PASSWORD = 'Admin@123';

const seedUsers: Partial<User>[] = [
  { name: 'Super Admin', email: 'admin@foodqr.com', role: UserRole.ADMIN },
  { name: 'Branch Manager', email: 'manager@foodqr.com', role: UserRole.BRANCH_MANAGER },
  { name: 'Waiter User', email: 'waiter@foodqr.com', role: UserRole.WAITER },
  { name: 'Chef User', email: 'chef@foodqr.com', role: UserRole.CHEF },
  { name: 'POS Operator', email: 'pos@foodqr.com', role: UserRole.POS_OPERATOR },
  { name: 'Staff User', email: 'staff@foodqr.com', role: UserRole.STAFF },
  { name: 'Customer User', email: 'customer@foodqr.com', role: UserRole.CUSTOMER },
];

type SettingsGroup = { group: string; key: string; value: string }[];

const defaultSettings: SettingsGroup = [
  // --- Company / Business ---
  { group: 'company', key: 'business_name', value: 'FoodQR Restaurant' },
  { group: 'company', key: 'business_tagline', value: 'Scan. Order. Enjoy.' },
  { group: 'company', key: 'business_email', value: 'info@foodqr.com' },
  { group: 'company', key: 'business_phone', value: '' },
  { group: 'company', key: 'business_address', value: '' },
  { group: 'company', key: 'business_city', value: '' },
  { group: 'company', key: 'business_country', value: '' },
  { group: 'company', key: 'logo', value: '' },
  { group: 'company', key: 'favicon', value: '' },
  { group: 'company', key: 'timezone', value: 'UTC' },
  { group: 'company', key: 'currency_symbol', value: '$' },
  { group: 'company', key: 'currency_code', value: 'USD' },

  // --- Site ---
  { group: 'site', key: 'meta_title', value: 'FoodQR' },
  { group: 'site', key: 'meta_description', value: 'QR-based food ordering system' },
  { group: 'site', key: 'google_analytics_id', value: '' },
  { group: 'site', key: 'facebook_pixel_id', value: '' },
  { group: 'site', key: 'maintenance_mode', value: '0' },
  { group: 'site', key: 'customer_login', value: '1' },
  { group: 'site', key: 'customer_registration', value: '1' },

  // --- Order Setup ---
  { group: 'order_setup', key: 'enable_delivery', value: '1' },
  { group: 'order_setup', key: 'enable_takeaway', value: '1' },
  { group: 'order_setup', key: 'enable_dining_table', value: '1' },
  { group: 'order_setup', key: 'enable_pos', value: '1' },
  { group: 'order_setup', key: 'enable_loyalty', value: '1' },
  { group: 'order_setup', key: 'enable_scheduled_order', value: '1' },
  { group: 'order_setup', key: 'min_order_amount', value: '0' },
  { group: 'order_setup', key: 'max_order_amount', value: '0' },
  { group: 'order_setup', key: 'order_prefix', value: 'ORD' },
  { group: 'order_setup', key: 'delivery_free_km', value: '0' },
  { group: 'order_setup', key: 'delivery_basic_charge', value: '0' },
  { group: 'order_setup', key: 'delivery_per_km_charge', value: '0' },
  { group: 'order_setup', key: 'delivery_max_distance_km', value: '50' },

  // --- OTP ---
  { group: 'otp', key: 'otp_type', value: 'email' },
  { group: 'otp', key: 'otp_digit', value: '6' },
  { group: 'otp', key: 'otp_expire_time', value: '10' },

  // --- Theme ---
  { group: 'theme', key: 'primary_color', value: '#FF6B35' },
  { group: 'theme', key: 'secondary_color', value: '#1A1A2E' },
  { group: 'theme', key: 'font_family', value: 'Inter' },
  { group: 'theme', key: 'product_name', value: 'FoodQR' },
  { group: 'theme', key: 'footer_credit', value: '© 2025 FoodQR. All rights reserved.' },

  // --- Social Media ---
  { group: 'social_media', key: 'facebook_url', value: '' },
  { group: 'social_media', key: 'instagram_url', value: '' },
  { group: 'social_media', key: 'twitter_url', value: '' },
  { group: 'social_media', key: 'youtube_url', value: '' },
  { group: 'social_media', key: 'whatsapp_number', value: '' },

  // --- Mail ---
  { group: 'mail', key: 'mail_driver', value: 'smtp' },
  { group: 'mail', key: 'mail_host', value: '' },
  { group: 'mail', key: 'mail_port', value: '587' },
  { group: 'mail', key: 'mail_username', value: '' },
  { group: 'mail', key: 'mail_password', value: '' },
  { group: 'mail', key: 'mail_encryption', value: 'tls' },
  { group: 'mail', key: 'mail_from_address', value: '' },
  { group: 'mail', key: 'mail_from_name', value: 'FoodQR' },

  // --- Notification ---
  { group: 'notification', key: 'new_order_admin_notification', value: '1' },
  { group: 'notification', key: 'new_order_customer_notification', value: '1' },
  { group: 'notification', key: 'order_status_customer_notification', value: '1' },
  { group: 'notification', key: 'push_notification_key', value: '' },
  { group: 'notification', key: 'firebase_server_key', value: '' },

  // --- Loyalty ---
  { group: 'loyalty', key: 'loyalty_min_order_amount', value: '0' },
  { group: 'loyalty', key: 'loyalty_stamps_per_order', value: '1' },
  { group: 'loyalty', key: 'loyalty_stamps_per_amount', value: '0' },
  { group: 'loyalty', key: 'loyalty_amount_threshold', value: '100' },
  { group: 'loyalty', key: 'loyalty_required_stamps', value: '10' },
  { group: 'loyalty', key: 'loyalty_reward_value', value: '5' },
];

const seedPaymentGateways: Partial<PaymentGateway>[] = [
  {
    name: 'Stripe',
    slug: 'stripe',
    isActive: true,
    mode: 'sandbox',
    config: {
      publicKey: '',
      secretKey: '',
    },
  },
  {
    name: 'PayPal',
    slug: 'paypal',
    isActive: true,
    mode: 'sandbox',
    config: {
      clientId: '',
      clientSecret: '',
    },
  },
  {
    name: 'Razorpay',
    slug: 'razorpay',
    isActive: true,
    mode: 'sandbox',
    config: {
      keyId: '',
      keySecret: '',
    },
  },
  {
    name: 'Cash on Delivery',
    slug: 'cash_on_delivery',
    isActive: true,
    mode: 'sandbox',
    config: {},
  },
  {
    name: 'Wallet Balance',
    slug: 'e_wallet',
    isActive: true,
    mode: 'sandbox',
    config: {},
  },
  {
    name: 'Square',
    slug: 'square',
    isActive: false,
    mode: 'sandbox',
    config: {
      applicationId: '',
      accessToken: '',
      locationId: '',
    },
  },
];

const seedCategories: { name: string; icon: string; items: Partial<Item>[] }[] = [
  {
    name: 'Starters', icon: '🥗',
    items: [
      { name: 'Crispy Spring Rolls', description: 'Vegetable-stuffed rolls with sweet chili dip', price: 6.5, itemType: ItemType.VEG, isFeatured: true },
      { name: 'Chicken Wings', description: 'Spicy buffalo wings with ranch dip', price: 8.5, itemType: ItemType.NON_VEG },
    ],
  },
  {
    name: 'Main Course', icon: '🍛',
    items: [
      { name: 'Margherita Pizza', description: 'Classic pizza with mozzarella and basil', price: 11.99, itemType: ItemType.VEG, isFeatured: true },
      { name: 'Grilled Chicken Burger', description: 'Juicy grilled chicken with lettuce and mayo', price: 9.99, itemType: ItemType.NON_VEG },
      { name: 'Paneer Tikka Masala', description: 'Cottage cheese cubes in spiced curry', price: 10.5, itemType: ItemType.VEG },
    ],
  },
  {
    name: 'Beverages', icon: '🥤',
    items: [
      { name: 'Fresh Lemonade', description: 'Chilled lemonade with mint', price: 3.5, itemType: ItemType.BEVERAGE },
      { name: 'Mango Smoothie', description: 'Creamy mango smoothie', price: 4.5, itemType: ItemType.BEVERAGE, isFeatured: true },
    ],
  },
  {
    name: 'Desserts', icon: '🍰',
    items: [
      { name: 'Chocolate Brownie', description: 'Warm brownie with vanilla ice cream', price: 5.5, itemType: ItemType.VEG },
    ],
  },
];

const seedCurrencies: Partial<Currency>[] = [
  { name: 'US Dollar', code: 'USD', symbol: '$', exchangeRate: 1, isDefault: true, status: true },
  { name: 'Euro', code: 'EUR', symbol: '€', exchangeRate: 0.92, status: true },
  { name: 'British Pound', code: 'GBP', symbol: '£', exchangeRate: 0.79, status: true },
  { name: 'Indian Rupee', code: 'INR', symbol: '₹', exchangeRate: 83.5, status: true },
  { name: 'Australian Dollar', code: 'AUD', symbol: 'A$', exchangeRate: 1.53, status: true },
  { name: 'Canadian Dollar', code: 'CAD', symbol: 'C$', exchangeRate: 1.36, status: true },
  { name: 'UAE Dirham', code: 'AED', symbol: 'AED', exchangeRate: 3.67, status: true },
  { name: 'Saudi Riyal', code: 'SAR', symbol: 'SAR', exchangeRate: 3.75, status: true },
];

const seedLanguages: Partial<Language>[] = [
  { name: 'English', code: 'en', nativeName: 'English', direction: 'ltr', isDefault: true, isActive: true },
  { name: 'Arabic', code: 'ar', nativeName: 'العربية', direction: 'rtl', isDefault: false, isActive: true },
  { name: 'French', code: 'fr', nativeName: 'Français', direction: 'ltr', isDefault: false, isActive: true },
  { name: 'Spanish', code: 'es', nativeName: 'Español', direction: 'ltr', isDefault: false, isActive: true },
  { name: 'German', code: 'de', nativeName: 'Deutsch', direction: 'ltr', isDefault: false, isActive: true },
  { name: 'Hindi', code: 'hi', nativeName: 'हिन्दी', direction: 'ltr', isDefault: false, isActive: true },
];

const seedSmsGateways: Partial<SmsGateway>[] = [
  {
    name: 'Twilio',
    slug: 'twilio',
    isActive: false,
    config: { accountSid: '', authToken: '', fromNumber: '' },
  },
  {
    name: 'Vonage',
    slug: 'vonage',
    isActive: false,
    config: { apiKey: '', apiSecret: '', fromNumber: '' },
  },
  {
    name: 'MSG91',
    slug: 'msg91',
    isActive: false,
    config: { authKey: '', senderId: '', templateId: '' },
  },
];

const seedRoleDefinitions: Partial<RoleDefinition>[] = [
  {
    name: UserRole.ADMIN,
    label: 'Admin',
    description: 'Full access to all system features',
    color: 'red',
    isSystem: true,
    isActive: true,
    permissions: { dashboard: true, menu: true, orders: true, users: true, branches: true, settings: true, reports: true, payments: true, loyalty: true, offers: true },
  },
  {
    name: UserRole.BRANCH_MANAGER,
    label: 'Branch Manager',
    description: 'Manages a specific branch',
    color: 'blue',
    isSystem: true,
    isActive: true,
    permissions: { dashboard: true, menu: true, orders: true, users: false, branches: false, settings: false, reports: true, payments: true, loyalty: true, offers: true },
  },
  {
    name: UserRole.WAITER,
    label: 'Waiter',
    description: 'Takes orders at tables',
    color: 'green',
    isSystem: true,
    isActive: true,
    permissions: { dashboard: false, menu: false, orders: true, users: false, branches: false, settings: false, reports: false, payments: false, loyalty: false, offers: false },
  },
  {
    name: UserRole.CHEF,
    label: 'Chef',
    description: 'Manages kitchen and food preparation',
    color: 'orange',
    isSystem: true,
    isActive: true,
    permissions: { dashboard: false, menu: false, orders: true, users: false, branches: false, settings: false, reports: false, payments: false, loyalty: false, offers: false },
  },
  {
    name: UserRole.POS_OPERATOR,
    label: 'POS Operator',
    description: 'Operates point-of-sale system',
    color: 'purple',
    isSystem: true,
    isActive: true,
    permissions: { dashboard: false, menu: false, orders: true, users: false, branches: false, settings: false, reports: false, payments: true, loyalty: false, offers: false },
  },
  {
    name: UserRole.STAFF,
    label: 'Staff',
    description: 'General staff member',
    color: 'gray',
    isSystem: true,
    isActive: true,
    permissions: { dashboard: false, menu: false, orders: true, users: false, branches: false, settings: false, reports: false, payments: false, loyalty: false, offers: false },
  },
  {
    name: UserRole.CUSTOMER,
    label: 'Customer',
    description: 'End customer placing orders',
    color: 'teal',
    isSystem: true,
    isActive: true,
    permissions: {},
  },
];

const seedTaxes: Partial<Tax>[] = [
  { name: 'No Tax', code: 'NOTAX', type: 'excluded', rate: 0, isIncluded: false, isDefault: true, status: true },
  { name: 'Standard Tax (10%)', code: 'STD10', type: 'excluded', rate: 10, isIncluded: false, isDefault: false, status: true },
  { name: 'Standard Tax (5%)', code: 'STD5', type: 'excluded', rate: 5, isIncluded: false, isDefault: false, status: true },
  { name: 'GST (18%)', code: 'GST18', type: 'excluded', rate: 18, isIncluded: false, isDefault: false, status: true },
  { name: 'VAT (20%)', code: 'VAT20', type: 'excluded', rate: 20, isIncluded: false, isDefault: false, status: true },
];

async function seed() {
  await AppDataSource.initialize();
  console.log('Database connected.\n');

  // --- Users ---
  const userRepo = AppDataSource.getRepository(User);
  const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 12);
  const userResults: { role: string; email: string; status: string }[] = [];

  for (const data of seedUsers) {
    const existing = await userRepo.findOne({ where: { email: data.email } });
    if (existing) {
      userResults.push({ role: data.role, email: data.email, status: 'skipped' });
      continue;
    }
    await userRepo.save(
      userRepo.create({ ...data, password: hashedPassword, status: UserStatus.ACTIVE, emailVerifiedAt: new Date() }),
    );
    userResults.push({ role: data.role, email: data.email, status: 'created' });
  }

  console.log('Users:');
  console.log('─'.repeat(70));
  console.log(`${'Role'.padEnd(20)} ${'Email'.padEnd(30)} Status`);
  console.log('─'.repeat(70));
  for (const r of userResults) {
    console.log(`${r.role.padEnd(20)} ${r.email.padEnd(30)} ${r.status}`);
  }
  console.log('─'.repeat(70));
  console.log(`Default password: ${SEED_PASSWORD}\n`);

  // --- Settings ---
  const settingRepo = AppDataSource.getRepository(AppSetting);
  let createdCount = 0;
  let skippedCount = 0;

  for (const s of defaultSettings) {
    const existing = await settingRepo.findOne({ where: { key: s.key } });
    if (existing) { skippedCount++; continue; }
    await settingRepo.save(settingRepo.create(s));
    createdCount++;
  }

  console.log('Settings:');
  console.log('─'.repeat(40));
  console.log(`Created : ${createdCount}`);
  console.log(`Skipped : ${skippedCount}`);
  console.log(`Total   : ${defaultSettings.length}`);
  console.log('─'.repeat(40));

  // --- Menu categories & items ---
  const categoryRepo = AppDataSource.getRepository(ItemCategory);
  const itemRepo = AppDataSource.getRepository(Item);
  let categoriesCreated = 0;
  let categoriesSkipped = 0;
  let itemsCreated = 0;
  let itemsSkipped = 0;

  for (const [index, cat] of seedCategories.entries()) {
    let category = await categoryRepo.findOne({ where: { name: cat.name } });
    if (!category) {
      category = await categoryRepo.save(
        categoryRepo.create({ name: cat.name, icon: cat.icon, sortOrder: index, status: true }),
      );
      categoriesCreated++;
    } else {
      categoriesSkipped++;
    }

    for (const [itemIndex, itemData] of cat.items.entries()) {
      const existingItem = await itemRepo.findOne({ where: { name: itemData.name } });
      if (existingItem) { itemsSkipped++; continue; }
      await itemRepo.save(itemRepo.create({ ...itemData, categoryId: category.id, sortOrder: itemIndex, status: true }));
      itemsCreated++;
    }
  }

  console.log('\nMenu:');
  console.log('─'.repeat(40));
  console.log(`Categories created : ${categoriesCreated}`);
  console.log(`Categories skipped : ${categoriesSkipped}`);
  console.log(`Items created      : ${itemsCreated}`);
  console.log(`Items skipped      : ${itemsSkipped}`);
  console.log('─'.repeat(40));

  // --- Payment Gateways ---
  const paymentGatewayRepo = AppDataSource.getRepository(PaymentGateway);
  let gatewaysCreated = 0;
  let gatewaysSkipped = 0;

  for (const gateway of seedPaymentGateways) {
    const existing = await paymentGatewayRepo.findOne({ where: { slug: gateway.slug } });
    if (existing) {
      gatewaysSkipped++;
      continue;
    }
    await paymentGatewayRepo.save(paymentGatewayRepo.create(gateway));
    gatewaysCreated++;
  }

  console.log('\nPayment Gateways:');
  console.log('─'.repeat(40));
  console.log(`Created : ${gatewaysCreated}`);
  console.log(`Skipped : ${gatewaysSkipped}`);
  console.log(`Total   : ${seedPaymentGateways.length}`);
  console.log('─'.repeat(40));

  // --- Currencies ---
  const currencyRepo = AppDataSource.getRepository(Currency);
  let currenciesCreated = 0;
  let currenciesSkipped = 0;

  for (const cur of seedCurrencies) {
    const existing = await currencyRepo.findOne({ where: { code: cur.code } });
    if (existing) { currenciesSkipped++; continue; }
    await currencyRepo.save(currencyRepo.create(cur));
    currenciesCreated++;
  }

  console.log('\nCurrencies:');
  console.log('─'.repeat(40));
  console.log(`Created : ${currenciesCreated}`);
  console.log(`Skipped : ${currenciesSkipped}`);
  console.log(`Total   : ${seedCurrencies.length}`);
  console.log('─'.repeat(40));

  // --- Languages ---
  const languageRepo = AppDataSource.getRepository(Language);
  let languagesCreated = 0;
  let languagesSkipped = 0;

  for (const lang of seedLanguages) {
    const existing = await languageRepo.findOne({ where: { code: lang.code } });
    if (existing) { languagesSkipped++; continue; }
    await languageRepo.save(languageRepo.create(lang));
    languagesCreated++;
  }

  console.log('\nLanguages:');
  console.log('─'.repeat(40));
  console.log(`Created : ${languagesCreated}`);
  console.log(`Skipped : ${languagesSkipped}`);
  console.log(`Total   : ${seedLanguages.length}`);
  console.log('─'.repeat(40));

  // --- SMS Gateways ---
  const smsGatewayRepo = AppDataSource.getRepository(SmsGateway);
  let smsCreated = 0;
  let smsSkipped = 0;

  for (const gateway of seedSmsGateways) {
    const existing = await smsGatewayRepo.findOne({ where: { slug: gateway.slug } });
    if (existing) { smsSkipped++; continue; }
    await smsGatewayRepo.save(smsGatewayRepo.create(gateway));
    smsCreated++;
  }

  console.log('\nSMS Gateways:');
  console.log('─'.repeat(40));
  console.log(`Created : ${smsCreated}`);
  console.log(`Skipped : ${smsSkipped}`);
  console.log(`Total   : ${seedSmsGateways.length}`);
  console.log('─'.repeat(40));

  // --- Role Definitions ---
  const roleRepo = AppDataSource.getRepository(RoleDefinition);
  let rolesCreated = 0;
  let rolesSkipped = 0;

  for (const role of seedRoleDefinitions) {
    const existing = await roleRepo.findOne({ where: { name: role.name } });
    if (existing) { rolesSkipped++; continue; }
    await roleRepo.save(roleRepo.create(role));
    rolesCreated++;
  }

  console.log('\nRole Definitions:');
  console.log('─'.repeat(40));
  console.log(`Created : ${rolesCreated}`);
  console.log(`Skipped : ${rolesSkipped}`);
  console.log(`Total   : ${seedRoleDefinitions.length}`);
  console.log('─'.repeat(40));

  // --- Taxes ---
  const taxRepo = AppDataSource.getRepository(Tax);
  let taxesCreated = 0;
  let taxesSkipped = 0;

  for (const tax of seedTaxes) {
    const existing = await taxRepo.findOne({ where: { code: tax.code } });
    if (existing) { taxesSkipped++; continue; }
    await taxRepo.save(taxRepo.create(tax));
    taxesCreated++;
  }

  console.log('\nTaxes:');
  console.log('─'.repeat(40));
  console.log(`Created : ${taxesCreated}`);
  console.log(`Skipped : ${taxesSkipped}`);
  console.log(`Total   : ${seedTaxes.length}`);
  console.log('─'.repeat(40));

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
