import { AddressesService } from './addresses.service';
export declare class AddressesController {
    private readonly service;
    constructor(service: AddressesService);
    findAll(req: any): Promise<import("./entities/address.entity").Address[]>;
    create(req: any, body: {
        label: string;
        address: string;
        apartment?: string;
        latitude?: string;
        longitude?: string;
        isDefault?: boolean;
    }): Promise<import("./entities/address.entity").Address>;
    update(id: string, req: any, body: any): Promise<import("./entities/address.entity").Address>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
