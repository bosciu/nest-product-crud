import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'prod-001' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  productToken!: string;

  @ApiProperty({ example: 'Mouse' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: 24.99 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price!: number;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsInt()
  stock!: number;
}
