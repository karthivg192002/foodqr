import { RawBodyRequest } from '@nestjs/common';
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
}
