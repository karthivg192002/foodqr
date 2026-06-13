import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from '../../common/enums';
import { UpdateUserDto, UpdateDeviceTokenDto } from './dto/user.dto';
export declare class UsersService {
    private userRepo;
    constructor(userRepo: Repository<User>);
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
    updateBalance(userId: string, amount: number): Promise<void>;
}
