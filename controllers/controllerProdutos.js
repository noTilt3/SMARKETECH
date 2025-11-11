const ProductService = require("../service/produtoService");

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - nome
 *         - precovenda
 *         - precocompra
 *         - qtd
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nome:
 *           type: string
 *           example: "Arroz Integral"
 *         precovenda:
 *           type: number
 *           format: decimal
 *           example: 8.50
 *         precocompra:
 *           type: number
 *           format: decimal
 *           example: 6.50
 *         qtd:
 *           type: integer
 *           example: 25
 *         dtval:
 *           type: string
 *           format: date
 *           example: "2025-06-15"
 *         dtcad:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *
 *     ProductCreate:
 *       type: object
 *       required:
 *         - nome
 *         - precovenda
 *         - precocompra
 *         - qtd
 *       properties:
 *         nome:
 *           type: string
 *           example: "Arroz Integral"
 *         precovenda:
 *           type: number
 *           format: decimal
 *           example: 8.50
 *         precocompra:
 *           type: number
 *           format: decimal
 *           example: 6.50
 *         qtd:
 *           type: integer
 *           example: 25
 *         dtval:
 *           type: string
 *           format: date
 *           example: "2025-06-15"
 *
 *     ProductUpdate:
 *       type: object
 *       properties:
 *         nome:
 *           type: string
 *           example: "Arroz Integral"
 *         precovenda:
 *           type: number
 *           format: float
 *           example: 8.50
 *         precocompra:
 *           type: number
 *           format: float
 *           example: 6.50
 *         qtd:
 *           type: integer
 *           example: 25
 *         dtval:
 *           type: string
 *           format: date
 *           example: "2025-06-15"
 *
 *     ProductResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Produto criado com sucesso"
 *         product:
 *           $ref: '#/components/schemas/Product'
 */

/**
 * @swagger
 * tags:
 *   name: Produtos
 *   description: Endpoints para gerenciamento de produtos
 */

/**
 * @swagger
 * /api/produtos:
 *   get:
 *     summary: Lista todos os produtos
 *     description: Retorna todos os produtos cadastrados no sistema
 *     tags: [Produtos]
 *     responses:
 *       200:
 *         description: Lista de produtos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
async function getAllProducts(req, res) {
  try {
    const produtos = await ProductService.listarProdutos();
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * @swagger
 * /api/produtos/{id}:
 *   get:
 *     summary: Obtém um produto específico
 *     description: Retorna os detalhes de um produto pelo seu ID
 *     tags: [Produtos]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID do produto
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produto encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Produto não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
async function getProductById(req, res) {
  try {
    const product = await ProductService.buscarProdutoPorId(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado!" });
    }
    return res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * @swagger
 * /api/produtos/search:
 *   get:
 *     summary: Busca produtos por nome
 *     description: Retorna produtos que correspondem ao termo de busca
 *     tags: [Produtos]
 *     parameters:
 *       - name: q
 *         in: query
 *         description: Termo de busca
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Produtos encontrados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       400:
 *         description: Termo de busca não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
async function searchProducts(req, res) {
  try {
    const { q } = req.query;
    if (!q)
      return res.status(400).json({ error: "Termo de busca necessário!" });
    const produtos = await ProductService.buscarProdutosPorNome(q);
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * @swagger
 * /api/produtos:
 *   post:
 *     summary: Cria um novo produto
 *     description: Adiciona um novo produto ao sistema
 *     tags: [Produtos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCreate'
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *       400:
 *         description: Dados inválidos fornecidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
async function createProduct(req, res) {
  try {
    const { nome, precovenda, precocompra, qtd, dtval } = req.body;
    const newProduct = await ProductService.criarProduto({
      nome,
      precovenda,
      precocompra,
      qtd,
      dtval,
    });
    res
      .status(201)
      .json({ message: "Produto criado com sucesso!", product: newProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * @swagger
 * /api/produtos/{id}:
 *   put:
 *     summary: Atualiza um produto
 *     description: Atualiza os dados de um produto existente
 *     tags: [Produtos]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID do produto
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductUpdate'
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *       400:
 *         description: Dados inválidos fornecidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Produto não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { nome, precovenda, precocompra, qtd, dtval } = req.body;
    const updatedProduct = await ProductService.atualizarProduto(id, {
      nome,
      precovenda,
      precocompra,
      qtd,
      dtval,
    });
    res.json({
      message: "Produto atualizado com sucesso!",
      product: updatedProduct,
    });
  } catch (error) {
    const status = error.message === "Produto não encontrado!" ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
}

/**
 * @swagger
 * /api/produtos/{id}:
 *   delete:
 *     summary: Exclui um produto
 *     description: Remove um produto do sistema
 *     tags: [Produtos]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID do produto
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produto excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Produto não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    await ProductService.deletarProduto(id);
    res.json({ message: "Produto deletado com sucesso!" });
  } catch (error) {
    const status = error.message === "Produto não encontrado!" ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
