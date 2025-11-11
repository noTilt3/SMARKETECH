const prisma = require("../prisma/prisma");

function ensureModels() {
  if (!prisma || !prisma.adms) {
    throw new Error("Prisma client não inicializado");
  }
  if (!prisma.contatos || !prisma.mensagens) {
    throw new Error(
      "Modelos de chat indisponíveis. Execute 'prisma generate' após aplicar as tabelas de chat."
    );
  }
}

async function listContacts(userId) {
  ensureModels();
  // contatos adicionados explicitamente
  const rows = await prisma.contatos.findMany({
    where: { user_id: userId },
    include: {
      contact_user: { select: { id: true, nome: true, email: true } },
    },
    orderBy: { created_at: "desc" },
  });
  const explicit = rows.map((r) => ({
    id: r.contact_user.id,
    nome: r.contact_user.nome,
    email: r.contact_user.email,
  }));

  // remetentes que enviaram mensagem para este usuário (mesmo não adicionados)
  const senders = await prisma.mensagens.findMany({
    where: { receiver_id: userId },
    distinct: ["sender_id"],
    select: { sender_id: true },
  });
  const senderIds = senders
    .map((s) => s.sender_id)
    .filter((id) => id && id !== userId);

  let senderUsers = [];
  if (senderIds.length) {
    senderUsers = await prisma.adms.findMany({
      where: { id: { in: senderIds } },
      select: { id: true, nome: true, email: true },
    });
  }

  // unir e remover duplicados por id
  const byId = new Map();
  [...explicit, ...senderUsers].forEach((u) => {
    if (u && !byId.has(u.id)) byId.set(u.id, u);
  });
  return Array.from(byId.values());
}

async function addContactByEmail(userId, email) {
  ensureModels();
  const other = await prisma.adms.findUnique({ where: { email } });
  if (!other) throw new Error("Usuário não encontrado pelo e-mail informado");
  if (other.id === userId)
    throw new Error("Você não pode adicionar a si mesmo");

  const exists = await prisma.contatos.findFirst({
    where: { user_id: userId, contact_user_id: other.id },
  });
  if (!exists) {
    await prisma.contatos.create({
      data: { user_id: userId, contact_user_id: other.id },
    });
  }
  return { id: other.id, nome: other.nome, email: other.email };
}

async function listConversation(userId, otherUserId) {
  ensureModels();
  const msgs = await prisma.mensagens.findMany({
    where: {
      OR: [
        { sender_id: userId, receiver_id: otherUserId },
        { sender_id: otherUserId, receiver_id: userId },
      ],
    },
    orderBy: { created_at: "asc" },
    include: {
      sender: { select: { id: true, email: true } },
      receiver: { select: { id: true, email: true } },
    },
  });
  return msgs.map((m) => ({
    id: m.id,
    content: m.content,
    created_at: m.created_at,
    sender: m.sender,
    receiver: m.receiver,
  }));
}

async function sendMessage(userId, toUserId, content) {
  ensureModels();
  if (!content || !content.trim()) throw new Error("Mensagem vazia");
  // opcional: sanitização básica
  const clean = content.trim().slice(0, 2000);
  const created = await prisma.mensagens.create({
    data: { sender_id: userId, receiver_id: toUserId, content: clean },
  });
  return created;
}

module.exports = {
  listContacts,
  addContactByEmail,
  listConversation,
  sendMessage,
  latestTimestamp,
};

async function latestTimestamp(userId) {
  ensureModels();
  const last = await prisma.mensagens.findFirst({
    where: { receiver_id: userId },
    orderBy: { created_at: "desc" },
    select: { created_at: true },
  });
  return last?.created_at || null;
}
