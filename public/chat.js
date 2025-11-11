(function () {
  const contatosEl = document.getElementById("contatos");
  const addEmailInput = document.getElementById("addEmail");
  const addBtn = document.getElementById("addBtn");
  const contactError = document.getElementById("contactError");
  const contactSuccess = document.getElementById("contactSuccess");
  const convTitle = document.getElementById("convTitle");
  const mensagensEl = document.getElementById("mensagens");
  const msgInput = document.getElementById("msgInput");
  const sendBtn = document.getElementById("sendBtn");

  let contatos = [];
  let activeContact = null;
  let pollTimer = null;
  let evtSource = null;
  let isPollingActive = false;

  function showContactError(msg) {
    contactError.textContent = msg;
    contactError.style.display = "block";
    setTimeout(() => {
      contactError.style.display = "none";
    }, 2500);
  }

  function showContactSuccess(msg) {
    if (!contactSuccess) return;
    contactSuccess.textContent = msg;
    contactSuccess.style.display = "block";
    setTimeout(() => {
      contactSuccess.style.display = "none";
    }, 1800);
  }

  function initialsFrom(nameOrEmail) {
    const base = (nameOrEmail || "").trim();
    if (!base) return "U";
    const parts = base.split(/\s+|@/).filter(Boolean);
    const first = parts[0] ? parts[0][0] : "";
    const last = parts[1] ? parts[1][0] : "";
    return (first + last).toUpperCase() || (base[0] || "U").toUpperCase();
  }

  function colorFromString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue} 70% 50%)`;
  }

  function renderContacts() {
    contatosEl.innerHTML = "";
    contatos.forEach((c) => {
      const div = document.createElement("div");
      div.className =
        "contact" +
        (activeContact && activeContact.id === c.id ? " active" : "");
      const label = c.nome || c.email;
      const avatarBg = colorFromString(label);
      div.innerHTML = `
        <div class="avatar" style="background:${avatarBg}">${initialsFrom(
        label
      )}</div>
        <div style="display:flex;flex-direction:column">
          <strong>${label}</strong>
          <span style="font-size:12px;color:#64748b;">${c.email}</span>
        </div>`;
      div.addEventListener("click", () => selectContact(c));
      contatosEl.appendChild(div);
    });
  }

  function renderEmpty() {
    mensagensEl.innerHTML =
      '<div class="empty">Nenhuma conversa selecionada</div>';
    msgInput.disabled = true;
    sendBtn.disabled = true;
  }

  function formatTime(ts) {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }

  function renderMessages(msgs) {
    mensagensEl.innerHTML = "";
    msgs.forEach((m) => {
      const b = document.createElement("div");
      b.className = "msg " + (m.me ? "me" : "other");
      b.innerHTML = `${m.content}<span class="time">${formatTime(
        m.created_at
      )}</span>`;
      mensagensEl.appendChild(b);
    });
    mensagensEl.scrollTop = mensagensEl.scrollHeight;
  }

  function notifyLatestTimestamp(msgs) {
    try {
      const latest = (msgs || [])
        .filter((m) => !m.me)
        .reduce((acc, m) => {
          const t = new Date(m.created_at).getTime();
          return isFinite(t) && t > acc ? t : acc;
        }, 0);
      if (latest) {
        window.parent &&
          window.parent.postMessage(
            { type: "chat.latest", latestTs: new Date(latest).toISOString() },
            "*"
          );
      }
    } catch {}
  }

  async function fetchContacts() {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.log("Sem token, ignorando busca de contatos");
        contatos = [];
        renderContacts();
        return;
      }

      const data = await apiFetch("/api/chat/contatos");
      contatos = Array.isArray(data) ? data : [];
      renderContacts();
    } catch (e) {
      console.log("Erro ao buscar contatos:", e);
      contatos = contatos || [];
      renderContacts();
    }
  }

  async function addContact() {
    const email = (addEmailInput.value || "").trim();
    if (!email) return showContactError("Informe um e-mail válido.");
    try {
      addBtn.disabled = true;
      await apiFetch("/api/chat/contatos", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      addEmailInput.value = "";
      showContactSuccess("Contato adicionado com sucesso!");
      await fetchContacts();
    } catch (e) {
      showContactError(e.message || "Não foi possível adicionar o contato.");
    } finally {
      addBtn.disabled = false;
    }
  }

  async function selectContact(c) {
    activeContact = c;
    convTitle.textContent = c.nome || c.email;
    msgInput.disabled = false;
    sendBtn.disabled = false;
    await loadConversation();
    startPolling();
  }

  async function loadConversation() {
    if (!activeContact) return renderEmpty();
    try {
      const msgs = await apiFetch(
        `/api/chat/mensagens?userId=${activeContact.id}`
      );
      const meEmail = localStorage.getItem("userEmail") || "";
      const normalized = (msgs || []).map((m) => ({
        content: m.content,
        created_at: m.created_at,
        me: m.sender && m.sender.email ? m.sender.email === meEmail : !!m.me,
      }));
      renderMessages(normalized);
      notifyLatestTimestamp(normalized);
    } catch (e) {
      renderMessages([]);
    }
  }

  async function sendMessage() {
    if (!activeContact) return;
    const content = (msgInput.value || "").trim();
    if (!content) return;
    try {
      await apiFetch("/api/chat/mensagens", {
        method: "POST",
        body: JSON.stringify({ toUserId: activeContact.id, content }),
      });
      msgInput.value = "";
      await loadConversation();
    } catch (e) {
      // Opcional: exibir mensagem de erro inline
    }
  }

  function startPolling() {
    stopPolling();

    const token = localStorage.getItem("authToken");
    if (!token || !activeContact) {
      return;
    }

    isPollingActive = true;
    pollTimer = setInterval(() => {
      if (!isPollingActive || !activeContact) {
        stopPolling();
        return;
      }
      loadConversation();
    }, 8000); // 8 segundos entre atualizações
  }

  function stopPolling() {
    isPollingActive = false;
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function startSSE() {
    try {
      if (evtSource) {
        try {
          evtSource.close();
        } catch {}
      }

      const token = localStorage.getItem("authToken");
      if (!token) {
        console.log("Sem token, não iniciando SSE");
        return;
      }

      evtSource = new EventSource(
        `/api/chat/stream?token=${encodeURIComponent(token)}`
      );

      evtSource.addEventListener("stream:ready", () => {
        console.log("SSE conectado");
      });

      evtSource.addEventListener("ping", () => {
        // Manter conexão viva
      });

      evtSource.addEventListener("message:new", async (ev) => {
        try {
          const data = JSON.parse(ev.data || "{}");
          if (activeContact && data && data.senderId === activeContact.id) {
            await loadConversation();
          }
          // Notificar o FAB para badge
          window.parent &&
            window.parent.postMessage(
              {
                type: "chat.latest",
                latestTs: new Date().toISOString(),
              },
              "*"
            );
          // Atualizar contatos (para incluir implícitos)
          fetchContacts();
        } catch (error) {
          console.log("Erro ao processar mensagem SSE:", error);
        }
      });

      evtSource.onerror = (error) => {
        console.log("Erro na conexão SSE:", error);
        // Tentar reconectar após um tempo
        setTimeout(() => {
          if (localStorage.getItem("authToken")) {
            startSSE();
          }
        }, 5000);
      };
    } catch (error) {
      console.log("Erro ao iniciar SSE:", error);
    }
  }

  function stopSSE() {
    if (evtSource) {
      try {
        evtSource.close();
      } catch (error) {
        console.log("Erro ao fechar SSE:", error);
      }
      evtSource = null;
    }
  }

  // Função para verificar autenticação
  function checkAuth() {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("Usuário não autenticado");
      stopPolling();
      stopSSE();
      return false;
    }
    return true;
  }

  function startSSE() {
    try {
      if (evtSource) {
        try {
          evtSource.close();
        } catch {}
      }
      const token = localStorage.getItem("authToken");
      if (!token) return;
      evtSource = new EventSource(
        `/api/chat/stream?token=${encodeURIComponent(token)}`
      );
      evtSource.addEventListener("stream:ready", () => {});
      evtSource.addEventListener("ping", () => {});
      evtSource.addEventListener("message:new", async (ev) => {
        try {
          const data = JSON.parse(ev.data || "{}");
          if (activeContact && data && data.senderId === activeContact.id) {
            await loadConversation();
          }
          // Notificar o FAB para badge
          window.parent &&
            window.parent.postMessage(
              { type: "chat.latest", latestTs: new Date().toISOString() },
              "*"
            );
          // Atualizar contatos (para incluir implícitos)
          fetchContacts();
        } catch {}
      });
    } catch {}
  }

  // listeners
  addBtn.addEventListener("click", () => {
    if (!checkAuth()) return;
    addContact();
  });

  addEmailInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!checkAuth()) return;
      addContact();
    }
  });

  sendBtn.addEventListener("click", () => {
    if (!checkAuth()) return;
    sendMessage();
  });

  msgInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!checkAuth()) return;
      sendMessage();
    }
  });

  // Observar logout
  window.addEventListener("storage", (e) => {
    if (e.key === "authToken" && !e.newValue) {
      // Token removido - limpar estado
      stopPolling();
      stopSSE();
      activeContact = null;
      renderEmpty();
      contatos = [];
      renderContacts();
    }
  });

  // init
  function initializeChat() {
    if (!checkAuth()) {
      console.log("Chat não inicializado - sem autenticação");
      return;
    }

    renderEmpty();
    fetchContacts();
    startSSE();

    console.log("Chat inicializado");
  }

  // Inicializar após um breve delay
  setTimeout(initializeChat, 500);
})();
