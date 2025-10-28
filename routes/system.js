const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const systemController = require("../controllers/controllerSystem");

router.get("/health", systemController.health);
router.get("/", systemController.serveLogin);
router.get("/produtos", authenticateToken, systemController.serveProdutos);
router.get(
  "/relatorios.html",
  authenticateToken,
  systemController.serveRelatorios
);

module.exports = router;


