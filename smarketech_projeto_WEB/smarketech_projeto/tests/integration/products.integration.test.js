const request = require('supertest');
const app = require('../../app');

jest.mock('../../config/database', () => ({
  pool: { query: jest.fn(), connect: jest.fn(), end: jest.fn() }
}));
const { pool } = require('../../config/database');

describe('Products API - Integration Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    test('should return all products', async () => {
      const mockProducts = [
        { id: 1, nome: 'Product 1', quantidade: 10, preco: 20.5 },
        { id: 2, nome: 'Product 2', quantidade: 5, preco: 15.0 }
      ];

      pool.query.mockResolvedValue({ rows: mockProducts });

      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProducts);
    });
  });

  describe('GET /api/products/:id', () => {
    test('should return product by id', async () => {
      const mockProduct = { id: 1, nome: 'Product 1', quantidade: 10, preco: 20.5 };

      pool.query.mockResolvedValue({ rows: [mockProduct] });

      const response = await request(app).get('/api/products/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProduct);
    });

    test('should return 404 for non-existent product', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const response = await request(app).get('/api/products/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/products', () => {
    test('should create new product', async () => {
      const newProduct = { nome: 'Product 3', quantidade: 7, preco: 30.0 };
      const savedProduct = { id: 3, ...newProduct };

      pool.query.mockResolvedValue({ rows: [savedProduct] });

      const response = await request(app).post('/api/products').send(newProduct);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('product');
    });
  });
});
