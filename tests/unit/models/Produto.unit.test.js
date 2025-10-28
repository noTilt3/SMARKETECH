jest.mock("../../../config/database", () => ({
  query: jest.fn(),
  connect: jest.fn(),
  end: jest.fn(),
}));

const pool = require("../../../config/database");
const Product = require("../../../models/Produto");

describe("Product Model - Unit Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    test("should return all active products", async () => {
      const mockProducts = [
        { id: 1, nome: "Produto 1", quantidade: 10, preco: 20.5 },
        { id: 2, nome: "Produto 2", quantidade: 5, preco: 15.0 },
      ];

      pool.query.mockResolvedValue({ rows: mockProducts });

      const result = await Product.getAll();
      expect(result).toEqual(mockProducts);
      expect(pool.query).toHaveBeenCalledWith(`
        SELECT id, nome, qtd as quantidade, precovenda as preco, precocompra, dtval as data_validade
        FROM produtos 
        WHERE ativo = true
        ORDER BY nome
      `);
    });

    test("should throw error on database failure", async () => {
      pool.query.mockRejectedValue(new Error("DB error"));
      await expect(Product.getAll()).rejects.toThrow(
        "Erro ao buscar produtos: DB error"
      );
    });
  });

  describe("getById", () => {
    test("should return product by id", async () => {
      const mockProduct = {
        id: 1,
        nome: "Produto 1",
        quantidade: 10,
        preco: 20.5,
      };
      pool.query.mockResolvedValue({ rows: [mockProduct] });

      const result = await Product.getById(1);
      expect(result).toEqual(mockProduct);
      expect(pool.query).toHaveBeenCalledWith(
        `SELECT id, nome, qtd as quantidade, precovenda as preco, precocompra, dtval as data_validade
         FROM produtos 
         WHERE id = $1 AND ativo = true`,
        [1]
      );
    });

    test("should return undefined for non-existent product", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await Product.getById(999);
      expect(result).toBeUndefined();
    });
  });

  describe("create", () => {
    test("should create a new product with valid data", async () => {
      const newProduct = {
        nome: "Produto 3",
        precovenda: 12.5,
        precocompra: 10.0,
        qtd: 3,
        dtval: "2025-12-31",
      };
      const savedProduct = {
        id: 3,
        nome: "Produto 3",
        quantidade: 3,
        preco: 12.5,
        precocompra: 10.0,
        data_validade: "2025-12-31",
      };

      pool.query.mockResolvedValue({ rows: [savedProduct] });

      const result = await Product.create(newProduct);
      expect(result).toEqual(savedProduct);
      expect(pool.query).toHaveBeenCalledWith(
        `INSERT INTO produtos (nome, precovenda, precocompra, qtd, dtval, ativo)
         VALUES ($1, $2, $3, $4, $5, true)
         RETURNING id, nome, qtd as quantidade, precovenda as preco, precocompra, dtval as data_validade`,
        [newProduct.nome, 12.5, 10.0, newProduct.qtd, newProduct.dtval]
      );
    });

    test("should throw error for invalid prices", async () => {
      await expect(
        Product.create({ nome: "X", precovenda: -5, precocompra: 10, qtd: 1 })
      ).rejects.toThrow(
        "Erro ao criar produto: Preços devem ser maiores que zero para o produto X"
      );
    });
  });
});
