const path = require("path");

function health(req, res) {
  return res.json({ status: "OK", message: "Server is running" });
}

function serveLogin(req, res) {
  return res.sendFile(path.join(__dirname, "..", "public", "login.html"));
}

function serveProdutos(req, res) {
  return res.sendFile(path.join(__dirname, "..", "public", "home.html"));
}

function serveRelatorios(req, res) {
  return res.sendFile(path.join(__dirname, "..", "public", "relatorios.html"));
}

module.exports = {
  health,
  serveLogin,
  serveProdutos,
  serveRelatorios,
};


