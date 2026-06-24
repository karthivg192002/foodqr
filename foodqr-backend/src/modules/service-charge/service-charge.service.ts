import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceCharge } from './entities/service-charge.entity';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
import { tenantAwareRepo } from '../tenants/connection/tenant-aware-repo';

export class CreateServiceChargeDto {
  @IsString()
  name: string;

  @IsNumber() @Type(() => Number)
  rate: number;

  @IsString() @IsOptional()
  type?: string;

  @IsBoolean() @IsOptional()
  isIncluded?: boolean;

  @IsBoolean() @IsOptional()
  isDefault?: boolean;

  @IsBoolean() @IsOptional()
  status?: boolean;
}

@Injectable()
export class ServiceChargeService {
  constructor(
    @InjectRepository(ServiceCharge) private serviceChargeRepo: Repository<ServiceCharge>,
    connections: TenantConnectionService,
  ) {
    this.serviceChargeRepo = tenantAwareRepo(connections, ServiceCharge, serviceChargeRepo);
  }

  async findAll(): Promise<ServiceCharge[]> {
    return this.serviceChargeRepo.find({ order: { isDefault: 'DESC', name: 'ASC' } });
  }

  async findActive(): Promise<ServiceCharge[]> {
    return this.serviceChargeRepo.find({
      where: { status: true },
      order: { isDefault: 'DESC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ServiceCharge> {
    const serviceCharge = await this.serviceChargeRepo.findOne({ where: { id } });
    if (!serviceCharge) throw new NotFoundException('Service charge not found');
    return serviceCharge;
  }

  async create(dto: CreateServiceChargeDto): Promise<ServiceCharge> {
    const serviceCharge = this.serviceChargeRepo.create(dto);
    return this.serviceChargeRepo.save(serviceCharge);
  }

  async update(id: string, dto: Partial<CreateServiceChargeDto>): Promise<ServiceCharge> {
    await this.findOne(id);
    await this.serviceChargeRepo.update(id, dto);
    return this.findOne(id);
  }

  async setDefault(id: string): Promise<ServiceCharge> {
    await this.findOne(id);
    await this.serviceChargeRepo.update({}, { isDefault: false });
    await this.serviceChargeRepo.update(id, { isDefault: true });
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.serviceChargeRepo.delete(id);
    return { message: 'Service charge deleted' };
  }
}
