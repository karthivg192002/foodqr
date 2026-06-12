export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
  WAITER = 'waiter',
  CHEF = 'chef',
  BRANCH_MANAGER = 'branch_manager',
  POS_OPERATOR = 'pos_operator',
  STAFF = 'staff',
}

export enum OrderType {
  DELIVERY = 'delivery',
  TAKEAWAY = 'takeaway',
  POS = 'pos',
  DINING_TABLE = 'dining_table',
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

export enum PaymentMethod {
  CASH_ON_DELIVERY = 'cash_on_delivery',
  E_WALLET = 'e_wallet',
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  RAZORPAY = 'razorpay',
  CASHFREE = 'cashfree',
  MOLLIE = 'mollie',
  FLUTTERWAVE = 'flutterwave',
  PAYTM = 'paytm',
  BKASH = 'bkash',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  REFUNDED = 'refunded',
}

export enum ItemType {
  VEG = 'veg',
  NON_VEG = 'non_veg',
  VEGAN = 'vegan',
  BEVERAGE = 'beverage',
}

export enum LoyaltyStampCalculationType {
  FIXED_PER_ORDER = 'fixed_per_order',
  PERCENTAGE_BASED = 'percentage_based',
  ORDER_AMOUNT = 'order_amount',
}

export enum LoyaltyRewardType {
  DISCOUNT = 'discount',
  FREE_ITEM = 'free_item',
  CASHBACK = 'cashback',
  POINTS = 'points',
}

export enum LoyaltyPeriodType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  LIFETIME = 'lifetime',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
}

export enum NotificationChannel {
  PUSH = 'push',
  EMAIL = 'email',
  SMS = 'sms',
}
