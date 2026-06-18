import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { Address } from '../addresses/entities/address.entity';
import { UserRole } from '../../common/enums';
import { UpdateUserDto, UpdateDeviceTokenDto } from './dto/user.dto';
export declare class UsersService {
    private userRepo;
    private orderRepo;
    private addressRepo;
    constructor(userRepo: Repository<User>, orderRepo: Repository<Order>, addressRepo: Repository<Address>);
    findAll(role?: UserRole, search?: string, page?: number, limit?: number): Promise<{
        data: User[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    findOne(id: string): Promise<User>;
    update(id: string, dto: UpdateUserDto): Promise<User>;
    updateDeviceToken(id: string, dto: UpdateDeviceTokenDto): Promise<{
        message: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getCustomers(search?: string, page?: number, limit?: number): Promise<{
        data: User[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    getStaff(search?: string, page?: number, limit?: number): Promise<{
        data: User[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    createUser(dto: {
        name: string;
        email?: string;
        phone?: string;
        password: string;
        role?: UserRole;
        branchId?: string;
        countryCode?: string;
    }): Promise<any>;
    changeUserPassword(id: string, newPassword: string): Promise<{
        message: string;
    }>;
    updateBalance(userId: string, amount: number): Promise<void>;
    getDefaultBranch(userId: string): Promise<{
        branchId: string;
        branch: import("../branches/entities/branch.entity").Branch;
    }>;
    setDefaultBranch(userId: string, branchId: string): Promise<User>;
    getUserAddresses(userId: string): Promise<Address[]>;
    getCustomerOrders(userId: string, page?: number, limit?: number): Promise<{
        data: Order[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    getByRole(role: UserRole, search?: string, page?: number, limit?: number): Promise<{
        data: User[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    getStaffOrders(staffId: string, page?: number, limit?: number): Promise<{
        data: Order[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    exportStaffExcel(res: any): Promise<void>;
}
