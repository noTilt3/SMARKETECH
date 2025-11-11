const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const systemController = require("../controllers/controllerSystem");

router.get("/health", systemController.health);
router.get("/", systemController.serveLogin);
router.get("/produtos", systemController.serveProdutos);
router.get(
  "/relatorios.html",
  authenticateToken,
  systemController.serveRelatorios
);
router.get("/pedidos", systemController.servePedidos);
router.get("/pedidos.html", systemController.servePedidos);

router.get("/perfil", systemController.servePerfil);
router.get("/perfil.html", systemController.servePerfil);

// Páginas públicas de recuperação de senha
router.get("/forgot", systemController.serveForgot);
router.get("/reset", systemController.serveReset);

module.exports = router;
