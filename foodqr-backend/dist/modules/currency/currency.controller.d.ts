import { CurrencyService, CreateCurrencyDto } from './currency.service';
export declare class CurrencyController {
    private readonly currencyService;
    constructor(currencyService: CurrencyService);
    findActive(): Promise<import("./entities/currency.entity").Currency[]>;
    convert(amount: string, to: string): Promise<{
        amount: number;
        converted: number;
        rate: number;
        symbol: string;
        code: string;
    }>;
    findAll(): Promise<import("./entities/currency.entity").Currency[]>;
    create(dto: CreateCurrencyDto): Promise<import("./entities/currency.entity").Currency>;
    update(id: string, dto: Partial<CreateCurrencyDto>): Promise<import("./entities/currency.entity").Currency>;
    setDefault(id: string): Promise<import("./entities/currency.entity").Currency>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
