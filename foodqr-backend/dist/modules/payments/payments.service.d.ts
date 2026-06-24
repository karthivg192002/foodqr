import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Transaction } from './entities/transaction.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { PaymentGateway } from '../payment-gateways/entities/payment-gateway.entity';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
export declare class PaymentsService {
    private transactionRepo;
    private orderRepo;
    private userRepo;
    private paymentGatewayRepo;
    private configService;
    private stripe;
    constructor(transactionRepo: Repository<Transaction>, orderRepo: Repository<Order>, userRepo: Repository<User>, paymentGatewayRepo: Repository<PaymentGateway>, configService: ConfigService, connections: TenantConnectionService);
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
        keyId: string;
        amount: number;
        currency: string;
    }>;
    verifyRazorpayPayment(body: {
        orderId: string;
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
    }): Promise<{
        message: string;
        orderId: string;
        paymentId: string;
    }>;
    private getRazorpayCredentials;
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
