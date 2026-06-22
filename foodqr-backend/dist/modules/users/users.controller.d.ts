import { UsersService } from './users.service';
import { UpdateUserDto, UpdateDeviceTokenDto } from './dto/user.dto';
import { UserRole } from '../../common/enums';
import { User } from './entities/user.entity';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    createUser(body: {
        name: string;
        email?: string;
        phone?: string;
        password: string;
        role?: UserRole;
        branchId?: string;
        countryCode?: string;
    }, currentUser: User): Promise<any>;
    changePassword(id: string, body: {
        password: string;
    }): Promise<{
        message: string;
    }>;
    getCustomers(search?: string, page?: number, limit?: number, user?: User): Promise<{
        data: User[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    getStaff(search?: string, page?: number, limit?: number, user?: User): Promise<{
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
    updatePreferences(user: User, body: {
        dietaryPreferences?: string[];
        cuisinePreferences?: string[];
    }): Promise<User>;
    getPreferences(user: User): Promise<{
        dietaryPreferences: string[];
        cuisinePreferences: string[];
    }>;
    updateDeviceToken(user: User, dto: UpdateDeviceTokenDto): Promise<{
        message: string;
    }>;
    getDefaultBranch(user: User): Promise<{
        branchId: string;
        branch: import("../branches/entities/branch.entity").Branch;
    }>;
    setDefaultBranch(user: User, body: {
        branchId: string;
    }): Promise<User>;
    setUserDefaultBranch(id: string, body: {
        branchId: string;
    }): Promise<User>;
    getRoles(): {
        roles: {
            value: UserRole;
            label: string;
            description: string;
        }[];
    };
    assignRole(id: string, body: {
        role: UserRole;
    }): Promise<User>;
    getCountryCodes(): {
        data: {
            name: string;
            code: string;
            dialCode: string;
        }[];
    };
    getAdministrators(search?: string, page?: number, limit?: number, user?: User): Promise<{
        data: User[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    getWaiters(search?: string, page?: number, limit?: number, user?: User): Promise<{
        data: User[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    getWaiterOrders(id: string, page?: number, limit?: number): Promise<{
        data: import("../orders/entities/order.entity").Order[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    getChefs(search?: string, page?: number, limit?: number, user?: User): Promise<{
        data: User[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    getChefOrders(id: string, page?: number, limit?: number): Promise<{
        data: import("../orders/entities/order.entity").Order[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    getPosOperators(search?: string, page?: number, limit?: number, user?: User): Promise<{
        data: User[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    getBranchManagers(search?: string, page?: number, limit?: number, user?: User): Promise<{
        data: User[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    exportStaffExcel(res: any): Promise<void>;
    getCustomerAddresses(id: string): Promise<import("../addresses/entities/address.entity").Address[]>;
    getStaffAddresses(id: string): Promise<import("../addresses/entities/address.entity").Address[]>;
    getCustomerOrders(id: string, page?: number, limit?: number): Promise<{
        data: import("../orders/entities/order.entity").Order[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    changeImage(id: string, body: {
        profileImage: string;
    }): Promise<User>;
}
