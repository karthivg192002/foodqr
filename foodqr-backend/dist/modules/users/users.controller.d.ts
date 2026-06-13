import { UsersService } from './users.service';
import { UpdateUserDto, UpdateDeviceTokenDto } from './dto/user.dto';
import { User } from './entities/user.entity';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
    findOne(id: string): Promise<User>;
    update(id: string, dto: UpdateUserDto): Promise<User>;
    remove(id: string): Promise<{
        message: string;
    }>;
    updateProfile(user: User, dto: UpdateUserDto): Promise<User>;
    updateDeviceToken(user: User, dto: UpdateDeviceTokenDto): Promise<{
        message: string;
    }>;
}
