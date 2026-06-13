import { Order } from './order.entity';
export declare class OrderAddress {
    id: string;
    orderId: string;
    order: Order;
    userId: string;
    label: string;
    address: string;
    apartment: string;
    latitude: string;
    longitude: string;
    createdAt: Date;
}
