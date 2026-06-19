export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: string;
  profileImage?: string;
  balance: number;
  branchId?: string;
  branch?: Branch;
  createdAt: string;
}

export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
  WAITER = 'waiter',
  CHEF = 'chef',
  BRANCH_MANAGER = 'branch_manager',
  POS_OPERATOR = 'pos_operator',
  STAFF = 'staff',
}

export interface Branch {
  id: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  isDefault: boolean;
  status: boolean;
}

export interface ItemCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  parentCategoryId?: string;
  children?: ItemCategory[];
  status: boolean;
  sortOrder: number;
}

export interface Item {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  categoryId?: string;
  category?: ItemCategory;
  itemType: string;
  thumbImage?: string;
  coverImage?: string;
  gallery?: string[];
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  taxRate: number;
  isFeatured: boolean;
  status: boolean;
  sortOrder: number;
  variations?: ItemVariation[];
}

export interface ItemVariation {
  id: string;
  itemId: string;
  name: string;
  price: number;
  additionalPrice: number;
  attributeName?: string;
  status: boolean;
}

export interface Order {
  id: string;
  orderSerialNo: string;
  token: string;
  userId?: string;
  user?: User;
  diningTableId?: string;
  diningTable?: DiningTable;
  items: OrderItem[];
  orderType: OrderType;
  status: OrderStatus;
  paymentMethod: string;
  paymentGateway?: string;
  paymentStatus: string;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  totalTax: number;
  total: number;
  deliveryAddress?: any;
  orderNote?: string;
  cancellationReason?: string;
  scheduledAt?: string;
  isAdvanceOrder: boolean;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  itemId: string;
  item?: Item;
  variationId?: string;
  variationName?: string;
  itemName: string;
  itemImage?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  subtotal: number;
  extras?: any[];
  specialNote?: string;
}

export enum OrderType {
  DELIVERY = 'delivery',
  TAKEAWAY = 'takeaway',
  POS = 'pos',
  DINING_TABLE = 'dining_table',
}

export enum PaymentMethod {
  CASH_ON_DELIVERY = 'cash_on_delivery',
  E_WALLET = 'e_wallet',
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  RAZORPAY = 'razorpay',
  CASHFREE = 'cashfree',
  MOLLIE = 'mollie',
  FLUTTERWAVE = 'flutterwave',
  PAYSTACK = 'paystack',
  PHONEPE = 'phonepe',
  PAYTM = 'paytm',
  BKASH = 'bkash',
}

export enum OrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  PREPARING = 'preparing',
  PREPARED = 'prepared',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELED = 'canceled',
  REJECTED = 'rejected',
  RETURNED = 'returned',
}

export interface DiningTable {
  id: string;
  name: string;
  slug: string;
  capacity: number;
  branchId?: string;
  branch?: Branch;
  waiterId?: string;
  waiter?: User;
  qrCode?: string;
  status: string;
}

export interface LoyaltyProgram {
  id: string;
  name: string;
  description?: string;
  requiredStamps: number;
  isActive: boolean;
  autoResetStamps: boolean;
  configurations: LoyaltyConfiguration[];
}

export interface LoyaltyConfiguration {
  id: string;
  name: string;
  calculationType: string;
  thresholdValue: number;
  stampsPerThreshold: number;
  rewardType: string;
  rewardValue: number;
  periodType: string;
}

export interface LoyaltyDashboard {
  program: LoyaltyProgram;
  totalStamps: number;
  pendingRewards: any[];
  nextRewardAt: number;
  progressPercent: number;
}

export interface Offer {
  id: string;
  title: string;
  description?: string;
  image?: string;
  badgeText?: string;
  badgeColor?: string;
  startDate?: string;
  endDate?: string;
  status: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  linkUrl?: string;
  status: boolean;
  sortOrder: number;
}

export interface PromotionBanner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  badgeText?: string;
  badgeColor?: string;
  linkUrl?: string;
  sortOrder: number;
  status: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  orderId?: string;
  paymentMethod: string;
  status: string;
  amount: number;
  currency?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface CartItem {
  item: Item;
  variation?: ItemVariation;
  quantity: number;
  specialNote?: string;
  extras?: any[];
}

export interface DashboardStats {
  totalOrders: number;
  todayOrders: number;
  totalCustomers: number;
  totalItems: number;
  totalTables: number;
  totalRevenue: number;
  todayRevenue: number;
  monthRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
}

export interface Currency {
  id: string;
  name: string;
  code: string;
  symbol: string;
  exchangeRate: number;
  isDefault: boolean;
  status: boolean;
}

export interface Tax {
  id: string;
  name: string;
  rate: number;
  isIncluded: boolean;
  isDefault: boolean;
  status: boolean;
}

export interface ItemExtra {
  id: string;
  itemId: string;
  name: string;
  price: number;
  status: boolean;
}
