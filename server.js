const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

const { authenticateToken } = require("./middleware/auth");

const PORT = process.env.PORT || 3000;

// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Smarketech API",
      version: "1.0.0",
      description:
        "Sistema de gerenciamento de produtos e autenticação de administradores",
      contact: {
        name: "Suporte Smarketech",
        email: "suporte@smarketech.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Servidor de desenvolvimento",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js", "./controllers/*.js"], // caminhos para os arquivos com anotações
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware de segurança - helmet
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "script-src": [
        "'self'",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com",
      ],
      "connect-src": ["'self'", "https://cdn.jsdelivr.net"],
    },
  })
);

// CORS
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Middleware
app.use(express.json({ limit: "25mb" }));
app.use(express.static("public"));

// Rotas da API
const productRoutes = require("./routes/produtos");
app.use("/api/produtos", productRoutes);

// Rotas do sistema (páginas e health)
const systemRoutes = require("./routes/system");
app.use("/", systemRoutes);

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const pedidosRoutes = require("./routes/pedidos");
app.use("/api/pedidos", pedidosRoutes);

const perfilRoutes = require("./routes/perfil");
app.use("/api/perfil", perfilRoutes);

const chatRoutes = require("./routes/chat");
app.use("/api/chat", chatRoutes);

// Rota da documentação Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Algo deu errado!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Acesse: http://localhost:${PORT}`);
    console.log(`📚 Documentação Swagger: http://localhost:${PORT}/api-docs`);
  });
}
