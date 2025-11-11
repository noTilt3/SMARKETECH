(function () {
  const form = document.getElementById("resetForm");
  const msg = document.getElementById("resetMessage");

  function show(type, text) {
    msg.textContent = text;
    msg.className = "auth-message " + (type === "error" ? "" : "success");
    msg.classList.remove("hidden");
  }

  function getToken() {
    const p = new URLSearchParams(window.location.search);
    return p.get("token") || "";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const senha = document.getElementById("senha").value;
    const senha2 = document.getElementById("senha2").value;

    if (!senha || senha.length < 6) {
      show("error", "A senha deve ter ao menos 6 caracteres");
      return;
    }
    if (senha !== senha2) {
      show("error", "As senhas não conferem");
      return;
    }

    const token = getToken();
    if (!token) {
      show("error", "Token inválido. Acesse o link do e-mail.");
      return;
    }

    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, senha }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Falha ao redefinir senha");
      }

      show(
        "success",
        "Senha redefinida com sucesso! Redirecionando para login..."
      );
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (err) {
      show("error", err.message);
    }
  });
})();
