const authService = require("../service/authService");

/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Endpoints relacionados à autenticação de administradores
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registra um novo usuário administrador
 *     description: Cria um novo registro de administrador no sistema
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *               - dtnasc
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "João da Silva"
 *               email:
 *                 type: string
 *                 example: "joao@email.com"
 *               senha:
 *                 type: string
 *                 example: "123456"
 *               dtnasc:
 *                 type: string
 *                 format: date
 *                 example: "2000-05-20"
 *     responses:
 *       200:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário registrado com sucesso"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     nome:
 *                       type: string
 *                       example: "João da Silva"
 *                     email:
 *                       type: string
 *                       example: "joao@email.com"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR..."
 *       400:
 *         description: Usuário já existe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Usuário já existe"
 *       500:
 *         description: Erro interno do servidor
 */
async function register(req, res) {
  try {
    const result = await authService.registerUser(req.body);
    return res.json({
      message: "Usuário registrado com sucesso",
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Realiza login de um administrador
 *     description: Autentica o administrador e retorna um token JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 example: "joao@email.com"
 *               senha:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login realizado com sucesso"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     nome:
 *                       type: string
 *                       example: "João da Silva"
 *                     email:
 *                       type: string
 *                       example: "joao@email.com"
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Usuário não encontrado"
 *       500:
 *         description: Erro interno do servidor
 */
async function login(req, res) {
  try {
    const result = await authService.loginUser(req.body);
    return res.json({
      message: "Login realizado com sucesso",
      token: result.token,
      user: result.user,
    });
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
}

/**
 * @swagger
 * /api/auth/forgot:
 *   post:
 *     summary: Solicita recuperação de senha
 *     description: Envia um link de recuperação para o email do usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: "joao@email.com"
 *     responses:
 *       200:
 *         description: Link de recuperação enviado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Instruções enviadas para seu email"
 *                 resetLink:
 *                   type: string
 *                   example: "http://localhost:3000/reset.html?token=abc123"
 *       400:
 *         description: Email é obrigatório
 *       500:
 *         description: Erro interno do servidor
 */
async function forgot(req, res) {
  try {
    const { email } = req.body || {};
    console.log("📧 Forgot password request for:", email);

    if (!email) {
      return res.status(400).json({ error: "E-mail é obrigatório" });
    }

    const result = await authService.requestPasswordReset(email);

    console.log("✅ Forgot password result:", result);

    return res.json({
      message: "Instruções de recuperação enviadas para seu e-mail",
      resetLink: result.resetLink,
    });
  } catch (err) {
    console.error("❌ Error in forgot password:", err);
    return res
      .status(500)
      .json({ error: "Erro ao solicitar recuperação de senha" });
  }
}

/**
 * @swagger
 * /api/auth/reset:
 *   post:
 *     summary: Redefine a senha usando o token
 *     description: Altera a senha do usuário usando o token de recuperação
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - senha
 *             properties:
 *               token:
 *                 type: string
 *                 example: "abc123"
 *               senha:
 *                 type: string
 *                 example: "novaSenha123"
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Senha redefinida com sucesso"
 *       400:
 *         description: Token inválido ou dados faltando
 *       500:
 *         description: Erro interno do servidor
 */
async function reset(req, res) {
  try {
    const { token, senha } = req.body || {};

    if (!token || !senha) {
      return res
        .status(400)
        .json({ error: "Token e nova senha são obrigatórios" });
    }

    await authService.resetPassword(token, senha);

    return res.json({ message: "Senha redefinida com sucesso" });
  } catch (err) {
    return res
      .status(400)
      .json({ error: err.message || "Erro ao redefinir senha" });
  }
}

/**
 * @swagger
 * /api/auth/validate:
 *   get:
 *     summary: Valida o token de autenticação
 *     description: Verifica se o token JWT enviado é válido
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token válido"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: "joao@email.com"
 */
function validate(req, res) {
  return res.json({ message: "Token válido", user: req.user });
}

async function deleteAccount(req, res) {
  try {
    const { senha } = req.body || {};
    if (!senha) return res.status(400).json({ error: "Senha é obrigatória" });
    await authService.deleteOwnAccount(req.user.id, senha);
    return res.json({ message: "Conta excluída com sucesso" });
  } catch (err) {
    return res
      .status(400)
      .json({ error: err.message || "Erro ao excluir conta" });
  }
}

module.exports = {
  register,
  login,
  forgot,
  reset,
  validate,
  deleteAccount,
};
