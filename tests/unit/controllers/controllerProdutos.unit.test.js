jest.mock("../../../service/produtoService", () => ({
  listarProdutos: jest.fn(),
  buscarProdutoPorId: jest.fn(),
  buscarProdutosPorNome: jest.fn(),
  criarProduto: jest.fn(),
  atualizarProduto: jest.fn(),
  deletarProduto: jest.fn(),
}));

// 2. IMPORTS
const ProductService = require("../../../service/produtoService");
const {
  getAllProducts,
  getProductById,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../../../controllers/controllerProdutos");

describe("Product Controller - Unit Tests", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      params: {},
      query: {},
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("getAllProducts", () => {
    test("should return all products successfully", async () => {
      const mockProducts = [
        { id: 1, nome: "Product 1", precovenda: 29.99 },
        { id: 2, nome: "Product 2", precovenda: 39.99 },
      ];

      ProductService.listarProdutos.mockResolvedValue(mockProducts);

      await getAllProducts(mockReq, mockRes);

      expect(ProductService.listarProdutos).toHaveBeenCalledTimes(1);
      expect(mockRes.json).toHaveBeenCalledWith(mockProducts);
    });

    test("should handle errors", async () => {
      const error = new Error("Database error");
      ProductService.listarProdutos.mockRejectedValue(error);

      await getAllProducts(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("getProductById", () => {
    test("should return product when found", async () => {
      const mockProduct = { id: 1, nome: "Product 1" };
      mockReq.params.id = "1";
      ProductService.buscarProdutoPorId.mockResolvedValue(mockProduct);

      await getProductById(mockReq, mockRes);

      expect(ProductService.buscarProdutoPorId).toHaveBeenCalledWith("1");
      expect(mockRes.json).toHaveBeenCalledWith(mockProduct);
    });

    test("should return 404 when product not found", async () => {
      mockReq.params.id = "999";
      ProductService.buscarProdutoPorId.mockResolvedValue(null);

      await getProductById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Produto não encontrado!",
      });
    });

    test("should handle errors", async () => {
      mockReq.params.id = "1";
      const error = new Error("Database error");
      ProductService.buscarProdutoPorId.mockRejectedValue(error);

      await getProductById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("searchProducts", () => {
    test("should return search results", async () => {
      const mockProducts = [{ id: 1, nome: "Test Product" }];
      mockReq.query.q = "test";
      ProductService.buscarProdutosPorNome.mockResolvedValue(mockProducts);

      await searchProducts(mockReq, mockRes);

      expect(ProductService.buscarProdutosPorNome).toHaveBeenCalledWith("test");
      expect(mockRes.json).toHaveBeenCalledWith(mockProducts);
    });

    test("should return 400 when no search term", async () => {
      mockReq.query.q = "";

      await searchProducts(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Termo de busca necessário!",
      });
    });
  });

  describe("createProduct", () => {
    test("should create product successfully", async () => {
      const productData = {
        nome: "New Product",
        precovenda: 25.0,
        precocompra: 15.0,
        qtd: 10,
        dtval: "2025-12-31",
      };
      const mockProduct = { id: 3, ...productData };
      mockReq.body = productData;
      ProductService.criarProduto.mockResolvedValue(mockProduct);

      await createProduct(mockReq, mockRes);

      expect(ProductService.criarProduto).toHaveBeenCalledWith(productData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Produto criado com sucesso!",
        product: mockProduct,
      });
    });
  });

  describe("updateProduct", () => {
    test("should update product successfully", async () => {
      const productData = { nome: "Updated Product", precovenda: 30.0 };
      const mockProduct = { id: 1, ...productData };
      mockReq.params.id = "1";
      mockReq.body = productData;
      ProductService.atualizarProduto.mockResolvedValue(mockProduct);

      await updateProduct(mockReq, mockRes);

      expect(ProductService.atualizarProduto).toHaveBeenCalledWith(
        "1",
        productData
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Produto atualizado com sucesso!",
        product: mockProduct,
      });
    });

    test("should return 404 when product not found", async () => {
      mockReq.params.id = "999";
      mockReq.body = { nome: "Test" };
      ProductService.atualizarProduto.mockRejectedValue(
        new Error("Produto não encontrado!")
      );

      await updateProduct(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe("deleteProduct", () => {
    test("should delete product successfully", async () => {
      mockReq.params.id = "1";
      ProductService.deletarProduto.mockResolvedValue();

      await deleteProduct(mockReq, mockRes);

      expect(ProductService.deletarProduto).toHaveBeenCalledWith("1");
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Produto deletado com sucesso!",
      });
    });

    test("should return 404 when product not found", async () => {
      mockReq.params.id = "999";
      ProductService.deletarProduto.mockRejectedValue(
        new Error("Produto não encontrado!")
      );

      await deleteProduct(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });
});
