const prisma = require("../prisma/prisma");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { generateToken } = require("../middleware/auth");
const emailService = require("../service/emailService");

/**
 * Registra um novo usuário administrador
 */
async function registerUser({ nome, email, senha, dtnasc }) {
  const existingUser = await prisma.adms.findUnique({ where: { email } });
  if (existingUser) throw new Error("Usuário já existe");

  const hashedPassword = await bcrypt.hash(senha, 10);

  const newUser = await prisma.adms.create({
    data: {
      nome,
      email,
      senha: hashedPassword,
      dtnasc: new Date(dtnasc),
      dtcad: new Date(),
    },
    select: { id: true, nome: true, email: true },
  });

  // Envia email de boas-vindas
  try {
    await emailService.sendWelcomeEmail(email, nome);
  } catch (emailError) {
    console.error(
      "❌ Erro ao enviar email de boas-vindas:",
      emailError.message
    );
    // Não impede o registro se o email falhar
  }

  const token = generateToken({ id: newUser.id, email: newUser.email });

  return { user: newUser, token };
}

/**
 * Realiza o login do administrador
 */
async function loginUser({ email, senha }) {
  const user = await prisma.adms.findUnique({ where: { email } });
  if (!user) throw new Error("Usuário não encontrado");

  const validPassword = await bcrypt.compare(senha, user.senha);
  if (!validPassword) throw new Error("Senha incorreta");

  const token = generateToken({ id: user.id, email: user.email });

  return {
    token,
    user: { id: user.id, nome: user.nome, email: user.email },
  };
}

/**
 * Solicita reset de senha
 */
async function requestPasswordReset(email) {
  console.log("🔍 Buscando usuário com email:", email);

  const user = await prisma.adms.findUnique({ where: { email } });

  if (!user) {
    console.log("❌ Usuário não encontrado para email:", email);
    // Por segurança, sempre retorna sucesso mesmo se usuário não existir
    return { ok: true, resetLink: "" };
  }

  console.log("✅ Usuário encontrado:", user.id);

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 60min

  await prisma.adms.update({
    where: { id: user.id },
    data: {
      reset_token: token,
      reset_expires: expires,
    },
  });

  const baseUrl =
    process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  const resetLink = `${baseUrl}/reset.html?token=${token}`;

  console.log("🔗 Link gerado:", resetLink);

  // Tenta enviar email
  try {
    console.log("📤 Tentando enviar email para:", email);
    await emailService.sendResetEmail(email, resetLink);
    console.log("✅ Email enviado com sucesso!");
  } catch (emailError) {
    console.error("❌ Erro ao enviar email:", emailError.message);
    // Continua mesmo se o email falhar - o link ainda é retornado
  }

  return { ok: true, resetLink };
}

/**
 * Reseta a senha com um token válido
 */
async function resetPassword(token, novaSenha) {
  if (!token || !novaSenha) throw new Error("Dados inválidos");

  const user = await prisma.adms.findFirst({
    where: {
      reset_token: token,
      reset_expires: { gt: new Date() },
    },
  });

  if (!user) throw new Error("Token inválido ou expirado");

  const hashed = await bcrypt.hash(novaSenha, 10);

  await prisma.adms.update({
    where: { id: user.id },
    data: {
      senha: hashed,
      reset_token: null,
      reset_expires: null,
    },
  });

  return { ok: true };
}

/**
 * Exclui a própria conta após confirmar a senha.
 * @param {number} userId
 * @param {string} senha
 */
async function deleteOwnAccount(userId, senha) {
  const user = await prisma.adms.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Usuário não encontrado");

  const ok = await bcrypt.compare(senha, user.senha);
  if (!ok) throw new Error("Senha incorreta");

  await prisma.adms.delete({ where: { id: userId } });
  return { ok: true };
}

module.exports = {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
  deleteOwnAccount,
};
