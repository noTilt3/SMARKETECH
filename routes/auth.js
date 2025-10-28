const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const authController = require("../controllers/controllerAuth");

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - senha
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "admin@mercado.com"
 *         senha:
 *           type: string
 *           format: password
 *           example: "senha123"
 *
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - nome
 *         - email
 *         - senha
 *         - dtnasc
 *       properties:
 *         nome:
 *           type: string
 *           example: "João Silva"
 *         email:
 *           type: string
 *           format: email
 *           example: "joao@mercado.com"
 *         senha:
 *           type: string
 *           format: password
 *           example: "senha123"
 *         dtnasc:
 *           type: string
 *           format: date
 *           example: "1990-01-15"
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Login realizado com sucesso"
 *         token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             nome:
 *               type: string
 *               example: "João Silva"
 *             email:
 *               type: string
 *               example: "joao@mercado.com"
 *
 *     ValidateResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Token válido"
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             email:
 *               type: string
 *               example: "joao@mercado.com"
 *
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Mensagem de erro"
 */

/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Endpoints para gerenciamento de autenticação de administradores
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Cadastra um novo administrador
 *     description: Cria uma nova conta de administrador no sistema
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       200:
 *         description: Administrador cadastrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Usuário já existe ou dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Realiza login do administrador
 *     description: Autentica um administrador e retorna um token JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /api/auth/validate:
 *   get:
 *     summary: Valida o token JWT
 *     description: Verifica se o token de autenticação é válido
 *     tags: [Autenticação]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidateResponse'
 *       401:
 *         description: Token inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/validate", authenticateToken, authController.validate);

module.exports = router;
