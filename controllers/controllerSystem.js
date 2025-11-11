const systemService = require("../service/systemService");

function health(req, res) {
  return res.json(systemService.getHealthStatus());
}

function serveLogin(req, res) {
  return res.sendFile(systemService.getLoginPagePath());
}

function serveProdutos(req, res) {
  return res.sendFile(systemService.getProdutosPagePath());
}

function serveRelatorios(req, res) {
  return res.sendFile(systemService.getRelatoriosPagePath());
}

function servePedidos(req, res) {
  return res.sendFile(systemService.getPedidosPagePath());
}

function servePerfil(req, res) {
  return res.sendFile(systemService.getPerfilPagePath());
}

function serveForgot(req, res) {
  return res.sendFile(systemService.getForgotPagePath());
}

function serveReset(req, res) {
  return res.sendFile(systemService.getResetPagePath());
}

module.exports = {
  health,
  serveLogin,
  serveProdutos,
  serveRelatorios,
  servePedidos,
  servePerfil,
  serveForgot,
  serveReset,
};
