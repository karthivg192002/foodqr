import { PaymentGatewaysService } from './payment-gateways.service';
export declare class PaymentGatewaysController {
    private readonly service;
    constructor(service: PaymentGatewaysService);
    findAll(): Promise<import("./entities/payment-gateway.entity").PaymentGateway[]>;
    findActive(): Promise<import("./entities/payment-gateway.entity").PaymentGateway[]>;
    findOne(slug: string): Promise<import("./entities/payment-gateway.entity").PaymentGateway>;
    update(slug: string, body: {
        isActive?: boolean;
        mode?: string;
        config?: Record<string, string>;
    }): Promise<import("./entities/payment-gateway.entity").PaymentGateway>;
}
