import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { Address } from '../addresses/entities/address.entity';
import { UserRole, UserStatus } from '../../common/enums';
import { UpdateUserDto, UpdateDeviceTokenDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Address) private addressRepo: Repository<Address>,
  ) {}

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

  async createUser(dto: {
    name: string; email?: string; phone?: string; password: string;
    role?: UserRole; branchId?: string; countryCode?: string;
  }) {
    if (dto.email) {
      const exists = await this.userRepo.findOne({ where: { email: dto.email } });
      if (exists) throw new BadRequestException('Email already registered');
    }
    const hashed = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({
      ...dto,
      password: hashed,
      role: dto.role || UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
    });
    await this.userRepo.save(user);
    const { password, ...rest } = user as any;
    return rest;
  }

  async changeUserPassword(id: string, newPassword: string) {
    await this.findOne(id);
    const hashed = await bcrypt.hash(newPassword, 12);
    await this.userRepo.update(id, { password: hashed });
    return { message: 'Password updated' };
  }

  async updateBalance(userId: string, amount: number) {
    await this.userRepo.increment({ id: userId }, 'balance', amount);
  }

  async getDefaultBranch(userId: string) {
    const user = await this.findOne(userId);
    return { branchId: user.branchId, branch: user.branch };
  }

  async setDefaultBranch(userId: string, branchId: string) {
    await this.userRepo.update(userId, { branchId });
    return this.findOne(userId);
  }

  async getUserAddresses(userId: string) {
    await this.findOne(userId);
    return this.addressRepo.find({ where: { userId }, order: { isDefault: 'DESC', createdAt: 'DESC' } });
  }

  async getCustomerOrders(userId: string, page = 1, limit = 20) {
    await this.findOne(userId);
    const [data, total] = await this.orderRepo.findAndCount({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getByRole(role: UserRole, search?: string, page = 1, limit = 20) {
    const qb = this.userRepo.createQueryBuilder('user')
      .where('user.role = :role', { role })
      .leftJoinAndSelect('user.branch', 'branch')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.createdAt', 'DESC');
    if (search) qb.andWhere('user.name ILIKE :search', { search: `%${search}%` });
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getStaffOrders(staffId: string, page = 1, limit = 20) {
    await this.findOne(staffId);
    const [data, total] = await this.orderRepo.findAndCount({
      where: { staffId } as any,
      relations: ['items', 'diningTable'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async exportStaffExcel(res: any) {
    const staffRoles = [UserRole.WAITER, UserRole.CHEF, UserRole.STAFF, UserRole.POS_OPERATOR, UserRole.BRANCH_MANAGER];
    const staff = await this.userRepo.createQueryBuilder('user')
      .where('user.role IN (:...roles)', { roles: staffRoles })
      .leftJoinAndSelect('user.branch', 'branch')
      .orderBy('user.role', 'ASC')
      .addOrderBy('user.name', 'ASC')
      .getMany();

    const headers = ['Name', 'Email', 'Phone', 'Role', 'Branch', 'Status', 'Joined'];
    const rows = staff.map((u) => [
      u.name, u.email || '', u.phone || '', u.role, u.branch?.name || '', u.status,
      u.createdAt?.toISOString().split('T')[0] || '',
    ]);

    const ths = headers.map((h) => `<th style="background:#f97316;color:white;padding:6px 10px;border:1px solid #ddd">${h}</th>`).join('');
    const trs = rows.map((r) => `<tr>${r.map((c) => `<td style="padding:5px 10px;border:1px solid #ddd">${c}</td>`).join('')}</tr>`).join('');
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><h2>Staff</h2><table border="1"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></body></html>`;

    res.set({ 'Content-Type': 'application/vnd.ms-excel', 'Content-Disposition': 'attachment; filename="staff.xls"' });
    res.send(html);
  }
}
