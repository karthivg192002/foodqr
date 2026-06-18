import { RawBodyRequest } from '@nestjs/common';
import { Response } from 'express';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { User } from '../users/entities/user.entity';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    getGateways(): {
        gateways: {
            key: string;
            name: string;
            icon: string;
            enabled: boolean;
        }[];
    };
    createStripeIntent(user: User, orderId: string): Promise<{
        clientSecret: string;
        paymentIntentId: string;
    }>;
    payWithEWallet(user: User, orderId: string): Promise<{
        message: string;
        transaction: import("./entities/transaction.entity").Transaction;
    }>;
    stripeWebhook(req: RawBodyRequest<Request>, sig: string): Promise<{
        received: boolean;
    }>;
    myfatoorahWebhook(body: any): Promise<{
        received: boolean;
    }>;
    mollieWebhook(body: any): Promise<{
        received: boolean;
    }>;
    createRazorpayOrder(user: User, orderId: string): Promise<{
        razorpayOrderId: any;
        keyId: any;
        amount: number;
        currency: string;
    }>;
    razorpayWebhook(body: any): Promise<{
        received: boolean;
    }>;
    createPaypalOrder(user: User, orderId: string): Promise<{
        paypalOrderId: any;
        approvalUrl: any;
    }>;
    capturePaypal(paypalOrderId: string): Promise<{
        status: any;
    }>;
    createPaystackTransaction(user: User, orderId: string): Promise<{
        authorizationUrl: any;
        reference: any;
    }>;
    paystackWebhook(body: any): Promise<{
        received: boolean;
    }>;
    createFlutterwavePayment(user: User, orderId: string): Promise<{
        paymentLink: any;
        txRef: string;
    }>;
    flutterwaveWebhook(body: any): Promise<{
        received: boolean;
    }>;
    createBkashPayment(user: User, orderId: string): Promise<{
        message: string;
        amount: number;
        orderId: string;
    }>;
    payWithCredit(user: User, orderId: string): Promise<{
        message: string;
        transaction: import("./entities/transaction.entity").Transaction;
    }>;
    getCreditBalance(user: User): Promise<{
        balance: number;
        currency: string;
    }>;
    getTransactions(page?: number, limit?: number): Promise<{
        data: import("./entities/transaction.entity").Transaction[];
        total: number;
        page: number;
        limit: number;
    }>;
    getMyTransactions(user: User): Promise<{
        data: import("./entities/transaction.entity").Transaction[];
        total: number;
        page: number;
        limit: number;
    }>;
    exportTransactionsExcel(res: Response): Promise<void>;
    paymentSuccess(orderId: string, gateway: string, res: Response): void;
    paymentFail(orderId: string, res: Response): void;
    paymentCancel(orderId: string, res: Response): void;
}
