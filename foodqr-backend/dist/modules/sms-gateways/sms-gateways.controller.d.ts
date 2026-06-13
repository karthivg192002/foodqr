import { SmsGatewaysService } from './sms-gateways.service';
export declare class SmsGatewaysController {
    private readonly service;
    constructor(service: SmsGatewaysService);
    findAll(): Promise<import("./entities/sms-gateway.entity").SmsGateway[]>;
    findOne(slug: string): Promise<import("./entities/sms-gateway.entity").SmsGateway>;
    update(slug: string, body: {
        isActive?: boolean;
        config?: Record<string, string>;
    }): Promise<import("./entities/sms-gateway.entity").SmsGateway>;
}
