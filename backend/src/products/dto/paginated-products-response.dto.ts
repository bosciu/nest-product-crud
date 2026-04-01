import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from './product-response.dto';

class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 1 })
  lastPage: number;
}

export class PaginatedProductsResponseDto {
  @ApiProperty({ type: [ProductResponseDto] })
  data: ProductResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
