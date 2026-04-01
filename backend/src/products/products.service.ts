import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UniqueConstraintError, ValidationError } from 'sequelize';
import { Product } from './models/product.model';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductStockDto } from './dto/update-product-stock.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product)
    private productModel: typeof Product,
  ) {}

  private handleSequelizeError(error: any): never {
    if (error instanceof UniqueConstraintError) {
      throw new ConflictException(
        'Product with same productToken already exists',
      );
    }

    if (error instanceof ValidationError) {
      throw new BadRequestException(
        error.errors?.map((e: { message: string }) => e.message) ?? [
          'Validation error',
        ],
      );
    }

    throw error;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    try {
      return await this.productModel.create({ ...dto });
    } catch (error) {
      this.handleSequelizeError(error);
    }
  }

  async findAll(page: number, limit: number) {
    const offset = (page - 1) * limit;

    const { rows, count } = await this.productModel.findAndCountAll({
      limit,
      offset,
    });

    return {
      data: rows,
      meta: {
        total: count,
        page,
        lastPage: Math.ceil(count / limit),
      },
    };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productModel.findByPk(id);

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  async updateStock(id: number, dto: UpdateProductStockDto): Promise<Product> {
    try {
      const product = await this.findOne(id);
      return await product.update({ stock: dto.stock });
    } catch (error) {
      this.handleSequelizeError(error);
    }
  }

  async delete(id: number): Promise<void> {
    const product = await this.findOne(id);
    await product.destroy();
  }
}
