(function () {
  const form = document.getElementById("forgotForm");
  const msg = document.getElementById("forgotMessage");

  function show(type, text) {
    msg.textContent = text;
    msg.className = "auth-message " + (type === "error" ? "" : "success");
    msg.classList.remove("hidden");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    if (!email) {
      show("error", "Informe seu e-mail");
      return;
    }

    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Falha ao solicitar recuperação");
      }
      let payload = {};
      try {
        payload = await res.json();
      } catch {}
      const link = payload && payload.resetLink ? payload.resetLink : "";

      if (link) {
        show(
          "success",
          "Instruções enviadas. Você também pode usar este link agora: " + link
        );
      } else {
        show(
          "success",
          "Se o e-mail existir, enviaremos instruções. Verifique sua caixa de entrada."
        );
      }
      form.reset();
    } catch (err) {
      show("error", err.message);
    }
  });
})();
