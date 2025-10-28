// middleware/auth.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

// ✅ Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token de acesso requerido" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "fallback-secret",
    (err, user) => {
      if (err) {
        return res.status(403).json({ error: "Token inválido ou expirado" });
      }
      req.user = user;
      next();
    }
  );
};

// ✅ Função para gerar token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || "fallback-secret", {
    expiresIn: "1h",
  });
};

module.exports = {
  authenticateToken,
  generateToken,
};
