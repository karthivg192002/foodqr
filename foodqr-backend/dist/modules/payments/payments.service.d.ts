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
    handleMyfatoorahWebhook(body: any): Promise<{
        received: boolean;
    }>;
    handleMollieWebhook(body: any): Promise<{
        received: boolean;
    }>;
    createRazorpayOrder(orderId: string, userId: string): Promise<{
        razorpayOrderId: any;
        keyId: any;
        amount: number;
        currency: string;
    }>;
    handleRazorpayWebhook(body: any): Promise<{
        received: boolean;
    }>;
    createPaypalOrder(orderId: string, userId: string): Promise<{
        paypalOrderId: any;
        approvalUrl: any;
    }>;
    capturePaypalPayment(paypalOrderId: string): Promise<{
        status: any;
    }>;
    createPaystackTransaction(orderId: string, userId: string): Promise<{
        authorizationUrl: any;
        reference: any;
    }>;
    handlePaystackWebhook(body: any): Promise<{
        received: boolean;
    }>;
    createFlutterwavePayment(orderId: string, userId: string): Promise<{
        paymentLink: any;
        txRef: string;
    }>;
    handleFlutterwaveWebhook(body: any): Promise<{
        received: boolean;
    }>;
    createBkashPayment(orderId: string, userId: string): Promise<{
        message: string;
        amount: number;
        orderId: string;
    }>;
    getCreditBalance(userId: string): Promise<{
        balance: number;
        currency: string;
    }>;
    exportTransactionsExcel(res: any): Promise<void>;
    getAvailableGateways(): {
        gateways: {
            key: string;
            name: string;
            icon: string;
            enabled: boolean;
        }[];
    };
}
