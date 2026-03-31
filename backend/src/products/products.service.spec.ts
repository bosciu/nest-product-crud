import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UniqueConstraintError, ValidationError } from 'sequelize';

import { ProductsService } from './products.service';
import { Product } from './models/product.model';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductStockDto } from './dto/update-product-stock.dto';

describe('ProductsService', () => {
  let service: ProductsService;

  const baseDto: CreateProductDto = {
    productToken: 'prod-001',
    name: 'Mouse',
    price: 24.99,
    stock: 10,
  };

  const mockProductModel = {
    create: jest.fn(),
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createdProduct = {
        id: 1,
        ...baseDto,
      };

      mockProductModel.create.mockResolvedValue(createdProduct);

      const result = await service.create(baseDto);

      expect(mockProductModel.create).toHaveBeenCalledWith(baseDto);
      expect(result).toEqual(createdProduct);
    });

    it('should throw ConflictException on duplicate productToken', async () => {
      const error = new UniqueConstraintError({ errors: [] });

      mockProductModel.create.mockRejectedValue(error);

      const promise = service.create(baseDto);

      await expect(promise).rejects.toBeInstanceOf(ConflictException);
      await expect(promise).rejects.toMatchObject({
        message: 'Product with same productToken already exists',
      });

      expect(mockProductModel.create).toHaveBeenCalledWith(baseDto);
    });

    it('should throw BadRequestException on validation error', async () => {
      const error = new ValidationError('Validation error', [
        { message: 'Name is required' } as any,
      ]);

      mockProductModel.create.mockRejectedValue(error);

      try {
        await service.create(baseDto);
        throw new Error('Expected create to throw BadRequestException');
      } catch (err: any) {
        expect(err).toBeInstanceOf(BadRequestException);

        const response = err.getResponse();
        expect(response).toMatchObject({
          message: ['Name is required'],
        });
      }

      expect(mockProductModel.create).toHaveBeenCalledWith(baseDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const rows = [
        {
          id: 1,
          ...baseDto,
        },
      ];

      mockProductModel.findAndCountAll.mockResolvedValue({
        rows,
        count: 1,
      });

      const result = await service.findAll(1, 10);

      expect(mockProductModel.findAndCountAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
      });

      expect(result).toEqual({
        data: rows,
        meta: {
          total: 1,
          page: 1,
          lastPage: 1,
        },
      });
    });

    it('should calculate correct offset when page > 1', async () => {
      const rows = [
        {
          id: 1,
          ...baseDto,
        },
      ];

      mockProductModel.findAndCountAll.mockResolvedValue({
        rows,
        count: 20,
      });

      const result = await service.findAll(2, 10);

      expect(mockProductModel.findAndCountAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 10,
      });

      expect(result).toEqual({
        data: rows,
        meta: {
          total: 20,
          page: 2,
          lastPage: 2,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a product if found', async () => {
      const product = {
        id: 1,
        ...baseDto,
      };

      mockProductModel.findByPk.mockResolvedValue(product);

      const result = await service.findOne(1);

      expect(mockProductModel.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual(product);
    });

    it('should throw NotFoundException if product is not found', async () => {
      mockProductModel.findByPk.mockResolvedValue(null);

      const promise = service.findOne(999);

      await expect(promise).rejects.toThrow(NotFoundException);
      await expect(promise).rejects.toThrow('Product with id 999 not found');

      expect(mockProductModel.findByPk).toHaveBeenCalledWith(999);
    });
  });

  describe('updateStock', () => {
    it('should update stock', async () => {
      const dto: UpdateProductStockDto = {
        stock: 25,
      };

      const updatedProduct = {
        id: 1,
        ...baseDto,
        stock: 25,
      };

      const productInstance = {
        update: jest.fn().mockResolvedValue(updatedProduct),
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(productInstance as any);

      const result = await service.updateStock(1, dto);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(productInstance.update).toHaveBeenCalledWith({ stock: 25 });
      expect(result).toEqual(updatedProduct);
    });

    it('should throw NotFoundException when id is not found', async () => {
      const dto: UpdateProductStockDto = {
        stock: 25,
      };

      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(
          new NotFoundException('Product with id 999 not found'),
        );

      const promise = service.updateStock(999, dto);

      await expect(promise).rejects.toThrow(NotFoundException);
      await expect(promise).rejects.toThrow('Product with id 999 not found');

      expect(service.findOne).toHaveBeenCalledWith(999);
    });

    it('should throw BadRequestException when update fails with validation error', async () => {
      const dto: UpdateProductStockDto = {
        stock: 25,
      };

      const productInstance = {
        update: jest
          .fn()
          .mockRejectedValue(
            new ValidationError('Validation error', [
              { message: 'Stock must be greater than 0' } as any,
            ]),
          ),
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(productInstance as any);

      try {
        await service.updateStock(1, dto);
        throw new Error('Expected updateStock to throw BadRequestException');
      } catch (err: any) {
        expect(err).toBeInstanceOf(BadRequestException);

        const response = err.getResponse();
        expect(response).toMatchObject({
          message: ['Stock must be greater than 0'],
        });
      }

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(productInstance.update).toHaveBeenCalledWith({ stock: 25 });
    });
  });

  describe('delete', () => {
    it('should destroy the product', async () => {
      const productInstance = {
        destroy: jest.fn().mockResolvedValue(undefined),
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(productInstance as any);

      await service.delete(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(productInstance.destroy).toHaveBeenCalled();
    });

    it('should throw NotFoundException when deleting a non existing product', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(
          new NotFoundException('Product with id 999 not found'),
        );

      const promise = service.delete(999);

      await expect(promise).rejects.toThrow(NotFoundException);
      await expect(promise).rejects.toThrow('Product with id 999 not found');

      expect(service.findOne).toHaveBeenCalledWith(999);
    });
  });
});
