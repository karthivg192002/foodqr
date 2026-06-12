import { IsString, IsEnum, IsOptional, IsArray, IsNumber, IsBoolean, IsUUID, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderType, PaymentMethod } from '../../../common/enums';

export class OrderItemExtraDto {
  @ApiPropertyOptional()
  @IsOptional() @IsUUID()
  extraId?: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  price: number;
}

export class OrderItemDto {
  @ApiProperty()
  @IsUUID()
  itemId: string;

  @ApiPropertyOptional()
  @IsOptional() @IsUUID()
  variationId?: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  specialNote?: string;

  @ApiPropertyOptional({ type: [OrderItemExtraDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemExtraDto)
  extras?: OrderItemExtraDto[];
}

export class CreateOrderDto {
  @ApiProperty({ enum: OrderType })
  @IsEnum(OrderType)
  orderType: OrderType;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional() @IsUUID()
  diningTableId?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsObject()
  deliveryAddress?: object;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  orderNote?: string;

  @ApiPropertyOptional()
  @IsOptional()
  scheduledAt?: Date;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  isAdvanceOrder?: boolean;

  @ApiPropertyOptional()
  @IsOptional() @IsNumber()
  discount?: number;
}

export class UpdateOrderStatusDto {
  @ApiProperty()
  @IsString()
  status: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  cancellationReason?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  staffId?: string;
}
