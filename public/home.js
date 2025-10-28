class ProductManager {
  constructor() {
    this.products = [];
    this.currentProduct = null;
    this.isEditing = false;
    this.init();
  }

  async init() {
    await this.loadProducts();
    this.setupEventListeners();
  }

  async loadProducts(searchTerm = "") {
    this.showLoading();
    this.hideError();
    this.hideNoProducts();

    try {
      const url = searchTerm
        ? `/api/products/search?q=${encodeURIComponent(searchTerm)}`
        : "/api/products";

      const token = localStorage.getItem("authToken");
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.products = await response.json();
      this.displayProducts();
      this.updateProductCount();
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      this.showError("Erro ao carregar produtos. Tente novamente.");
    } finally {
      this.hideLoading();
    }
  }

  displayProducts() {
    const grid = document.getElementById("productsGrid");
    if (!grid) {
      console.error("Elemento productsGrid não encontrado");
      return;
    }
    grid.innerHTML = "";

    if (this.products.length === 0) {
      this.showNoProducts();
      return;
    }

    this.products.forEach((product) => {
      const card = this.createProductCard(product);
      grid.appendChild(card);
    });
  }

  createProductCard(product) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.dataset.productId = product.id; // Adiciona ID como data attribute

    const quantityClass = product.quantidade < 10 ? "low" : "";

    card.innerHTML = `
            <h3 class="product-name">${this.escapeHtml(product.nome)}</h3>
            <div class="product-price">R$ ${parseFloat(
              product.preco || 0
            ).toFixed(2)}</div>
            <div class="product-quantity ${quantityClass}">
                Estoque: ${product.quantidade} unidades
            </div>
            ${
              product.data_validade
                ? `
                <div class="product-date">
                    <i class="fas fa-calendar"></i> Validade: ${new Date(
                      product.data_validade
                    ).toLocaleDateString("pt-BR")}
                </div>
            `
                : ""
            }
            <div class="product-actions">
                <button class="btn btn-sm btn-secondary view-btn">
                    <i class="fas fa-eye"></i> Ver
                </button>
                <button class="btn btn-sm btn-primary edit-btn">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-sm btn-danger delete-btn">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        `;

    return card;
  }

  updateProductCount() {
    const countElement = document.getElementById("productCount");
    countElement.textContent = `${this.products.length} produto${
      this.products.length !== 1 ? "s" : ""
    }`;
  }

  showLoading() {
    document.getElementById("loading").classList.remove("hidden");
  }

  hideLoading() {
    document.getElementById("loading").classList.add("hidden");
  }

  showError(message) {
    const errorElement = document.getElementById("errorMessage");
    errorElement.querySelector("p").textContent = message;
    errorElement.classList.remove("hidden");
  }

  hideError() {
    document.getElementById("errorMessage").classList.add("hidden");
  }

  showNoProducts() {
    document.getElementById("noProducts").classList.remove("hidden");
  }

  hideNoProducts() {
    document.getElementById("noProducts").classList.add("hidden");
  }

  setupEventListeners() {
    const searchInput = document.getElementById("searchInput");
    let searchTimeout;

    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.loadProducts(e.target.value.trim());
      }, 500);
    });

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.loadProducts(e.target.value.trim());
      }
    });

    // Form submission
    document.getElementById("productForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveProduct();
    });

    // Event delegation para os botões dos cards
    document.getElementById("productsGrid").addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      const card = btn.closest(".product-card");
      if (!card) return;

      const productId = parseInt(card.dataset.productId);
      if (!productId) return;

      console.log("Botão clicado:", btn.className, "Product ID:", productId);

      if (btn.classList.contains("view-btn")) {
        window.viewProduct(productId);
      } else if (btn.classList.contains("edit-btn")) {
        window.editProduct(productId);
      } else if (btn.classList.contains("delete-btn")) {
        window.deleteProduct(productId);
      }
    });
  }

  async saveProduct() {
    // Validação do formulário
    if (!this.validateForm()) {
      return;
    }

    const formData = {
      nome: document.getElementById("productName").value.trim(),
      precocompra: parseFloat(document.getElementById("productPriceBuy").value),
      precovenda: parseFloat(document.getElementById("productPriceSell").value),
      quantidade: parseInt(document.getElementById("productQuantity").value),
      dtval: document.getElementById("productValidity").value || null,
    };

    console.log("Dados do formulário:", formData);

    try {
      let response;
      if (this.isEditing) {
        console.log("Editando produto:", this.currentProduct.id);
        const token = localStorage.getItem("authToken");
        response = await fetch(`/api/products/${this.currentProduct.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(formData),
        });
      } else {
        console.log("Criando novo produto");
        const token = localStorage.getItem("authToken");
        response = await fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(formData),
        });
      }

      console.log("Resposta da API:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro da API:", errorData);
        throw new Error(errorData.error || "Erro ao salvar produto");
      }

      const result = await response.json();
      console.log("Produto salvo:", result);

      this.showSuccess(
        this.isEditing
          ? "Produto atualizado com sucesso!"
          : "Produto cadastrado com sucesso!"
      );
      this.closeModal();
      await this.loadProducts();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      this.showError(
        error.message || "Erro ao salvar produto. Tente novamente."
      );
    }
  }

  validateForm() {
    const name = document.getElementById("productName").value.trim();
    const priceBuy = document.getElementById("productPriceBuy").value;
    const priceSell = document.getElementById("productPriceSell").value;
    const quantity = document.getElementById("productQuantity").value;
    const validity = document.getElementById("productValidity").value;

    // Limpar erros anteriores
    this.clearFormErrors();

    let isValid = true;

    // Validar nome
    if (!name) {
      this.showFieldError("productName", "Nome do produto é obrigatório");
      isValid = false;
    } else if (name.length < 2) {
      this.showFieldError(
        "productName",
        "Nome deve ter pelo menos 2 caracteres"
      );
      isValid = false;
    }

    // Validar preço de compra
    if (!priceBuy || priceBuy <= 0) {
      this.showFieldError(
        "productPriceBuy",
        "Preço de compra deve ser maior que zero"
      );
      isValid = false;
    }

    // Validar preço de venda
    if (!priceSell || priceSell <= 0) {
      this.showFieldError(
        "productPriceSell",
        "Preço de venda deve ser maior que zero"
      );
      isValid = false;
    }

    // Validar se preço de compra é menor que preço de venda
    if (
      priceBuy &&
      priceSell &&
      parseFloat(priceBuy) >= parseFloat(priceSell)
    ) {
      this.showFieldError(
        "productPriceBuy",
        "Preço de compra deve ser menor que preço de venda"
      );
      this.showFieldError(
        "productPriceSell",
        "Preço de venda deve ser maior que preço de compra"
      );
      isValid = false;
    }

    // Validar quantidade
    if (!quantity || quantity < 0) {
      this.showFieldError(
        "productQuantity",
        "Quantidade deve ser maior ou igual a zero"
      );
      isValid = false;
    }

    // Validar data de validade (se preenchida)
    if (validity) {
      const validityDate = new Date(validity);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (validityDate < today) {
        this.showFieldError(
          "productValidity",
          "Data de validade não pode ser anterior a hoje"
        );
        isValid = false;
      }
    }

    return isValid;
  }

  showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const formGroup = field.closest(".form-group");

    // Remover erro anterior se existir
    const existingError = formGroup.querySelector(".field-error");
    if (existingError) {
      existingError.remove();
    }

    // Adicionar classe de erro
    field.classList.add("error");

    // Criar elemento de erro
    const errorDiv = document.createElement("div");
    errorDiv.className = "field-error";
    errorDiv.textContent = message;
    formGroup.appendChild(errorDiv);
  }

  clearFormErrors() {
    const errorFields = document.querySelectorAll(".form-control.error");
    errorFields.forEach((field) => field.classList.remove("error"));

    const errorMessages = document.querySelectorAll(".field-error");
    errorMessages.forEach((error) => error.remove());
  }

  async deleteProductById(id) {
    try {
      console.log("Excluindo produto:", id);
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      console.log("Resposta da exclusão:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro da API:", errorData);
        throw new Error(errorData.error || "Erro ao excluir produto");
      }

      this.showSuccess("Produto excluído com sucesso!");
      await this.loadProducts();
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      this.showError(
        error.message || "Erro ao excluir produto. Tente novamente."
      );
    }
  }

  showSuccess(message) {
    // Criar elemento de sucesso temporário
    const successDiv = document.createElement("div");
    successDiv.className = "alert alert-success";
    successDiv.innerHTML = `<i class="fas fa-check-circle" style="margin-right: 0.5rem;"></i>${message}`;

    // Inserir no topo da seção de produtos
    const productsSection = document.querySelector(".products-section");
    productsSection.insertBefore(successDiv, productsSection.firstChild);

    // Remover após 3 segundos
    setTimeout(() => {
      successDiv.remove();
    }, 3000);
  }

  openModal(product = null) {
    const modal = document.getElementById("productModal");
    if (!modal) {
      console.error("Modal não encontrado");
      return;
    }

    this.isEditing = !!product;
    this.currentProduct = product;

    const title = document.getElementById("modalTitle");
    const form = document.getElementById("productForm");

    if (!title || !form) {
      console.error("Elementos do modal não encontrados");
      return;
    }

    title.textContent = this.isEditing ? "Editar Produto" : "Novo Produto";

    // Limpar erros anteriores
    this.clearFormErrors();

    if (this.isEditing) {
      document.getElementById("productName").value = product.nome;
      document.getElementById("productPriceBuy").value =
        product.precocompra || "";
      document.getElementById("productPriceSell").value = product.preco;
      document.getElementById("productQuantity").value = product.quantidade;
      document.getElementById("productValidity").value = product.data_validade
        ? product.data_validade.split("T")[0]
        : "";
    } else {
      form.reset();
    }

    modal.style.display = "block";
  }

  closeModal() {
    document.getElementById("productModal").style.display = "none";
    this.isEditing = false;
    this.currentProduct = null;
    // Limpar erros quando fechar o modal
    this.clearFormErrors();
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

// Funções globais
let productManager;

function closeViewModal() {
  document.getElementById("viewModal").style.display = "none";
}

function confirmDelete() {
  if (productManager && productManager.currentProduct) {
    productManager.deleteProductById(productManager.currentProduct.id);
    closeConfirmModal();
  }
}

function closeConfirmModal() {
  document.getElementById("confirmModal").style.display = "none";
  if (productManager) {
    productManager.currentProduct = null;
  }
}

function closeModal() {
  if (productManager) {
    productManager.closeModal();
  }
}

function searchProducts() {
  const searchInput = document.getElementById("searchInput");
  if (productManager) {
    productManager.loadProducts(searchInput.value.trim());
  }
}

function refreshProducts() {
  if (productManager) {
    productManager.loadProducts();
  }
}

// Fechar modais ao clicar fora
window.onclick = function (event) {
  const productModal = document.getElementById("productModal");
  const viewModal = document.getElementById("viewModal");
  const confirmModal = document.getElementById("confirmModal");

  if (event.target === productModal) {
    closeModal();
  }
  if (event.target === viewModal) {
    closeViewModal();
  }
  if (event.target === confirmModal) {
    closeConfirmModal();
  }
};

// Verificar autenticação
function checkAuth() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "/";
    return false;
  }
  return true;
}

// Função de logout
function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userEmail");
  window.location.href = "/";
}

// Inicializar quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM carregado");

  // Verificar autenticação antes de inicializar
  if (!checkAuth()) {
    return;
  }

  try {
    productManager = new ProductManager();
    console.log("ProductManager inicializado");

    // Tornar productManager globalmente acessível
    window.productManager = productManager;

    // Definir funções globais
    window.viewProduct = function (id) {
      console.log("viewProduct chamada com id:", id);
      if (productManager) {
        const product = productManager.products.find((p) => p.id === id);
        if (product) {
          const modal = document.getElementById("viewModal");
          const details = document.getElementById("productDetails");

          if (!modal || !details) {
            console.error("Modal ou details não encontrados");
            return;
          }

          const validityText = product.data_validade
            ? new Date(product.data_validade).toLocaleDateString("pt-BR")
            : "Não informada";

          details.innerHTML = `
                        <div style="display: grid; gap: 1.5rem;">
                            <div>
                                <h3 style="color: #1e40af; margin-bottom: 0.5rem;">${
                                  product.nome
                                }</h3>
                                <div style="font-size: 1.5rem; font-weight: 700; color: #059669; margin-bottom: 1rem;">
                                    R$ ${parseFloat(product.preco || 0).toFixed(
                                      2
                                    )}
                                </div>
                            </div>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div>
                                    <strong>Quantidade em Estoque:</strong>
                                    <div style="color: ${
                                      product.quantidade < 10
                                        ? "#dc2626"
                                        : "#059669"
                                    }; font-weight: 600;">
                                        ${product.quantidade} unidades
                                    </div>
                                </div>
                                <div>
                                    <strong>Status:</strong>
                                    <div style="color: #059669; font-weight: 600;">
                                        Ativo
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <strong>Data de Validade:</strong>
                                <div style="color: #64748b; margin-top: 0.5rem;">${validityText}</div>
                            </div>
                        </div>
                    `;

          modal.style.display = "block";
        } else {
          console.error("Produto não encontrado com id:", id);
        }
      } else {
        console.error("productManager não está inicializado");
      }
    };

    window.editProduct = function (id) {
      console.log("editProduct chamada com id:", id);
      if (productManager) {
        const product = productManager.products.find((p) => p.id === id);
        if (product) {
          productManager.openModal(product);
        } else {
          console.error("Produto não encontrado com id:", id);
        }
      } else {
        console.error("productManager não está inicializado");
      }
    };

    window.deleteProduct = function (id) {
      console.log("deleteProduct chamada com id:", id);
      if (productManager) {
        const product = productManager.products.find((p) => p.id === id);
        if (product) {
          productManager.currentProduct = product;

          const confirmModal = document.getElementById("confirmModal");
          if (!confirmModal) {
            console.error("Modal de confirmação não encontrado");
            return;
          }

          const productName = confirmModal.querySelector(
            "#productToDeleteName"
          );
          if (productName) {
            productName.textContent = product.nome;
          } else {
            const modalBody = confirmModal.querySelector(".modal-body");
            const existingP = modalBody.querySelector("p");
            existingP.innerHTML = `Tem certeza que deseja excluir o produto <strong id="productToDeleteName">${product.nome}</strong>?`;
          }

          confirmModal.style.display = "block";
        } else {
          console.error("Produto não encontrado com id:", id);
        }
      } else {
        console.error("productManager não está inicializado");
      }
    };

    window.openAddModal = function () {
      console.log("openAddModal chamada");
      if (productManager) {
        productManager.openModal();
      } else {
        console.error("productManager não está inicializado");
      }
    };

    console.log("Funções globais definidas");

    // Adicionar event listeners para botões principais
    document.getElementById("newProductBtn").addEventListener("click", () => {
      console.log("Botão Novo Produto clicado");
      window.openAddModal();
    });

    document.getElementById("refreshBtn").addEventListener("click", () => {
      console.log("Botão Atualizar clicado");
      productManager.loadProducts();
    });

    document.getElementById("searchBtn").addEventListener("click", () => {
      console.log("Botão Buscar clicado");
      const searchInput = document.getElementById("searchInput");
      productManager.loadProducts(searchInput.value.trim());
    });

    // Event listeners para fechar modais
    document
      .getElementById("closeProductModal")
      .addEventListener("click", () => {
        console.log("Fechando modal de produto");
        productManager.closeModal();
      });

    document
      .getElementById("cancelProductBtn")
      .addEventListener("click", () => {
        console.log("Cancelando modal de produto");
        productManager.closeModal();
      });

    document.getElementById("closeViewModal").addEventListener("click", () => {
      console.log("Fechando modal de visualização");
      document.getElementById("viewModal").style.display = "none";
    });

    document
      .getElementById("closeConfirmModal")
      .addEventListener("click", () => {
        console.log("Fechando modal de confirmação");
        document.getElementById("confirmModal").style.display = "none";
        productManager.currentProduct = null;
      });

    document.getElementById("cancelDeleteBtn").addEventListener("click", () => {
      console.log("Cancelando exclusão");
      document.getElementById("confirmModal").style.display = "none";
      productManager.currentProduct = null;
    });

    document
      .getElementById("confirmDeleteBtn")
      .addEventListener("click", () => {
        console.log("Confirmando exclusão");
        if (productManager.currentProduct) {
          productManager.deleteProductById(productManager.currentProduct.id);
          document.getElementById("confirmModal").style.display = "none";
          productManager.currentProduct = null;
        }
      });

    // Event listener para logout
    document.getElementById("logoutBtn").addEventListener("click", () => {
      console.log("Logout clicado");
      logout();
    });
  } catch (error) {
    console.error("Erro ao inicializar ProductManager:", error);
  }
});
