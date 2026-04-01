/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductStockDto } from './dto/update-product-stock.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Product } from './models/product.model';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: jest.Mocked<ProductsService>;
  type PaginatedProductsResult = Awaited<
    ReturnType<ProductsService['findAll']>
  >;

  const baseDto: CreateProductDto = {
    productToken: 'prod-001',
    name: 'Mouse',
    price: 24.99,
    stock: 10,
  };

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateStock: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get(ProductsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with dto', async () => {
      const expectedResult = {
        id: 1,
        ...baseDto,
      };

      service.create.mockResolvedValue(expectedResult as Product);

      const result = await controller.create(baseDto);

      expect(service.create).toHaveBeenCalledWith(baseDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with page and limit', async () => {
      const query: PaginationDto = {
        page: 1,
        limit: 10,
      };

      const expectedResult: PaginatedProductsResult = {
        data: [],
        meta: {
          total: 0,
          page: 1,
          lastPage: 0,
        },
      };

      service.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with id', async () => {
      const expectedResult = {
        id: 1,
        ...baseDto,
      };

      service.findOne.mockResolvedValue(expectedResult as Product);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateStock', () => {
    it('should call service.updateStock with id and dto', async () => {
      const dto: UpdateProductStockDto = {
        stock: 25,
      };

      const expectedResult = {
        id: 1,
        ...baseDto,
        stock: 25,
      };

      service.updateStock.mockResolvedValue(expectedResult as Product);

      const result = await controller.updateStock(1, dto);

      expect(service.updateStock).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should call service.delete with id', async () => {
      service.delete.mockResolvedValue(undefined);

      const result = await controller.remove(1);

      expect(service.delete).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });
  });
});
