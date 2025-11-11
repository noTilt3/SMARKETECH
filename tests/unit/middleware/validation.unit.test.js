const {
  validateProductData,
  validateUserData,
} = require("../../../middleware/validation");

describe("Validation Middleware - Unit Tests", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe("validateProductData", () => {
    test("should pass validation for valid product data", () => {
      mockReq.body = {
        nome: "Valid Product",
        precovenda: 25.0,
        precocompra: 15.0,
        qtd: 10,
        dtval: "2025-12-31",
      };

      validateProductData(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test("should return 400 for missing required fields", () => {
      mockReq.body = {
        nome: "Invalid Product",
        // missing other required fields
      };

      validateProductData(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe("validateUserData", () => {
    test("should pass validation for valid user data", () => {
      mockReq.body = {
        email: "valid@email.com",
        senha: "password123",
      };

      validateUserData(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test("should return 400 for invalid email", () => {
      mockReq.body = {
        email: "invalid-email",
        senha: "password123",
      };

      validateUserData(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Email inválido!" });
    });
  });
});
