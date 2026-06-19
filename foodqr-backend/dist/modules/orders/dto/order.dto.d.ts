import { OrderType, PaymentMethod } from '../../../common/enums';
export declare class OrderItemExtraDto {
    extraId?: string;
    name: string;
    price: number;
}
export declare class OrderItemDto {
    itemId: string;
    variationId?: string;
    quantity: number;
    specialNote?: string;
    extras?: OrderItemExtraDto[];
}
export declare class CreateOrderDto {
    orderType: OrderType;
    items: OrderItemDto[];
    paymentMethod: PaymentMethod;
    paymentGateway?: string;
    diningTableId?: string;
    branchId?: string;
    deliveryAddress?: object;
    orderNote?: string;
    scheduledAt?: Date;
    isAdvanceOrder?: boolean;
    discount?: number;
    couponCode?: string;
    deliveryDistanceKm?: number;
    deliveryAddressSnapshot?: object;
    posReceivedAmount?: number;
    customerId?: string;
}
export declare class UpdateOrderStatusDto {
    status: string;
    cancellationReason?: string;
    staffId?: string;
}
