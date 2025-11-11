const chatService = require("../service/chatService");
const jwt = require("jsonwebtoken");

// Assinantes SSE por userId
const subscribers = new Map(); // userId -> Set<res>

function addSubscriber(userId, res) {
  if (!subscribers.has(userId)) subscribers.set(userId, new Set());
  subscribers.get(userId).add(res);
}

function removeSubscriber(userId, res) {
  const set = subscribers.get(userId);
  if (!set) return;
  set.delete(res);
  if (set.size === 0) subscribers.delete(userId);
}

function sendEvent(res, event, data) {
  try {
    if (event) res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data || {})}\n\n`);
  } catch {}
}

function publishToUser(userId, event, data) {
  const set = subscribers.get(userId);
  if (!set) return;
  for (const res of set) sendEvent(res, event, data);
}

async function listContacts(req, res) {
  try {
    const rows = await chatService.listContacts(req.user.id);
    return res.json(rows);
  } catch (e) {
    return res
      .status(400)
      .json({ error: e.message || "Erro ao listar contatos" });
  }
}

async function addContact(req, res) {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "E-mail é obrigatório" });
    const added = await chatService.addContactByEmail(req.user.id, email);
    return res.json(added);
  } catch (e) {
    return res
      .status(400)
      .json({ error: e.message || "Erro ao adicionar contato" });
  }
}

async function listMessages(req, res) {
  try {
    const otherUserId = parseInt(req.query.userId, 10);
    if (!otherUserId)
      return res.status(400).json({ error: "userId é obrigatório" });
    const msgs = await chatService.listConversation(req.user.id, otherUserId);
    return res.json(msgs);
  } catch (e) {
    return res
      .status(400)
      .json({ error: e.message || "Erro ao listar mensagens" });
  }
}

async function sendMessage(req, res) {
  try {
    const { toUserId, content } = req.body || {};
    if (!toUserId || !content)
      return res
        .status(400)
        .json({ error: "toUserId e content são obrigatórios" });
    const created = await chatService.sendMessage(
      req.user.id,
      parseInt(toUserId, 10),
      content
    );
    // Notificar destinatário em tempo real
    publishToUser(parseInt(toUserId, 10), "message:new", {
      id: created.id,
      senderId: req.user.id,
      receiverId: parseInt(toUserId, 10),
      created_at: created.created_at,
    });
    return res.json({ ok: true, id: created.id });
  } catch (e) {
    return res
      .status(400)
      .json({ error: e.message || "Erro ao enviar mensagem" });
  }
}

async function latest(req, res) {
  try {
    const ts = await chatService.latestTimestamp(req.user.id);
    return res.json({ latestTs: ts });
  } catch (e) {
    return res
      .status(400)
      .json({ error: e.message || "Erro ao obter último timestamp" });
  }
}

module.exports = {
  listContacts,
  addContact,
  listMessages,
  sendMessage,
  latest,
  stream,
};

// SSE stream (autenticação via token na query string)
function stream(req, res) {
  try {
    const token = (req.query && req.query.token) || "";
    if (!token) return res.status(401).end();
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).end();
    }
    const userId = payload && payload.id;
    if (!userId) return res.status(401).end();

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders && res.flushHeaders();

    addSubscriber(userId, res);
    sendEvent(res, "stream:ready", { ok: true, ts: Date.now() });

    const ping = setInterval(
      () => sendEvent(res, "ping", { ts: Date.now() }),
      25000
    );

    req.on("close", () => {
      clearInterval(ping);
      removeSubscriber(userId, res);
      try {
        res.end();
      } catch {}
    });
  } catch (e) {
    try {
      res.status(500).end();
    } catch {}
  }
}
