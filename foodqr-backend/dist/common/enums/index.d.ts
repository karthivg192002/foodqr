export declare enum UserRole {
    ADMIN = "admin",
    CUSTOMER = "customer",
    WAITER = "waiter",
    CHEF = "chef",
    BRANCH_MANAGER = "branch_manager",
    POS_OPERATOR = "pos_operator",
    STAFF = "staff"
}
export declare enum OrderType {
    DELIVERY = "delivery",
    TAKEAWAY = "takeaway",
    POS = "pos",
    DINING_TABLE = "dining_table"
}
export declare enum OrderStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    PREPARING = "preparing",
    PREPARED = "prepared",
    OUT_FOR_DELIVERY = "out_for_delivery",
    DELIVERED = "delivered",
    CANCELED = "canceled",
    REJECTED = "rejected",
    RETURNED = "returned"
}
export declare enum PaymentMethod {
    CASH_ON_DELIVERY = "cash_on_delivery",
    E_WALLET = "e_wallet",
    STRIPE = "stripe",
    PAYPAL = "paypal",
    RAZORPAY = "razorpay",
    CASHFREE = "cashfree",
    MOLLIE = "mollie",
    FLUTTERWAVE = "flutterwave",
    PAYTM = "paytm",
    BKASH = "bkash"
}
export declare enum PaymentStatus {
    UNPAID = "unpaid",
    PAID = "paid",
    REFUNDED = "refunded"
}
export declare enum ItemType {
    VEG = "veg",
    NON_VEG = "non_veg",
    VEGAN = "vegan",
    BEVERAGE = "beverage"
}
export declare enum LoyaltyStampCalculationType {
    FIXED_PER_ORDER = "fixed_per_order",
    PERCENTAGE_BASED = "percentage_based",
    ORDER_AMOUNT = "order_amount"
}
export declare enum LoyaltyRewardType {
    DISCOUNT = "discount",
    FREE_ITEM = "free_item",
    CASHBACK = "cashback",
    POINTS = "points"
}
export declare enum LoyaltyPeriodType {
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    LIFETIME = "lifetime"
}
export declare enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    BANNED = "banned"
}
export declare enum TableStatus {
    AVAILABLE = "available",
    OCCUPIED = "occupied",
    RESERVED = "reserved"
}
export declare enum NotificationChannel {
    PUSH = "push",
    EMAIL = "email",
    SMS = "sms"
}
