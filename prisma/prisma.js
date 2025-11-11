const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Loga conexão bem-sucedida com o banco via Prisma
(async () => {
  try {
    await prisma.$connect();
    console.log("✅ Conectado ao PostgreSQL via Prisma");
  } catch (err) {
    console.error("❌ Erro ao conectar com o banco (Prisma):", err.message);
  }
})();

module.exports = prisma;
