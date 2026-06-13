import { TaxService, CreateTaxDto } from './tax.service';
export declare class TaxController {
    private readonly taxService;
    constructor(taxService: TaxService);
    findActive(): Promise<import("./entities/tax.entity").Tax[]>;
    findAll(): Promise<import("./entities/tax.entity").Tax[]>;
    create(dto: CreateTaxDto): Promise<import("./entities/tax.entity").Tax>;
    update(id: string, dto: Partial<CreateTaxDto>): Promise<import("./entities/tax.entity").Tax>;
    setDefault(id: string): Promise<import("./entities/tax.entity").Tax>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
