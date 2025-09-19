const validateProductData = (req, res, next) => {
  const { nome, precovenda, precocompra, quantidade, dtval } = req.body;

  // Verifica campos obrigatórios
  if (!nome || !precovenda || !precocompra || !quantidade || !dtval) {
    return res.status(400).json({ 
      error: 'Nome, preço de venda, preço de compra, quantidade e data de validade são obrigatórios!' 
    });
  }

  // Valida nome
  if (typeof nome !== 'string' || nome.trim().length === 0) {
    return res.status(400).json({ error: 'Nome deve ser uma string válida!' });
  }

  // Valida preço de venda
  if (isNaN(parseFloat(precovenda)) || parseFloat(precovenda) <= 0) {
    return res.status(400).json({ error: 'Preço de venda deve ser um número positivo!' });
  }

  // Valida preço de compra
  if (isNaN(parseFloat(precocompra)) || parseFloat(precocompra) <= 0) {
    return res.status(400).json({ error: 'Preço de compra deve ser um número positivo!' });
  }

  // Valida quantidade
  if (!Number.isInteger(Number(quantidade)) || Number(quantidade) < 0) {
    return res.status(400).json({ error: 'Quantidade deve ser um inteiro não negativo!' });
  }

  // Valida data de validade
  const validade = new Date(dtval);
  if (isNaN(validade.getTime())) {
    return res.status(400).json({ error: 'Data de validade inválida!' });
  }

  next();
};

const validateUserData = (req, res, next) => {
  const { email, senha } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Email inválido!' });
  }

  if (!senha || senha.length < 6) {
    return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres!' });
  }

  next();
};

module.exports = { validateProductData, validateUserData };
