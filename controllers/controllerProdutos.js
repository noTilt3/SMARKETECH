const Product = require("../models/Produto");

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
 *         - quantidade
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
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
 *         quantidade:
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
 *         - quantidade
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
 *         quantidade:
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
 *         quantidade:
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
 * /api/products:
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
    const products = await Product.getAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * @swagger
 * /api/products/{id}:
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
    const product = await Product.getById(req.params.id);
    if (!product)
      return res.status(404).json({ error: "Produto não encontrado!" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * @swagger
 * /api/products/search:
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
    const products = await Product.searchByName(q);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * @swagger
 * /api/products:
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
    const { nome, precovenda, precocompra, quantidade, dtval } = req.body;
    const newProduct = await Product.create({
      nome,
      precovenda,
      precocompra,
      qtd: quantidade,
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
 * /api/products/{id}:
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
    const { nome, precovenda, precocompra, quantidade, dtval } = req.body;
    const updatedProduct = await Product.update(id, {
      nome,
      precovenda,
      precocompra,
      qtd: quantidade,
      dtval,
    });
    if (!updatedProduct)
      return res.status(404).json({ error: "Produto não encontrado!" });
    res.json({
      message: "Produto atualizado com sucesso!",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * @swagger
 * /api/products/{id}:
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
    const deleted = await Product.delete(id);
    if (!deleted)
      return res.status(404).json({ error: "Produto não encontrado!" });
    res.json({ message: "Produto deletado com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
