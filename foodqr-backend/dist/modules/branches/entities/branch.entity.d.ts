import { Tenant } from '../../tenants/entities/tenant.entity';
export declare class Branch {
    id: string;
    tenantId: string;
    tenant: Tenant;
    name: string;
    slug: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    phone: string;
    email: string;
    latitude: string;
    longitude: string;
    image: string;
    isDefault: boolean;
    status: boolean;
    createdAt: Date;
    updatedAt: Date;
}
