process.env.JWT_SECRET = 'fallback-secret';
const jwt = require('jsonwebtoken');
const request = require("supertest");
const app = require("../../server");

describe("Auth API - Integração", () => {
  test("deve registrar, logar e validar o token", async () => {
    const unique = Date.now();
    const user = {
      nome: `User ${unique}`,
      email: `user${unique}@test.com`,
      senha: "password123",
      dtnasc: "1990-01-01",
    };

    // Register
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send(user);
    expect(registerRes.status).toBe(200);
    expect(registerRes.body).toHaveProperty("token");

    // Login
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, senha: user.senha });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty("token");

    const token = loginRes.body.token;

    // Validate
    const validateRes = await request(app)
      .get("/api/auth/validate")
      .set("Authorization", `Bearer ${token}`);
    expect(validateRes.status).toBe(200);
    expect(validateRes.body).toHaveProperty("user");
  });
});
