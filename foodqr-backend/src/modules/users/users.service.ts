import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from '../../common/enums';
import { UpdateUserDto, UpdateDeviceTokenDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async findAll(role?: UserRole, search?: string, page = 1, limit = 20) {
    const where: any = {};
    if (role) where.role = role;
    if (search) where.name = Like(`%${search}%`);

    const [data, total] = await this.userRepo.findAndCount({
      where,
      relations: ['branch'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const user = await this.userRepo.findOne({ where: { id }, relations: ['branch'] });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    await this.userRepo.update(id, dto);
    return this.findOne(id);
  }

  async updateDeviceToken(id: string, dto: UpdateDeviceTokenDto) {
    await this.userRepo.update(id, dto);
    return { message: 'Device token updated' };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.userRepo.softDelete(id);
    return { message: 'User deleted' };
  }

  async getCustomers(search?: string, page = 1, limit = 20) {
    return this.findAll(UserRole.CUSTOMER, search, page, limit);
  }

  async getStaff(search?: string, page = 1, limit = 20) {
    const roles = [UserRole.WAITER, UserRole.CHEF, UserRole.STAFF, UserRole.POS_OPERATOR];
    const qb = this.userRepo.createQueryBuilder('user')
      .where('user.role IN (:...roles)', { roles })
      .leftJoinAndSelect('user.branch', 'branch')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.createdAt', 'DESC');
    if (search) qb.andWhere('user.name ILIKE :search', { search: `%${search}%` });
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async updateBalance(userId: string, amount: number) {
    await this.userRepo.increment({ id: userId }, 'balance', amount);
  }
}
