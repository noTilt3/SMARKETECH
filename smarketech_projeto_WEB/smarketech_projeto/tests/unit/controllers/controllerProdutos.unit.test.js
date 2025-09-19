const productController = require('../../../controllers/controllerProdutos');
const Product = require('../../../models/Produto');

jest.mock('../../../models/Produto');

describe('Product Controller - Unit Tests', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      params: {},
      query: {},
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getAllProducts', () => {
    test('should return all products', async () => {
      const mockProducts = [{ id: 1, nome: 'Product 1' }];
      Product.getAll.mockResolvedValue(mockProducts);

      await productController.getAllProducts(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(mockProducts);
    });

    test('should handle errors', async () => {
      const error = new Error('Database error');
      Product.getAll.mockRejectedValue(error);

      await productController.getAllProducts(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('getProductById', () => {
    test('should return product when found', async () => {
      const mockProduct = { id: 1, nome: 'Product 1' };
      mockReq.params.id = '1';
      Product.getById.mockResolvedValue(mockProduct);

      await productController.getProductById(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(mockProduct);
    });

    test('should return 404 when product not found', async () => {
      mockReq.params.id = '999';
      Product.getById.mockResolvedValue(null);

      await productController.getProductById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Produto não encontrado!' });
    });
  });

  describe('createProduct', () => {
    test('should create product successfully', async () => {
      const productData = {
        nome: 'New Product',
        precovenda: 25.0,
        precocompra: 15.0,
        quantidade: 10,
        dtval: '2025-12-31'
      };

      const mockProduct = { id: 3, ...productData };
      mockReq.body = productData;
      Product.create.mockResolvedValue(mockProduct);

      await productController.createProduct(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Produto criado com sucesso!',
        product: mockProduct
      });
    });
  });
});