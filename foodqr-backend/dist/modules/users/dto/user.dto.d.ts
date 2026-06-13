import { UserStatus } from '../../../common/enums';
export declare class UpdateUserDto {
    name?: string;
    email?: string;
    phone?: string;
    countryCode?: string;
    profileImage?: string;
    status?: UserStatus;
    branchId?: string;
}
export declare class UpdateDeviceTokenDto {
    deviceToken?: string;
    webToken?: string;
}
