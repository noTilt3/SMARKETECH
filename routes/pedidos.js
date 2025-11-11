const express = require("express");
const router = express.Router();
const pedidoController = require("../controllers/controllerPedidos");
const { authenticateToken } = require("../middleware/auth");

// Rotas públicas (sem autenticação)
router.post("/", pedidoController.criarPedido); // App Android cria pedido
router.get("/historico", pedidoController.listarPedidosHistorico); // Histórico público para a página

// Rotas protegidas (com autenticação)
router.get("/", authenticateToken, pedidoController.listarPedidos);
router.put(
  "/:id/status",
  authenticateToken,
  pedidoController.atualizarStatusPedido
);
router.get("/:id", authenticateToken, pedidoController.buscarPedidoPorId);

module.exports = router;
