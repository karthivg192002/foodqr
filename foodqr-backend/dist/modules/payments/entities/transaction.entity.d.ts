import { PaymentMethod, PaymentStatus } from '../../../common/enums';
import { User } from '../../users/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';
export declare class Transaction {
    id: string;
    userId: string;
    user: User;
    orderId: string;
    order: Order;
    sign: string;
    transactionNo: string;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    type: string;
    amount: number;
    currency: string;
    gatewayTransactionId: string;
    gatewayResponse: string;
    notes: string;
    createdAt: Date;
}
