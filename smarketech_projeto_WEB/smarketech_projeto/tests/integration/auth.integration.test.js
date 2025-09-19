

const request = require('supertest');
const app = require('../../server');
const { pool } = require('../../config/database');
const bcrypt = require('bcrypt');

jest.mock('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('hashed-password')
}));

jest.mock('../../config/database', () => ({
  pool: { query: jest.fn(), connect: jest.fn(), end: jest.fn() }
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn().mockImplementation((senha, hash) => {
    if (senha === 'password123') return Promise.resolve(true);
    return Promise.resolve(false);
  }),
  hash: jest.fn().mockResolvedValue('hashed-password')
}));

describe('Auth API - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pool.query.mockResolvedValue({ rows: [] });
  });

  describe('POST /api/auth/login', () => {
    test('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 1,
        nome: 'Test User',
        email: 'test@email.com',
        senha: 'hashedpassword'
      };

      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, email: 'test@email.com', senha: 'hashed-password' }]
      });
      bcrypt.compare.mockResolvedValueOnce(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@email.com', senha: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    test('should return 401 for invalid credentials', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@email.com', senha: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
});
