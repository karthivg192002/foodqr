import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsString, IsOptional, IsNumber, IsBoolean, IsNotEmpty } from 'class-validator';
import { Currency } from './entities/currency.entity';

export class CreateCurrencyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  symbol: string;

  @IsNumber()
  @IsOptional()
  exchangeRate?: number;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(Currency) private currencyRepo: Repository<Currency>,
  ) {}

  async findAll(): Promise<Currency[]> {
    return this.currencyRepo.find({ order: { isDefault: 'DESC', name: 'ASC' } });
  }

  async findActive(): Promise<Currency[]> {
    return this.currencyRepo.find({
      where: { status: true },
      order: { isDefault: 'DESC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Currency> {
    const currency = await this.currencyRepo.findOne({ where: { id } });
    if (!currency) throw new NotFoundException('Currency not found');
    return currency;
  }

  async create(dto: CreateCurrencyDto): Promise<Currency> {
    const currency = this.currencyRepo.create(dto);
    return this.currencyRepo.save(currency);
  }

  async update(id: string, dto: Partial<CreateCurrencyDto>): Promise<Currency> {
    await this.findOne(id);
    await this.currencyRepo.update(id, dto);
    return this.findOne(id);
  }

  async setDefault(id: string): Promise<Currency> {
    await this.findOne(id);
    await this.currencyRepo.update({}, { isDefault: false });
    await this.currencyRepo.update(id, { isDefault: true });
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.currencyRepo.delete(id);
    return { message: 'Currency deleted' };
  }

  async getDefault(): Promise<Currency | null> {
    return this.currencyRepo.findOne({ where: { isDefault: true, status: true } });
  }

  async convertAmount(amount: number, toCurrencyCode: string): Promise<{
    amount: number; converted: number; rate: number; symbol: string; code: string;
  }> {
    const target = await this.currencyRepo.findOne({ where: { code: toCurrencyCode.toUpperCase(), status: true } });
    if (!target) throw new NotFoundException(`Currency ${toCurrencyCode} not found`);
    const defaultCurrency = await this.getDefault();
    // Amounts stored in default currency (rate=1). Convert to target.
    const baseRate = defaultCurrency?.exchangeRate || 1;
    const converted = (amount / Number(baseRate)) * Number(target.exchangeRate);
    return {
      amount,
      converted: Math.round(converted * 100) / 100,
      rate: Number(target.exchangeRate),
      symbol: target.symbol,
      code: target.code,
    };
  }

  async convertBulk(amounts: number[], toCurrencyCode: string) {
    const target = await this.currencyRepo.findOne({ where: { code: toCurrencyCode.toUpperCase(), status: true } });
    if (!target) throw new NotFoundException(`Currency ${toCurrencyCode} not found`);
    const rate = Number(target.exchangeRate);
    return { rate, symbol: target.symbol, code: target.code, amounts: amounts.map((a) => Math.round(a * rate * 100) / 100) };
  }
}
