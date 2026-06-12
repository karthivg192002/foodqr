import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';

export class CreateBranchDto {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  email?: string;
  latitude?: string;
  longitude?: string;
  image?: string;
  isDefault?: boolean;
}

@Injectable()
export class BranchesService {
  constructor(@InjectRepository(Branch) private branchRepo: Repository<Branch>) {}

  findAll() {
    return this.branchRepo.find({ where: { status: true }, order: { isDefault: 'DESC', createdAt: 'ASC' } });
  }

  async findOne(id: string) {
    const branch = await this.branchRepo.findOne({ where: { id } });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async create(dto: CreateBranchDto) {
    const slug = dto.name.toLowerCase().replace(/\s+/g, '-');
    const branch = this.branchRepo.create({ ...dto, slug });
    return this.branchRepo.save(branch);
  }

  async update(id: string, dto: Partial<CreateBranchDto>) {
    await this.findOne(id);
    await this.branchRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.branchRepo.delete(id);
    return { message: 'Branch deleted' };
  }

  async setDefault(id: string) {
    await this.branchRepo.update({}, { isDefault: false });
    await this.branchRepo.update(id, { isDefault: true });
    return this.findOne(id);
  }
}
