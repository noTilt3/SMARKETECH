(function () {
  const avatarImg = document.getElementById("perfilAvatar");
  const inputNome = document.getElementById("nome");
  const inputEmail = document.getElementById("email");
  const inputDtnasc = document.getElementById("dtnasc");
  const fotoInput = document.getElementById("fotoInput");
  const removerFotoBtn = document.getElementById("removerFotoBtn");
  const salvarBtn = document.getElementById("salvarBtn");
  const deleteAccountBtn = document.getElementById("deleteAccountBtn");
  const feedback = document.getElementById("feedback");
  // elementos do modal de exclusão
  const deleteModal = document.getElementById("deleteModal");
  const deletePasswordInput = document.getElementById("deletePasswordInput");
  const deleteError = document.getElementById("deleteError");
  const deleteCancelBtn = document.getElementById("deleteCancelBtn");
  const deleteConfirmBtn = document.getElementById("deleteConfirmBtn");

  let currentFotoBase64 = null; // armazena base64 atual ou null

  function showFeedback(message, type = "success") {
    feedback.textContent = message;
    feedback.className = `feedback ${type}`;
    feedback.style.display = "block";
    setTimeout(() => {
      feedback.style.display = "none";
    }, 3000);
  }

  function formatDateToInput(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  async function loadPerfil() {
    try {
      const perfil = await apiFetch("/api/perfil/me");
      inputNome.value = perfil.nome || "";
      inputEmail.value = perfil.email || "";
      inputDtnasc.value = formatDateToInput(perfil.dtnasc);
      currentFotoBase64 = perfil.fotoBase64 || null;
      if (currentFotoBase64) {
        avatarImg.src = `data:image/*;base64,${currentFotoBase64}`;
      } else {
        avatarImg.src = "/avatar-placeholder.png";
      }
    } catch (e) {
      showFeedback(e.message || "Erro ao carregar perfil", "error");
    }
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function openDeleteModal() {
    if (!deleteModal) return;
    deletePasswordInput && (deletePasswordInput.value = "");
    if (deleteError) {
      deleteError.textContent = "";
      deleteError.style.display = "none";
    }
    deleteModal.style.display = "block";
    setTimeout(() => {
      deletePasswordInput && deletePasswordInput.focus();
    }, 0);
  }

  function closeDeleteModal() {
    if (!deleteModal) return;
    deleteModal.style.display = "none";
  }

  async function deleteAccountFlow() {
    try {
      const senha =
        deletePasswordInput && deletePasswordInput.value
          ? deletePasswordInput.value.trim()
          : "";
      if (!senha) {
        if (deleteError) {
          deleteError.textContent = "Informe sua senha.";
          deleteError.style.display = "block";
        }
        return;
      }
      deleteConfirmBtn && (deleteConfirmBtn.disabled = true);
      await apiFetch("/api/auth/me", {
        method: "DELETE",
        body: JSON.stringify({ senha }),
      });
      closeDeleteModal();
      // Mensagem mais bonita usando o feedback da página
      showFeedback(
        "✅ Sua conta foi excluída com sucesso. Redirecionando...",
        "success"
      );
      setTimeout(() => {
        try {
          localStorage.removeItem("authToken");
          localStorage.removeItem("userEmail");
        } catch {}
        window.location.href = "/";
      }, 1400);
    } catch (e) {
      if (deleteError) {
        deleteError.textContent = (e && e.message) || "Erro ao excluir conta";
        deleteError.style.display = "block";
      }
    } finally {
      deleteConfirmBtn && (deleteConfirmBtn.disabled = false);
    }
  }

  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener("click", openDeleteModal);
  }
  if (deleteCancelBtn) {
    deleteCancelBtn.addEventListener("click", closeDeleteModal);
  }
  if (deleteConfirmBtn) {
    deleteConfirmBtn.addEventListener("click", deleteAccountFlow);
  }
  if (deletePasswordInput) {
    deletePasswordInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        deleteAccountFlow();
      }
    });
  }

  fotoInput.addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // valida tamanho máximo de 4MB
    const MAX_SIZE = 4 * 1024 * 1024; // 4MB
    if (file.size > MAX_SIZE) {
      showFeedback(
        "Imagem muito grande (máx 4MB). Escolha um arquivo menor.",
        "error"
      );
      fotoInput.value = "";
      return;
    }
    try {
      const dataUrl = await fileToBase64(file);
      currentFotoBase64 = dataUrl; // manter com data URL, backend extrai a parte base64
      avatarImg.src = dataUrl;
    } catch (err) {
      showFeedback("Falha ao processar imagem", "error");
    }
  });

  removerFotoBtn.addEventListener("click", () => {
    currentFotoBase64 = ""; // string vazia sinaliza remoção no backend
    avatarImg.src = "/avatar-placeholder.png";
  });

  salvarBtn.addEventListener("click", async () => {
    try {
      const payload = {
        nome: inputNome.value.trim(),
        dtnasc: inputDtnasc.value
          ? new Date(inputDtnasc.value).toISOString()
          : null,
        fotoBase64:
          typeof currentFotoBase64 === "string" ? currentFotoBase64 : null,
      };
      const updated = await apiFetch("/api/perfil/me", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      showFeedback("Perfil atualizado com sucesso!", "success");
      // atualizar base64 conforme resposta
      currentFotoBase64 = updated.fotoBase64
        ? `data:image/*;base64,${updated.fotoBase64}`
        : null;
      avatarImg.src = currentFotoBase64 || "/avatar-placeholder.png";
    } catch (e) {
      showFeedback(e.message || "Erro ao salvar perfil", "error");
    }
  });

  document.addEventListener("DOMContentLoaded", loadPerfil);
  // logout handler local (mantém comportamento das outras páginas)
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      try {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userEmail");
      } catch {}
      window.location.href = "/";
    });
  }
})();
