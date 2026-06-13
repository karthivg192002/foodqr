import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Transaction } from './entities/transaction.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
export declare class PaymentsService {
    private transactionRepo;
    private orderRepo;
    private userRepo;
    private configService;
    private stripe;
    constructor(transactionRepo: Repository<Transaction>, orderRepo: Repository<Order>, userRepo: Repository<User>, configService: ConfigService);
    createStripePaymentIntent(orderId: string, userId: string): Promise<{
        clientSecret: string;
        paymentIntentId: string;
    }>;
    handleStripeWebhook(payload: Buffer, signature: string): Promise<{
        received: boolean;
    }>;
    processEWalletPayment(userId: string, orderId: string): Promise<{
        message: string;
        transaction: Transaction;
    }>;
    getTransactions(userId?: string, page?: number, limit?: number): Promise<{
        data: Transaction[];
        total: number;
        page: number;
        limit: number;
    }>;
    getAvailableGateways(): {
        gateways: {
            key: string;
            name: string;
            icon: string;
            enabled: boolean;
        }[];
    };
}
