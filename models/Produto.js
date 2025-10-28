const pool = require("../config/database");

// Função de validação de preços
function validarPreco(precocompra, precovenda, nome) {
  if (!precocompra || !precovenda) {
    throw new Error(`Preços não podem estar vazios para o produto ${nome}`);
  }

  // Substitui vírgula por ponto
  const compra = parseFloat(String(precocompra).replace(",", "."));
  const venda = parseFloat(String(precovenda).replace(",", "."));

  if (isNaN(compra) || isNaN(venda)) {
    throw new Error(`Preço inválido para o produto ${nome}`);
  }

  if (compra <= 0 || venda <= 0) {
    throw new Error(`Preços devem ser maiores que zero para o produto ${nome}`);
  }

  if (compra >= venda) {
    throw new Error(
      `Preço de compra deve ser menor que preço de venda para o produto ${nome}`
    );
  }

  return { compra, venda };
}

class Product {
  static async getAll() {
    try {
      const result = await pool.query(`
        SELECT id, nome, qtd as quantidade, precovenda as preco, precocompra, dtval as data_validade
        FROM produtos 
        WHERE ativo = true
        ORDER BY nome
      `);
      return result.rows;
    } catch (error) {
      throw new Error("Erro ao buscar produtos: " + error.message);
    }
  }

  static async getById(id) {
    try {
      const result = await pool.query(
        `SELECT id, nome, qtd as quantidade, precovenda as preco, precocompra, dtval as data_validade
         FROM produtos 
         WHERE id = $1 AND ativo = true`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error("Erro ao buscar produto: " + error.message);
    }
  }

  static async searchByName(searchTerm) {
    try {
      const result = await pool.query(
        `SELECT id, nome, qtd as quantidade, precovenda as preco, precocompra, dtval as data_validade
         FROM produtos 
         WHERE nome ILIKE $1 AND ativo = true
         ORDER BY nome`,
        [`%${searchTerm}%`]
      );
      return result.rows;
    } catch (error) {
      throw new Error("Erro ao buscar produtos: " + error.message);
    }
  }

  static async create(productData) {
    try {
      const { nome, precovenda, precocompra, qtd, dtval } = productData;

      // Validação de preços
      const { compra, venda } = validarPreco(precocompra, precovenda, nome);

      const result = await pool.query(
        `INSERT INTO produtos (nome, precovenda, precocompra, qtd, dtval, ativo)
         VALUES ($1, $2, $3, $4, $5, true)
         RETURNING id, nome, qtd as quantidade, precovenda as preco, precocompra, dtval as data_validade`,
        [nome, venda, compra, qtd, dtval]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error("Erro ao criar produto: " + error.message);
    }
  }

  static async update(id, productData) {
    try {
      const { nome, precovenda, precocompra, qtd, dtval } = productData;

      // Validação de preços
      const { compra, venda } = validarPreco(precocompra, precovenda, nome);

      const result = await pool.query(
        `UPDATE produtos 
         SET nome = $1, precovenda = $2, precocompra = $3, qtd = $4, dtval = $5
         WHERE id = $6
         RETURNING id, nome, qtd as quantidade, precovenda as preco, precocompra, dtval as data_validade`,
        [nome, venda, compra, qtd, dtval, id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error("Erro ao atualizar produto: " + error.message);
    }
  }

  static async delete(id) {
    try {
      const result = await pool.query(
        `DELETE FROM produtos WHERE id = $1 RETURNING id`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error("Erro ao excluir produto: " + error.message);
    }
  }
}

module.exports = Product;
