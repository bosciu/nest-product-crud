import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'prod-001' })
  productToken: string;

  @ApiProperty({ example: 'Mouse' })
  name: string;

  @ApiProperty({ example: 24.99 })
  price: number;

  @ApiProperty({ example: 10 })
  stock: number;

  @ApiProperty({ example: '2026-03-31T19:20:10.178Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-03-31T19:20:10.178Z' })
  updatedAt: string;
}
