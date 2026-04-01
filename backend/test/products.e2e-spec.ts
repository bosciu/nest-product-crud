import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { Product } from '../src/products/models/product.model';
import { Server } from 'http';
import { App } from 'supertest/types';

type ErrorBody = {
  statusCode: number;
  message: string | string[];
};

type ProductResponse = {
  id: number;
  productToken: string;
  name: string;
  price: number;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
};

describe('Products e2e', () => {
  let app: INestApplication<App>;
  let productModel: typeof Product;
  let httpServer: Server;

  const baseDto = {
    productToken: 'prod-001',
    name: 'Mouse',
    price: 24.99,
    stock: 10,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    httpServer = app.getHttpServer() as Server;
    productModel = moduleFixture.get<typeof Product>(getModelToken(Product));
  });

  beforeEach(async () => {
    await productModel.destroy({
      where: {},
      truncate: true,
      force: true,
    });
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /products', () => {
    it('should create a product', async () => {
      const response = await request(httpServer)
        .post('/products')
        .send(baseDto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(Number) as number,
        ...baseDto,
      });
    });

    it('should return 409 on duplicate productToken', async () => {
      await request(httpServer).post('/products').send(baseDto).expect(201);

      const response = await request(httpServer)
        .post('/products')
        .send(baseDto)
        .expect(409);

      expect(response.body).toMatchObject({
        statusCode: 409,
        message: 'Product with same productToken already exists',
      });
    });

    it('should return 400 on invalid payload', async () => {
      const invalidDto = {
        productToken: 'prod-002',
        name: '',
        price: 24.99,
        stock: 10,
      };

      const response = await request(httpServer)
        .post('/products')
        .send(invalidDto)
        .expect(400);

      const responseBody = response.body as ErrorBody;

      expect(responseBody.statusCode).toBe(400);
      expect(responseBody.message).toEqual([
        'name must be longer than or equal to 1 characters',
      ]);
    });
  });

  describe('GET /products', () => {
    it('should return paginated products', async () => {
      await request(httpServer).post('/products').send(baseDto).expect(201);

      const response = await request(httpServer)
        .get('/products?page=1&limit=10')
        .expect(200);

      expect(response.body).toMatchObject({
        data: [
          {
            id: expect.any(Number) as number,
            ...baseDto,
            createdAt: expect.any(String) as string,
            updatedAt: expect.any(String) as string,
          },
        ],
        meta: {
          total: 1,
          page: 1,
          lastPage: 1,
        },
      });
    });

    it('should return empty paginated list when no products exist', async () => {
      const response = await request(httpServer)
        .get('/products?page=1&limit=10')
        .expect(200);

      expect(response.body).toMatchObject({
        data: [],
        meta: {
          total: 0,
          page: 1,
          lastPage: 0,
        },
      });
    });

    it('should return 400 when limit exceeds max allowed', async () => {
      const response = await request(httpServer)
        .get('/products?page=1&limit=101')
        .expect(400);

      const responseBody = response.body as ErrorBody;
      expect(responseBody.statusCode).toBe(400);
      expect(Array.isArray(responseBody.message)).toBe(true);
      expect(responseBody.message).toContain(
        'limit must not be greater than 100',
      );
    });
  });

  describe('GET /products/:id', () => {
    it('should return a product if found', async () => {
      const createResponse = await request(httpServer)
        .post('/products')
        .send(baseDto)
        .expect(201);

      const createdBody = createResponse.body as ProductResponse;
      const createdId = createdBody.id;

      const response = await request(httpServer)
        .get(`/products/${createdId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: createdId,
        ...baseDto,
      });
    });

    it('should return 404 if product is not found', async () => {
      const response = await request(httpServer)
        .get('/products/999')
        .expect(404);

      expect(response.body).toMatchObject({
        statusCode: 404,
        message: 'Product with id 999 not found',
      });
    });
  });

  describe('PATCH /products/update-stock/:id', () => {
    it('should update stock', async () => {
      const createResponse = await request(httpServer)
        .post('/products')
        .send(baseDto)
        .expect(201);

      const createdBody = createResponse.body as ProductResponse;
      const createdId = createdBody.id;

      const response = await request(httpServer)
        .patch(`/products/update-stock/${createdId}`)
        .send({ stock: 25 })
        .expect(200);

      expect(response.body).toMatchObject({
        id: createdId,
        ...baseDto,
        stock: 25,
      });
    });

    it('should return 404 if product does not exist', async () => {
      const response = await request(httpServer)
        .patch('/products/update-stock/999')
        .send({ stock: 25 })
        .expect(404);

      expect(response.body).toMatchObject({
        statusCode: 404,
        message: 'Product with id 999 not found',
      });
    });

    it('should return 400 on invalid stock payload', async () => {
      const createResponse = await request(httpServer)
        .post('/products')
        .send(baseDto)
        .expect(201);

      const createdBody = createResponse.body as ProductResponse;
      const createdId = createdBody.id;

      const response = await request(httpServer)
        .patch(`/products/update-stock/${createdId}`)
        .send({ stock: 'abc' })
        .expect(400);

      const responseBody = response.body as ErrorBody;

      expect(responseBody.statusCode).toBe(400);
      expect(responseBody.message).toBeDefined();
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete a product', async () => {
      const createResponse = await request(httpServer)
        .post('/products')
        .send(baseDto)
        .expect(201);

      const createdBody = createResponse.body as ProductResponse;
      const createdId = createdBody.id;

      await request(httpServer).delete(`/products/${createdId}`).expect(200);

      await request(httpServer).get(`/products/${createdId}`).expect(404);
    });

    it('should return 404 if product to delete does not exist', async () => {
      const response = await request(httpServer)
        .delete('/products/999')
        .expect(404);

      expect(response.body).toMatchObject({
        statusCode: 404,
        message: 'Product with id 999 not found',
      });
    });
  });
});
