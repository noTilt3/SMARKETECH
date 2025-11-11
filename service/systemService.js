const path = require("path");

function getLoginPagePath() {
  return path.join(__dirname, "..", "public", "login.html");
}

function getProdutosPagePath() {
  return path.join(__dirname, "..", "public", "home.html");
}

function getRelatoriosPagePath() {
  return path.join(__dirname, "..", "public", "relatorios.html");
}

function getPedidosPagePath() {
  return path.join(__dirname, "..", "public", "pedidos.html");
}

function getPerfilPagePath() {
  return path.join(__dirname, "..", "public", "perfil.html");
}

function getForgotPagePath() {
  return path.join(__dirname, "..", "public", "forgot.html");
}

function getResetPagePath() {
  return path.join(__dirname, "..", "public", "reset.html");
}

function getHealthStatus() {
  return { status: "OK", message: "Server is running" };
}

module.exports = {
  getLoginPagePath,
  getProdutosPagePath,
  getRelatoriosPagePath,
  getPedidosPagePath,
  getPerfilPagePath,
  getForgotPagePath,
  getResetPagePath,
  getHealthStatus,
};
