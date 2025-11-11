const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const perfilController = require("../controllers/controllerPerfil");

/**
 * @swagger
 * tags:
 *   - name: Perfil
 *     description: Endpoints do perfil do usuário autenticado
 */

/**
 * @swagger
 * /api/perfil/me:
 *   get:
 *     summary: Obtém o perfil do usuário autenticado
 *     tags: [Perfil]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil retornado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/me", authenticateToken, perfilController.getMeuPerfil);

/**
 * @swagger
 * /api/perfil/me:
 *   put:
 *     summary: Atualiza o perfil do usuário autenticado
 *     tags: [Perfil]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileUpdate'
 *     responses:
 *       200:
 *         description: Perfil atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
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
router.put("/me", authenticateToken, perfilController.atualizarMeuPerfil);

module.exports = router;