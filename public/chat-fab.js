(function () {
  try {
    // evita duplicar
    if (document.getElementById("chatFabBtn")) return;

    // Botão flutuante
    const btn = document.createElement("button");
    btn.id = "chatFabBtn";
    btn.setAttribute("aria-label", "Abrir chat");
    btn.innerHTML = '<i class="fas fa-comments"></i>';

    Object.assign(btn.style, {
      position: "fixed",
      right: "20px",
      bottom: "20px",
      width: "56px",
      height: "56px",
      borderRadius: "50%",
      border: "none",
      outline: "none",
      background: "linear-gradient(135deg, #6366f1, #22c55e)",
      color: "#fff",
      boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
      cursor: "pointer",
      zIndex: "2147483000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "20px",
    });

    btn.addEventListener("mouseenter", () => {
      btn.style.transform = "translateY(-2px)";
      btn.style.boxShadow = "0 14px 24px rgba(0,0,0,0.2)";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "translateY(0)";
      btn.style.boxShadow = "0 10px 20px rgba(0,0,0,0.15)";
    });

    // Badge de novas mensagens
    const badge = document.createElement("span");
    badge.id = "chatFabBadge";
    badge.textContent = "?";
    Object.assign(badge.style, {
      position: "absolute",
      top: "-6px",
      right: "-6px",
      width: "20px",
      height: "20px",
      borderRadius: "50%",
      background: "#ef4444",
      color: "#fff",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "12px",
      fontWeight: "700",
      boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
    });
    btn.style.position = "fixed";
    btn.style.isolation = "isolate";
    btn.appendChild(badge);

    // Widget de chat (painel embutido)
    const widget = document.createElement("div");
    widget.id = "chatWidget";
    Object.assign(widget.style, {
      position: "fixed",
      right: "20px",
      bottom: "90px",
      width: "380px",
      height: "520px",
      background: "#fff",
      borderRadius: "14px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
      overflow: "hidden",
      display: "none",
      zIndex: "2147483000",
      border: "1px solid rgba(0,0,0,0.06)",
    });

    const header = document.createElement("div");
    header.innerHTML =
      '<div style="display:flex;align-items:center;gap:10px;"><i class="fas fa-comments" style="color:#6366f1"></i><strong>Chat</strong></div>';
    Object.assign(header.style, {
      height: "46px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 12px",
      background: "#f8fafc",
      borderBottom: "1px solid #e5e7eb",
    });

    const closeBtn = document.createElement("button");
    closeBtn.setAttribute("aria-label", "Fechar chat");
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    Object.assign(closeBtn.style, {
      border: "none",
      background: "transparent",
      cursor: "pointer",
      color: "#64748b",
      fontSize: "16px",
    });
    closeBtn.addEventListener("click", () => {
      widget.style.display = "none";
    });
    header.appendChild(closeBtn);

    const frame = document.createElement("iframe");
    frame.src = "/chat.html";
    frame.title = "Chat";
    frame.setAttribute("aria-label", "Janela do chat");
    Object.assign(frame.style, {
      width: "100%",
      height: "calc(100% - 46px)",
      border: "0",
    });

    widget.appendChild(header);
    widget.appendChild(frame);

    function setLastOpenedNow() {
      try {
        localStorage.setItem("chatLastOpenedAt", Date.now().toString());
      } catch {}
    }

    function hideBadge() {
      badge.style.display = "none";
    }

    btn.addEventListener("click", () => {
      const willOpen = widget.style.display === "none";
      widget.style.display = willOpen ? "block" : "none";
      if (willOpen) {
        setLastOpenedNow();
        hideBadge();
      }
    });

    // Recebe atualizações do iframe com o último timestamp de mensagem
    window.addEventListener("message", (event) => {
      try {
        const data = event.data || {};
        if (data.type === "chat.latest" && data.latestTs) {
          const latest = new Date(data.latestTs).getTime();
          const lastOpened = parseInt(
            localStorage.getItem("chatLastOpenedAt") || "0",
            10
          );
          if (
            Number.isFinite(latest) &&
            latest > (lastOpened || 0) &&
            widget.style.display === "none"
          ) {
            badge.style.display = "flex";
          }
        }
      } catch {}
    });

    document.body.appendChild(btn);
    document.body.appendChild(widget);

    // Variáveis para controlar o polling
    let pollingInterval = null;
    let isPollingActive = false;

    function startPolling() {
      if (isPollingActive) return;

      const token = localStorage.getItem("authToken");
      if (!token) {
        console.log("Sem token, não iniciando polling");
        return;
      }

      isPollingActive = true;
      pollingInterval = setInterval(async () => {
        await pollLatest();
      }, 10000); // 10 segundos entre requisições
    }

    function stopPolling() {
      isPollingActive = false;
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }
    }

    // Polling do último timestamp para mostrar badge mesmo sem abrir o chat
    async function pollLatest() {
      try {
        const token = localStorage.getItem("authToken");
        if (!token || !isPollingActive) {
          stopPolling();
          return;
        }

        if (typeof apiFetch !== "function") {
          console.log("apiFetch não disponível");
          return;
        }

        const data = await apiFetch("/api/chat/latest");
        const ts =
          data && data.latestTs ? new Date(data.latestTs).getTime() : 0;
        const lastOpened = parseInt(
          localStorage.getItem("chatLastOpenedAt") || "0",
          10
        );

        if (
          Number.isFinite(ts) &&
          ts > (lastOpened || 0) &&
          widget.style.display === "none"
        ) {
          badge.style.display = "flex";
        }
      } catch (error) {
        console.log("Erro no polling, parando...", error);
        stopPolling();
      }
    }

    // Iniciar polling quando houver token
    function initPolling() {
      const token = localStorage.getItem("authToken");
      if (token) {
        startPolling();
      }
    }

    // Observar mudanças no localStorage para token
    window.addEventListener("storage", (e) => {
      if (e.key === "authToken") {
        if (e.newValue) {
          startPolling();
        } else {
          stopPolling();
        }
      }
    });

    // inicia polling se token existir
    setTimeout(initPolling, 1000);
  } catch (error) {
    console.error("Erro no chat-fab:", error);
  }
})();
