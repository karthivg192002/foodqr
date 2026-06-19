"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv = require("dotenv");
const typeorm_1 = require("typeorm");
const bcrypt = require("bcryptjs");
const user_entity_1 = require("../../modules/users/entities/user.entity");
const branch_entity_1 = require("../../modules/branches/entities/branch.entity");
const app_setting_entity_1 = require("../../modules/settings/entities/app-setting.entity");
const item_category_entity_1 = require("../../modules/menu/categories/entities/item-category.entity");
const item_entity_1 = require("../../modules/menu/items/entities/item.entity");
const item_variation_entity_1 = require("../../modules/menu/variations/entities/item-variation.entity");
const payment_gateway_entity_1 = require("../../modules/payment-gateways/entities/payment-gateway.entity");
const enums_1 = require("../../common/enums");
dotenv.config();
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'foodqr_db',
    entities: [user_entity_1.User, branch_entity_1.Branch, app_setting_entity_1.AppSetting, item_category_entity_1.ItemCategory, item_entity_1.Item, item_variation_entity_1.ItemVariation, payment_gateway_entity_1.PaymentGateway],
    synchronize: false,
});
const SEED_PASSWORD = 'Admin@123';
const seedUsers = [
    { name: 'Super Admin', email: 'admin@foodqr.com', role: enums_1.UserRole.ADMIN },
    { name: 'Branch Manager', email: 'manager@foodqr.com', role: enums_1.UserRole.BRANCH_MANAGER },
    { name: 'Waiter User', email: 'waiter@foodqr.com', role: enums_1.UserRole.WAITER },
    { name: 'Chef User', email: 'chef@foodqr.com', role: enums_1.UserRole.CHEF },
    { name: 'POS Operator', email: 'pos@foodqr.com', role: enums_1.UserRole.POS_OPERATOR },
    { name: 'Staff User', email: 'staff@foodqr.com', role: enums_1.UserRole.STAFF },
    { name: 'Customer User', email: 'customer@foodqr.com', role: enums_1.UserRole.CUSTOMER },
];
const defaultSettings = [
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
    { group: 'site', key: 'meta_title', value: 'FoodQR' },
    { group: 'site', key: 'meta_description', value: 'QR-based food ordering system' },
    { group: 'site', key: 'google_analytics_id', value: '' },
    { group: 'site', key: 'facebook_pixel_id', value: '' },
    { group: 'site', key: 'maintenance_mode', value: '0' },
    { group: 'site', key: 'customer_login', value: '1' },
    { group: 'site', key: 'customer_registration', value: '1' },
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
    { group: 'otp', key: 'otp_type', value: 'email' },
    { group: 'otp', key: 'otp_digit', value: '6' },
    { group: 'otp', key: 'otp_expire_time', value: '10' },
    { group: 'theme', key: 'primary_color', value: '#FF6B35' },
    { group: 'theme', key: 'secondary_color', value: '#1A1A2E' },
    { group: 'theme', key: 'font_family', value: 'Inter' },
    { group: 'theme', key: 'product_name', value: 'FoodQR' },
    { group: 'theme', key: 'footer_credit', value: '© 2025 FoodQR. All rights reserved.' },
    { group: 'social_media', key: 'facebook_url', value: '' },
    { group: 'social_media', key: 'instagram_url', value: '' },
    { group: 'social_media', key: 'twitter_url', value: '' },
    { group: 'social_media', key: 'youtube_url', value: '' },
    { group: 'social_media', key: 'whatsapp_number', value: '' },
    { group: 'mail', key: 'mail_driver', value: 'smtp' },
    { group: 'mail', key: 'mail_host', value: '' },
    { group: 'mail', key: 'mail_port', value: '587' },
    { group: 'mail', key: 'mail_username', value: '' },
    { group: 'mail', key: 'mail_password', value: '' },
    { group: 'mail', key: 'mail_encryption', value: 'tls' },
    { group: 'mail', key: 'mail_from_address', value: '' },
    { group: 'mail', key: 'mail_from_name', value: 'FoodQR' },
    { group: 'notification', key: 'new_order_admin_notification', value: '1' },
    { group: 'notification', key: 'new_order_customer_notification', value: '1' },
    { group: 'notification', key: 'order_status_customer_notification', value: '1' },
    { group: 'notification', key: 'push_notification_key', value: '' },
    { group: 'notification', key: 'firebase_server_key', value: '' },
    { group: 'loyalty', key: 'loyalty_min_order_amount', value: '0' },
    { group: 'loyalty', key: 'loyalty_stamps_per_order', value: '1' },
    { group: 'loyalty', key: 'loyalty_stamps_per_amount', value: '0' },
    { group: 'loyalty', key: 'loyalty_amount_threshold', value: '100' },
    { group: 'loyalty', key: 'loyalty_required_stamps', value: '10' },
    { group: 'loyalty', key: 'loyalty_reward_value', value: '5' },
];
const seedPaymentGateways = [
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
const seedCategories = [
    {
        name: 'Starters', icon: '🥗',
        items: [
            { name: 'Crispy Spring Rolls', description: 'Vegetable-stuffed rolls with sweet chili dip', price: 6.5, itemType: enums_1.ItemType.VEG, isFeatured: true },
            { name: 'Chicken Wings', description: 'Spicy buffalo wings with ranch dip', price: 8.5, itemType: enums_1.ItemType.NON_VEG },
        ],
    },
    {
        name: 'Main Course', icon: '🍛',
        items: [
            { name: 'Margherita Pizza', description: 'Classic pizza with mozzarella and basil', price: 11.99, itemType: enums_1.ItemType.VEG, isFeatured: true },
            { name: 'Grilled Chicken Burger', description: 'Juicy grilled chicken with lettuce and mayo', price: 9.99, itemType: enums_1.ItemType.NON_VEG },
            { name: 'Paneer Tikka Masala', description: 'Cottage cheese cubes in spiced curry', price: 10.5, itemType: enums_1.ItemType.VEG },
        ],
    },
    {
        name: 'Beverages', icon: '🥤',
        items: [
            { name: 'Fresh Lemonade', description: 'Chilled lemonade with mint', price: 3.5, itemType: enums_1.ItemType.BEVERAGE },
            { name: 'Mango Smoothie', description: 'Creamy mango smoothie', price: 4.5, itemType: enums_1.ItemType.BEVERAGE, isFeatured: true },
        ],
    },
    {
        name: 'Desserts', icon: '🍰',
        items: [
            { name: 'Chocolate Brownie', description: 'Warm brownie with vanilla ice cream', price: 5.5, itemType: enums_1.ItemType.VEG },
        ],
    },
];
async function seed() {
    await AppDataSource.initialize();
    console.log('Database connected.\n');
    const userRepo = AppDataSource.getRepository(user_entity_1.User);
    const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 12);
    const userResults = [];
    for (const data of seedUsers) {
        const existing = await userRepo.findOne({ where: { email: data.email } });
        if (existing) {
            userResults.push({ role: data.role, email: data.email, status: 'skipped' });
            continue;
        }
        await userRepo.save(userRepo.create({ ...data, password: hashedPassword, status: enums_1.UserStatus.ACTIVE, emailVerifiedAt: new Date() }));
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
    const settingRepo = AppDataSource.getRepository(app_setting_entity_1.AppSetting);
    let createdCount = 0;
    let skippedCount = 0;
    for (const s of defaultSettings) {
        const existing = await settingRepo.findOne({ where: { key: s.key } });
        if (existing) {
            skippedCount++;
            continue;
        }
        await settingRepo.save(settingRepo.create(s));
        createdCount++;
    }
    console.log('Settings:');
    console.log('─'.repeat(40));
    console.log(`Created : ${createdCount}`);
    console.log(`Skipped : ${skippedCount}`);
    console.log(`Total   : ${defaultSettings.length}`);
    console.log('─'.repeat(40));
    const categoryRepo = AppDataSource.getRepository(item_category_entity_1.ItemCategory);
    const itemRepo = AppDataSource.getRepository(item_entity_1.Item);
    let categoriesCreated = 0;
    let itemsCreated = 0;
    for (const [index, cat] of seedCategories.entries()) {
        let category = await categoryRepo.findOne({ where: { name: cat.name } });
        if (!category) {
            category = await categoryRepo.save(categoryRepo.create({ name: cat.name, icon: cat.icon, sortOrder: index, status: true }));
            categoriesCreated++;
        }
        for (const [itemIndex, itemData] of cat.items.entries()) {
            const existingItem = await itemRepo.findOne({ where: { name: itemData.name } });
            if (existingItem)
                continue;
            await itemRepo.save(itemRepo.create({ ...itemData, categoryId: category.id, sortOrder: itemIndex, status: true }));
            itemsCreated++;
        }
    }
    console.log('\nMenu:');
    console.log('─'.repeat(40));
    console.log(`Categories created : ${categoriesCreated}`);
    console.log(`Items created      : ${itemsCreated}`);
    console.log('─'.repeat(40));
    const paymentGatewayRepo = AppDataSource.getRepository(payment_gateway_entity_1.PaymentGateway);
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
    await AppDataSource.destroy();
}
seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map