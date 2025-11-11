const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const chatController = require("../controllers/controllerChat");

/**
 * @swagger
 * tags:
 *   - name: Chat
 *     description: Endpoints de chat, contatos e mensagens
 */

/**
 * @swagger
 * /api/chat/stream:
 *   get:
 *     summary: Abre stream de mensagens
 *     description: Fluxo SSE para mensagens em tempo real. Requer token JWT no parâmetro de query.
 *     tags: [Chat]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT do usuário (em vez do header Authorization)
 *     responses:
 *       200:
 *         description: Stream iniciado
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/stream", chatController.stream);

// Demais rotas de chat são protegidas por header Authorization
router.use(authenticateToken);

/**
 * @swagger
 * /api/chat/contatos:
 *   get:
 *     summary: Lista contatos do usuário
 *     tags: [Chat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Filtro por nome/email
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lista de contatos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contact'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Cria um contato
 *     tags: [Chat]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactCreate'
 *     responses:
 *       201:
 *         description: Contato criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/contatos", chatController.listContacts);
router.post("/contatos", chatController.addContact);

/**
 * @swagger
 * /api/chat/mensagens:
 *   get:
 *     summary: Lista mensagens
 *     tags: [Chat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: contatoId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do contato/conversa
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *         description: Cursor/ISO datetime para paginação regressiva
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Lista de mensagens
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       400:
 *         description: Parâmetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Envia uma mensagem
 *     tags: [Chat]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MessageCreate'
 *     responses:
 *       201:
 *         description: Mensagem criada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/mensagens", chatController.listMessages);
router.post("/mensagens", chatController.sendMessage);

/**
 * @swagger
 * /api/chat/latest:
 *   get:
 *     summary: Busca últimas mensagens por conversa
 *     description: Retorna a última mensagem de cada conversa/contato do usuário.
 *     tags: [Chat]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Últimas mensagens por contato
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/latest", chatController.latest);

module.exports = router;