const {
  authenticateToken,
  generateToken,
} = require("../../../middleware/auth");
jest.mock("jsonwebtoken");
const jwt = require("jsonwebtoken");

describe("Auth Middleware - Unit Tests", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe("authenticateToken", () => {
    test("should return 401 if no token provided", () => {
      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Token de acesso requerido",
      });
    });

    test("should return 403 if token is invalid", () => {
      mockReq.headers.authorization = "Bearer invalid-token";
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new Error("Invalid token"), null);
      });

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Token inválido ou expirado",
      });
    });

    test("should call next if token is valid", () => {
      const user = { id: 1, email: "test@email.com" };
      mockReq.headers.authorization = "Bearer valid-token";
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, user);
      });

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockReq.user).toEqual(user);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('generateToken', () => {
    it('should generate token with correct payload', () => {
      const payload = { id: 1, email: 'test@email.com' };
      
      // ✅ Configura o mock para retornar um token previsível
      jwt.sign.mockReturnValue('mock-token-123');
      
      // Gera o token (usará o mock)
      const token = generateToken(payload);
  
      // ✅ Verifica se jwt.sign foi chamado corretamente
      expect(jwt.sign).toHaveBeenCalledWith(
        payload,
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "1h" }
      );
      
      // ✅ Verifica o token retornado
      expect(token).toBe('mock-token-123');
    });
  });
});
