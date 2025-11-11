const prisma = require("../prisma/prisma");

// FUNÇÃO PARA ATUALIZAR ESTOQUE
async function atualizarEstoqueProduto(tx, nomeProduto, quantidadeVendida) {
  console.log(`🔍 Buscando produto: "${nomeProduto}"`);
  
  const produto = await tx.produtos.findFirst({
    where: {
      nome: {
        equals: nomeProduto,
        mode: "insensitive",
      },
      ativo: true,
    },
  });

  console.log(`📦 Produto encontrado:`, produto);

  if (!produto) {
    throw new Error(`Produto "${nomeProduto}" não encontrado no estoque!`);
  }

  if (produto.qtd < quantidadeVendida) {
    throw new Error(
      `Estoque insuficiente para ${nomeProduto}. Disponível: ${produto.qtd}, Pedido: ${quantidadeVendida}`
    );
  }

  const novaQuantidade = produto.qtd - quantidadeVendida;
  console.log(`🔄 Atualizando estoque: ${produto.qtd} - ${quantidadeVendida} = ${novaQuantidade}`);

  // ✅ VERIFICAÇÃO EXTRA - Garantir que temos todos os dados
  if (typeof produto.id === 'undefined') {
    throw new Error(`ID do produto "${nomeProduto}" não encontrado!`);
  }

  const produtoAtualizado = await tx.produtos.update({
    where: { id: produto.id },
    data: {
      qtd: novaQuantidade, // ← Este campo deve estar presente
    },
  });

  console.log(`✅ Estoque atualizado:`, produtoAtualizado);
  return produtoAtualizado;
}

async function criarPedido({ cliente, itens, total, status = "pendente" }) {
  // ✅ CONVERTE total para Decimal (string)
  const totalDecimal = parseFloat(total).toFixed(2);

  return await prisma.$transaction(async (tx) => {
    // 1. CRIAR O PEDIDO
    const novoPedido = await tx.pedidos.create({
      data: {
        cliente: cliente || "Cliente Totem",
        itens: JSON.stringify(itens),
        total: totalDecimal, 
        status,
        data_pedido: new Date(),
      },
    });

    // 2. ATUALIZAR ESTOQUE DE CADA ITEM
    for (const item of itens) {
      await atualizarEstoqueProduto(tx, item.nome, item.quantidade);
    }

    return novoPedido;
  });
}

// ✅ FUNÇÃO listarPedidos
async function listarPedidos() {
  try {
    const pedidos = await prisma.pedidos.findMany({
      orderBy: { data_pedido: "desc" },
    });

    // ✅ CONVERTE Decimal para número JavaScript
    const pedidosFormatados = pedidos.map((pedido) => ({
      ...pedido,
      total: parseFloat(pedido.total), // Converte Decimal para number
    }));

    return pedidosFormatados;
  } catch (error) {
    throw error;
  }
}

async function buscarPedidoPorId(id) {
  const pedido = await prisma.pedidos.findUnique({
    where: { id: Number(id) },
  });

  if (pedido) {
    return {
      ...pedido,
      total: parseFloat(pedido.total), // Converte Decimal para number
    };
  }

  return null;
}

async function atualizarStatusPedido(id, status) {
  const pedido = await prisma.pedidos.findUnique({
    where: { id: Number(id) },
  });

  if (!pedido) throw new Error("Pedido não encontrado");

  const pedidoAtualizado = await prisma.pedidos.update({
    where: { id: Number(id) },
    data: { status },
  });

  return {
    ...pedidoAtualizado,
    total: parseFloat(pedidoAtualizado.total), // Converte Decimal para number
  };
}

async function deletarPedido(id) {
  const pedido = await prisma.pedidos.findUnique({
    where: { id: Number(id) },
  });

  if (!pedido) throw new Error("Pedido não encontrado");

  await prisma.pedidos.delete({
    where: { id: Number(id) },
  });

  return true;
}

module.exports = {
  criarPedido,
  listarPedidos,
  buscarPedidoPorId,
  atualizarStatusPedido,
  deletarPedido,
};