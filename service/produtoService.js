const prisma = require("../prisma/prisma");

async function listarProdutos() {
  return await prisma.produtos.findMany();
}

async function buscarProdutoPorId(id) {
  const product = await prisma.produtos.findUnique({
    where: { id: Number(id) },
  });
  return product;
}

async function buscarProdutosPorNome(nome) {
  return await prisma.produtos.findMany({
    where: {
      nome: {
        contains: nome,
        mode: "insensitive",
      },
    },
  });
}

async function criarProduto({ nome, precovenda, precocompra, qtd, dtval }) {
  return await prisma.produtos.create({
    data: {
      nome,
      precovenda: parseFloat(precovenda),
      precocompra: parseFloat(precocompra),
      qtd: Number(qtd),
      dtval: dtval ? new Date(dtval) : null,
    },
  });
}

async function atualizarProduto(
  id,
  { nome, precovenda, precocompra, qtd, dtval }
) {
  const existing = await prisma.produtos.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) throw new Error("Produto não encontrado!");
  return await prisma.produtos.update({
    where: { id: Number(id) },
    data: {
      nome,
      precovenda: precovenda ? parseFloat(precovenda) : existing.precovenda,
      precocompra: precocompra ? parseFloat(precocompra) : existing.precocompra,
      qtd: qtd ? Number(qtd) : existing.qtd,
      dtval: dtval ? new Date(dtval) : existing.dtval,
    },
  });
}

async function deletarProduto(id) {
  const existing = await prisma.produtos.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) throw new Error("Produto não encontrado!");

  await prisma.produtos.delete({ where: { id: Number(id) } });
  return true;
}

module.exports = {
  listarProdutos,
  buscarProdutoPorId,
  buscarProdutosPorNome,
  criarProduto,
  atualizarProduto,
  deletarProduto,
};
