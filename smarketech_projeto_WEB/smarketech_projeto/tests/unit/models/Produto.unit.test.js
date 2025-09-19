jest.mock('../../../config/database', () => ({
  pool: { query: jest.fn(), connect: jest.fn(), end: jest.fn() }
}));
const { pool } = require('../../../config/database');
const Product = require('../../../models/Produto');

describe('Product Model - Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    test('should return all active products', async () => {
      const mockProducts = [
        { id: 1, nome: 'Produto 1', quantidade: 10, preco: 20.5 },
        { id: 2, nome: 'Produto 2', quantidade: 5, preco: 15.0 }
      ];

      pool.query.mockResolvedValue({ rows: mockProducts });

      const result = await Product.getAll();
      expect(result).toEqual(mockProducts);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM produtos WHERE ativo = true');
    });

    test('should throw error on database failure', async () => {
      pool.query.mockRejectedValue(new Error('DB error'));
      await expect(Product.getAll()).rejects.toThrow('Erro ao buscar produtos: DB error');
    });
  });

  describe('getById', () => {
    test('should return product by id', async () => {
      const mockProduct = { id: 1, nome: 'Produto 1', quantidade: 10, preco: 20.5 };
      pool.query.mockResolvedValue({ rows: [mockProduct] });

      const result = await Product.getById(1);
      expect(result).toEqual(mockProduct);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM produtos WHERE id = $1 AND ativo = true',
        [1]
      );
    });

    test('should return undefined for non-existent product', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await Product.getById(999);
      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    test('should create a new product with valid data', async () => {
      const newProduct = { nome: 'Produto 3', quantidade: 3, preco: 12.5 };
      const savedProduct = { id: 3, ...newProduct };

      pool.query.mockResolvedValue({ rows: [savedProduct] });

      const result = await Product.create(newProduct);
      expect(result).toEqual(savedProduct);
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO produtos (nome, quantidade, preco, ativo) VALUES ($1, $2, $3, true) RETURNING *',
        [newProduct.nome, newProduct.quantidade, newProduct.preco]
      );
    });

    test('should throw error for invalid prices', async () => {
      pool.query.mockRejectedValue(new Error('invalid price'));
      await expect(Product.create({ nome: 'X', quantidade: 1, preco: -5 }))
        .rejects.toThrow('Erro ao criar produto: invalid price');
    });
  });
});
