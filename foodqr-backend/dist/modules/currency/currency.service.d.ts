import { Repository } from 'typeorm';
import { Currency } from './entities/currency.entity';
export declare class CreateCurrencyDto {
    name: string;
    code: string;
    symbol: string;
    exchangeRate?: number;
    isDefault?: boolean;
    status?: boolean;
}
export declare class CurrencyService {
    private currencyRepo;
    constructor(currencyRepo: Repository<Currency>);
    findAll(): Promise<Currency[]>;
    findActive(): Promise<Currency[]>;
    findOne(id: string): Promise<Currency>;
    create(dto: CreateCurrencyDto): Promise<Currency>;
    update(id: string, dto: Partial<CreateCurrencyDto>): Promise<Currency>;
    setDefault(id: string): Promise<Currency>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getDefault(): Promise<Currency | null>;
    convertAmount(amount: number, toCurrencyCode: string): Promise<{
        amount: number;
        converted: number;
        rate: number;
        symbol: string;
        code: string;
    }>;
    convertBulk(amounts: number[], toCurrencyCode: string): Promise<{
        rate: number;
        symbol: string;
        code: string;
        amounts: number[];
    }>;
}
