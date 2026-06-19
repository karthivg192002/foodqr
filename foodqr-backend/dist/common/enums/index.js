"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationChannel = exports.TableStatus = exports.UserStatus = exports.LoyaltyPeriodType = exports.LoyaltyRewardType = exports.LoyaltyStampCalculationType = exports.ItemType = exports.PaymentStatus = exports.PaymentMethod = exports.OrderStatus = exports.OrderType = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ADMIN"] = "admin";
    UserRole["CUSTOMER"] = "customer";
    UserRole["WAITER"] = "waiter";
    UserRole["CHEF"] = "chef";
    UserRole["BRANCH_MANAGER"] = "branch_manager";
    UserRole["POS_OPERATOR"] = "pos_operator";
    UserRole["STAFF"] = "staff";
})(UserRole || (exports.UserRole = UserRole = {}));
var OrderType;
(function (OrderType) {
    OrderType["DELIVERY"] = "delivery";
    OrderType["TAKEAWAY"] = "takeaway";
    OrderType["POS"] = "pos";
    OrderType["DINING_TABLE"] = "dining_table";
})(OrderType || (exports.OrderType = OrderType = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "pending";
    OrderStatus["ACCEPTED"] = "accepted";
    OrderStatus["PREPARING"] = "preparing";
    OrderStatus["PREPARED"] = "prepared";
    OrderStatus["OUT_FOR_DELIVERY"] = "out_for_delivery";
    OrderStatus["DELIVERED"] = "delivered";
    OrderStatus["CANCELED"] = "canceled";
    OrderStatus["REJECTED"] = "rejected";
    OrderStatus["RETURNED"] = "returned";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH_ON_DELIVERY"] = "cash_on_delivery";
    PaymentMethod["E_WALLET"] = "e_wallet";
    PaymentMethod["STRIPE"] = "stripe";
    PaymentMethod["PAYPAL"] = "paypal";
    PaymentMethod["RAZORPAY"] = "razorpay";
    PaymentMethod["CASHFREE"] = "cashfree";
    PaymentMethod["MOLLIE"] = "mollie";
    PaymentMethod["FLUTTERWAVE"] = "flutterwave";
    PaymentMethod["PAYTM"] = "paytm";
    PaymentMethod["BKASH"] = "bkash";
    PaymentMethod["PAYSTACK"] = "paystack";
    PaymentMethod["PHONEPE"] = "phonepe";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["UNPAID"] = "unpaid";
    PaymentStatus["PAID"] = "paid";
    PaymentStatus["REFUNDED"] = "refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var ItemType;
(function (ItemType) {
    ItemType["VEG"] = "veg";
    ItemType["NON_VEG"] = "non_veg";
    ItemType["VEGAN"] = "vegan";
    ItemType["BEVERAGE"] = "beverage";
})(ItemType || (exports.ItemType = ItemType = {}));
var LoyaltyStampCalculationType;
(function (LoyaltyStampCalculationType) {
    LoyaltyStampCalculationType["FIXED_PER_ORDER"] = "fixed_per_order";
    LoyaltyStampCalculationType["PERCENTAGE_BASED"] = "percentage_based";
    LoyaltyStampCalculationType["ORDER_AMOUNT"] = "order_amount";
})(LoyaltyStampCalculationType || (exports.LoyaltyStampCalculationType = LoyaltyStampCalculationType = {}));
var LoyaltyRewardType;
(function (LoyaltyRewardType) {
    LoyaltyRewardType["DISCOUNT"] = "discount";
    LoyaltyRewardType["FREE_ITEM"] = "free_item";
    LoyaltyRewardType["CASHBACK"] = "cashback";
    LoyaltyRewardType["POINTS"] = "points";
})(LoyaltyRewardType || (exports.LoyaltyRewardType = LoyaltyRewardType = {}));
var LoyaltyPeriodType;
(function (LoyaltyPeriodType) {
    LoyaltyPeriodType["DAILY"] = "daily";
    LoyaltyPeriodType["WEEKLY"] = "weekly";
    LoyaltyPeriodType["MONTHLY"] = "monthly";
    LoyaltyPeriodType["LIFETIME"] = "lifetime";
})(LoyaltyPeriodType || (exports.LoyaltyPeriodType = LoyaltyPeriodType = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["BANNED"] = "banned";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var TableStatus;
(function (TableStatus) {
    TableStatus["AVAILABLE"] = "available";
    TableStatus["OCCUPIED"] = "occupied";
    TableStatus["RESERVED"] = "reserved";
})(TableStatus || (exports.TableStatus = TableStatus = {}));
var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["PUSH"] = "push";
    NotificationChannel["EMAIL"] = "email";
    NotificationChannel["SMS"] = "sms";
})(NotificationChannel || (exports.NotificationChannel = NotificationChannel = {}));
//# sourceMappingURL=index.js.map