const perfilService = require("../service/perfilService");

async function getMeuPerfil(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Não autenticado" });
    const perfil = await perfilService.getPerfilById(userId);
    if (!perfil)
      return res.status(404).json({ error: "Usuário não encontrado" });
    return res.json(perfil);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao obter perfil" });
  }
}

async function atualizarMeuPerfil(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Não autenticado" });

    const { nome, dtnasc, fotoBase64 } = req.body || {};
    const atualizado = await perfilService.updatePerfil(userId, {
      nome,
      dtnasc,
      fotoBase64,
    });
    return res.json(atualizado);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao atualizar perfil" });
  }
}

module.exports = {
  getMeuPerfil,
  atualizarMeuPerfil,
};
