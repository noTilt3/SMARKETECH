const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const { authenticateToken } = require('./middleware/auth');

const PORT = process.env.PORT || 3000;

// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smarketech API',
      version: '1.0.0',
      description: 'Sistema de gerenciamento de produtos e autenticação de administradores',
      contact: {
        name: 'Suporte Smarketech',
        email: 'suporte@smarketech.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./routes/*.js', './controllers/*.js'] // caminhos para os arquivos com anotações
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware de segurança
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto (em vez de 15)
  max: 100, // 100 requests por minuto (em vez de 10000 por 15min)
  message: {
    error: 'Muitas requisições. Tente novamente em alguns instantes.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

// CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Rotas da API
const productRoutes = require('./routes/produtos');
app.use('/api/products', productRoutes);

// Rota de health check
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Verifica se o servidor está funcionando
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: Servidor está funcionando
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 message:
 *                   type: string
 *                   example: "Server is running"
 *       500:
 *         description: Servidor com problemas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Rota padrão (login)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

// Rota protegida para produtos
app.get('/produtos', authenticateToken, (req, res) => {
  res.sendFile(__dirname + '/public/index1.html');
});

// Rota alternativa para produtos
app.get('/index1.html', authenticateToken, (req, res) => {
  res.sendFile(__dirname + '/public/index1.html');
});

// Rota para relatórios
app.get('/relatorios.html', authenticateToken, (req, res) => {
  res.sendFile(__dirname + '/public/relatorios.html');
});

app.use('/api/auth', authRoutes);

// Rota da documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Acesse: http://localhost:${PORT}`);
    console.log(`📚 Documentação Swagger: http://localhost:${PORT}/api-docs`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
}

module.exports = app;
