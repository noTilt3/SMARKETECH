const prisma = require("../prisma/prisma");

async function getPerfilById(userId) {
  const user = await prisma.adms.findUnique({ where: { id: Number(userId) } });
  if (!user) return null;
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    dtnasc: user.dtnasc,
    fotoBase64: user.foto ? Buffer.from(user.foto).toString("base64") : null,
  };
}

async function updatePerfil(userId, { nome, dtnasc, fotoBase64 }) {
  const data = {};
  if (typeof nome === "string" && nome.trim()) data.nome = nome.trim();
  if (dtnasc) data.dtnasc = new Date(dtnasc);
  if (typeof fotoBase64 === "string") {
    if (fotoBase64 === "") {
      data.foto = null; // permitir remover foto
    } else {
      // fotoBase64 pode vir como data URL, extrair a parte base64
      const base64 = fotoBase64.includes(",")
        ? fotoBase64.split(",")[1]
        : fotoBase64;
      data.foto = Buffer.from(base64, "base64");
    }
  }

  const updated = await prisma.adms.update({
    where: { id: Number(userId) },
    data,
  });
  return {
    id: updated.id,
    nome: updated.nome,
    email: updated.email,
    dtnasc: updated.dtnasc,
    fotoBase64: updated.foto
      ? Buffer.from(updated.foto).toString("base64")
      : null,
  };
}

module.exports = {
  getPerfilById,
  updatePerfil,
};
