import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../../../common/enums';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  countryCode?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  profileImage?: string;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional() @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional()
  @IsOptional() @IsUUID()
  branchId?: string;
}

export class UpdateDeviceTokenDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString()
  deviceToken?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  webToken?: string;
}
