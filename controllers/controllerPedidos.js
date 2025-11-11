const PedidoService = require("../service/pedidoService");

/**
 * @swagger
 * components:
 *   schemas:
 *     Pedido:
 *       type: object
 *       required:
 *         - cliente
 *         - itens
 *         - total
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         cliente:
 *           type: string
 *           example: "Cliente Totem"
 *         itens:
 *           type: string
 *           example: '[{"nome":"Refrigerante","quantidade":2,"preco":5.99},{"nome":"Salgadinho","quantidade":1,"preco":7.50}]'
 *         total:
 *           type: number
 *           format: decimal
 *           example: 19.48
 *         status:
 *           type: string
 *           example: "pendente"
 *         data_pedido:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *
 *     PedidoCreate:
 *       type: object
 *       required:
 *         - cliente
 *         - itens
 *         - total
 *       properties:
 *         cliente:
 *           type: string
 *           example: "Cliente Totem"
 *         itens:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Refrigerante"
 *               quantidade:
 *                 type: integer
 *                 example: 2
 *               preco:
 *                 type: number
 *                 example: 5.99
 *         total:
 *           type: number
 *           example: 19.48
 *
 *     PedidoResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Pedido criado com sucesso"
 *         pedido:
 *           $ref: '#/components/schemas/Pedido'
 */

/**
 * @swagger
 * tags:
 *   name: Pedidos
 *   description: Endpoints para gerenciamento de pedidos do totem
 */

/**
 * @swagger
 * /api/pedidos/historico:
 *   get:
 *     summary: Lista todos os pedidos para histórico (pública)
 *     description: Retorna todos os pedidos formatados para exibição no histórico
 *     tags: [Pedidos]
 *     responses:
 *       200:
 *         description: Lista de pedidos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   cliente:
 *                     type: string
 *                   itens:
 *                     type: array
 *                   total:
 *                     type: number
 *                   status:
 *                     type: string
 *                   data_pedido:
 *                     type: string
 *                   itens_texto:
 *                     type: string
 *       500:
 *         description: Erro interno do servidor
 */
async function listarPedidosHistorico(req, res) {
  try {
    const pedidos = await PedidoService.listarPedidos();

    // ✅ FORMATAR para o histórico
    const pedidosFormatados = pedidos.map((pedido) => {
      let itensArray = [];
      try {
        itensArray = JSON.parse(pedido.itens);
      } catch (e) {
        itensArray = [];
      }

      return {
        id: pedido.id,
        cliente: pedido.cliente,
        itens: itensArray,
        total: parseFloat(pedido.total),
        status: pedido.status,
        data_pedido: pedido.data_pedido,
        itens_texto: itensArray
          .map(
            (item) =>
              `${item.quantidade}x ${item.nome} - R$ ${(
                item.preco * item.quantidade
              ).toFixed(2)}`
          )
          .join(", "),
      };
    });

    res.json(pedidosFormatados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * @swagger
 * /api/pedidos:
 *   post:
 *     summary: Cria um novo pedido do totem
 *     description: Recebe um pedido do aplicativo Android e salva no banco
 *     tags: [Pedidos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PedidoCreate'
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PedidoResponse'
 *       400:
 *         description: Dados inválidos fornecidos
 *       500:
 *         description: Erro interno do servidor
 */
async function criarPedido(req, res) {
  try {
    const { cliente, itens, total } = req.body;

    const novoPedido = await PedidoService.criarPedido({
      cliente: cliente || "Cliente Totem",
      itens: itens,
      total: parseFloat(total),
      status: "pendente",
    });

    res.status(201).json({
      message: "Pedido criado com sucesso!",
      pedido: novoPedido,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * @swagger
 * /api/pedidos:
 *   get:
 *     summary: Lista todos os pedidos (protegida)
 *     description: Retorna todos os pedidos cadastrados no sistema
 *     tags: [Pedidos]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pedido'
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
async function listarPedidos(req, res) {
  try {
    const pedidos = await PedidoService.listarPedidos();
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * @swagger
 * /api/pedidos/{id}:
 *   get:
 *     summary: Obtém um pedido específico (protegida)
 *     description: Retorna os detalhes de um pedido pelo seu ID
 *     tags: [Pedidos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID do pedido
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pedido encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pedido'
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Pedido não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
async function buscarPedidoPorId(req, res) {
  try {
    const pedido = await PedidoService.buscarPedidoPorId(req.params.id);
    if (!pedido) {
      return res.status(404).json({ error: "Pedido não encontrado!" });
    }
    res.json(pedido);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * @swagger
 * /api/pedidos/{id}/status:
 *   put:
 *     summary: Atualiza o status de um pedido (protegida)
 *     description: Altera o status de um pedido (pendente, preparando, pronto, entregue)
 *     tags: [Pedidos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID do pedido
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pendente, preparando, pronto, entregue]
 *                 example: "preparando"
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PedidoResponse'
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Pedido não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
async function atualizarStatusPedido(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const pedidoAtualizado = await PedidoService.atualizarStatusPedido(
      id,
      status
    );
    res.json({
      message: "Status do pedido atualizado com sucesso!",
      pedido: pedidoAtualizado,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  listarPedidosHistorico,
  criarPedido,
  listarPedidos,
  buscarPedidoPorId,
  atualizarStatusPedido,
};
