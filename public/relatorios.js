class ReportsManager {
  constructor() {
    this.produtos = [];
    this.init();
  }

  async init() {
    console.log("🚀 Inicializando ReportsManager...");

    if (!this.checkAuth()) return;

    this.setupEventListeners();
    await this.loadData();
    this.updateStatsCards();
    this.populateTable();

    this.showFallbackCharts();

    // Tentar carregar Chart.js como fallback
    this.tryLoadChartJS();
  }

  checkAuth() {
    const token = localStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/";
      return false;
    }
    return true;
  }

  setupEventListeners() {
    // Botão de logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => this.logout());
    }

    // Botão de atualizar relatórios
    const updateBtn = document.getElementById("updateReports");
    if (updateBtn) {
      updateBtn.addEventListener("click", () => this.updateAllReports());
    }

    // (removido) Botão de remover conta

    // Controles da tabela
    const searchInput = document.getElementById("tableSearch");
    if (searchInput) {
      searchInput.addEventListener("input", (e) =>
        this.filterTable(e.target.value)
      );
    }

    const sortSelect = document.getElementById("tableSort");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) =>
        this.sortTable(e.target.value)
      );
    }

    // Definir datas padrão
    this.setDefaultDates();
  }

  setDefaultDates() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");

    if (startDateInput)
      startDateInput.value = thirtyDaysAgo.toISOString().split("T")[0];
    if (endDateInput) endDateInput.value = today.toISOString().split("T")[0];
  }

  async loadData() {
    try {
      console.log("📊 Carregando dados dos produtos...");

      this.produtos = await apiFetch("/api/produtos");
      console.log("✅ Produtos carregados:", this.produtos.length);

      if (this.produtos.length === 0) {
        this.produtos = this.generateSampleData();
        console.log("📝 Usando dados de exemplo:", this.produtos.length);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar dados:", error);
      this.produtos = this.generateSampleData();
      console.log(
        "📝 Usando dados de exemplo devido ao erro:",
        this.produtos.length
      );
    }
  }

  generateSampleData() {
    return [
      {
        id: 1,
        nome: "Arroz Integral",
        precovenda: 8.5,
        qtd: 25,
        dtval: "2025-06-15",
      },
      {
        id: 2,
        nome: "Feijão Preto",
        precovenda: 6.8,
        qtd: 30,
        dtval: "2025-08-20",
      },
      {
        id: 3,
        nome: "Açúcar Cristal",
        precovenda: 4.2,
        qtd: 5,
        dtval: "2025-12-10",
      },
      {
        id: 4,
        nome: "Óleo de Soja",
        precovenda: 7.9,
        qtd: 15,
        dtval: "2025-04-05",
      },
      {
        id: 5,
        nome: "Macarrão Espaguete",
        precovenda: 3.5,
        qtd: 40,
        dtval: "2026-01-15",
      },
      {
        id: 6,
        nome: "Leite Integral",
        precovenda: 4.8,
        qtd: 8,
        dtval: "2025-02-28",
      },
      {
        id: 7,
        nome: "Café Torrado",
        precovenda: 12.9,
        qtd: 20,
        dtval: "2025-10-30",
      },
      {
        id: 8,
        nome: "Açúcar Refinado",
        precovenda: 3.8,
        qtd: 0,
        dtval: "2025-03-15",
      },
      {
        id: 9,
        nome: "Farinha de Trigo",
        precovenda: 5.6,
        qtd: 35,
        dtval: "2025-07-22",
      },
      {
        id: 10,
        nome: "Sal Refinado",
        precovenda: 2.4,
        qtd: 50,
        dtval: null,
      },
      {
        id: 11,
        nome: "Azeite Extra Virgem",
        precovenda: 18.9,
        qtd: 12,
        dtval: "2025-09-18",
      },
      {
        id: 12,
        nome: "Vinagre de Álcool",
        precovenda: 3.2,
        qtd: 18,
        dtval: "2025-11-25",
      },
    ];
  }

  updateStatsCards() {
    const totalProducts = this.produtos.length;
    const totalValue = this.produtos.reduce(
      (sum, product) => sum + product.precovenda * product.qtd,
      0
    );
    const lowStock = this.produtos.filter((product) => product.qtd < 10).length;
    const expiringSoon = this.produtos.filter((product) => {
      if (!product.dtval) return false;
      const validityDate = new Date(product.dtval);
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      return validityDate <= thirtyDaysFromNow;
    }).length;

    const totalProductsEl = document.getElementById("totalProducts");
    const totalValueEl = document.getElementById("totalValue");
    const lowStockEl = document.getElementById("lowStock");
    const expiringSoonEl = document.getElementById("expiringSoon");

    if (totalProductsEl)
      totalProductsEl.textContent = totalProducts.toLocaleString();
    if (totalValueEl)
      totalValueEl.textContent = `R$ ${totalValue.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`;
    if (lowStockEl) lowStockEl.textContent = lowStock;
    if (expiringSoonEl) expiringSoonEl.textContent = expiringSoon;

    console.log("📊 Estatísticas atualizadas:", {
      totalProducts,
      totalValue,
      lowStock,
      expiringSoon,
    });
  }

  showFallbackCharts() {
    console.log("🎨 Mostrando gráficos HTML/CSS...");

    const fallbackCharts = document.querySelectorAll('[id$="Fallback"]');
    fallbackCharts.forEach((chart) => {
      if (chart) {
        chart.style.display = "block";
        console.log("✅ Gráfico fallback visível:", chart.id);
      }
    });
  }

  tryLoadChartJS() {
    console.log("🔄 Tentando carregar Chart.js...");

    // Verificar se Chart.js já está carregado
    if (typeof Chart !== "undefined") {
      console.log("✅ Chart.js já carregado!");
      this.createChartJSCharts();
      return;
    }

    // Tentar carregar Chart.js via CDN
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js";
    script.onload = () => {
      console.log("✅ Chart.js carregado com sucesso!");
      this.createChartJSCharts();
    };
    script.onerror = () => {
      console.log(
        "⚠️ Chart.js não pôde ser carregado, usando gráficos HTML/CSS"
      );
    };
    document.head.appendChild(script);
  }

  createChartJSCharts() {
    console.log("🎯 Criando gráficos Chart.js...");

    try {
      // Ocultar gráficos HTML/CSS e mostrar Canvas
      this.hideFallbackCharts();
      this.showCanvasCharts();

      // Criar gráficos Chart.js
      this.createPriceChart();
      this.createStockChart();
      this.createTrendChart();
      this.createTopProductsChart();
      this.createValidityChart();

      console.log("✅ Todos os gráficos Chart.js criados!");
    } catch (error) {
      console.error("❌ Erro ao criar gráficos Chart.js:", error);
      // Voltar para gráficos HTML/CSS
      this.showFallbackCharts();
    }
  }

  hideFallbackCharts() {
    const fallbackCharts = document.querySelectorAll('[id$="Fallback"]');
    fallbackCharts.forEach((chart) => {
      if (chart) chart.style.display = "none";
    });
  }

  showCanvasCharts() {
    const canvasCharts = document.querySelectorAll('canvas[id$="Canvas"]');
    canvasCharts.forEach((canvas) => {
      if (canvas) canvas.style.display = "block";
    });
  }

  createPriceChart() {
    const ctx = document.getElementById("priceChartCanvas");
    if (!ctx) return;

    const priceRanges = [
      { min: 0, max: 10, label: "R$ 0-10", count: 0 },
      { min: 10, max: 25, label: "R$ 10-25", count: 0 },
      { min: 25, max: 50, label: "R$ 25-50", count: 0 },
      { min: 50, max: 100, label: "R$ 50-100", count: 0 },
      { min: 100, max: Infinity, label: "R$ 100+", count: 0 },
    ];

    this.produtos.forEach((product) => {
      priceRanges.forEach((range) => {
        if (product.precovenda >= range.min && product.precovenda < range.max) {
          range.count++;
        }
      });
    });

    new Chart(ctx.getContext("2d"), {
      type: "bar",
      data: {
        labels: priceRanges.map((range) => range.label),
        datasets: [
          {
            label: "Quantidade de Produtos",
            data: priceRanges.map((range) => range.count),
            backgroundColor: [
              "rgba(59, 130, 246, 0.8)",
              "rgba(16, 185, 129, 0.8)",
              "rgba(245, 158, 11, 0.8)",
              "rgba(239, 68, 68, 0.8)",
              "rgba(139, 92, 246, 0.8)",
            ],
            borderColor: [
              "rgba(59, 130, 246, 1)",
              "rgba(16, 185, 129, 1)",
              "rgba(245, 158, 11, 1)",
              "rgba(239, 68, 68, 1)",
              "rgba(139, 92, 246, 1)",
            ],
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: { beginAtZero: true },
          x: { grid: { display: false } },
        },
        animation: { duration: 2000, easing: "easeInOutQuart" },
      },
    });
  }

  createStockChart() {
    const ctx = document.getElementById("stockChartCanvas");
    if (!ctx) return;

    const stockStatus = {
      "Estoque Alto": this.produtos.filter((p) => p.qtd >= 50).length,
      "Estoque Médio": this.produtos.filter((p) => p.qtd >= 10 && p.qtd < 50)
        .length,
      "Estoque Baixo": this.produtos.filter((p) => p.qtd < 10 && p.qtd > 0)
        .length,
      "Sem Estoque": this.produtos.filter((p) => p.qtd === 0).length,
    };

    new Chart(ctx.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: Object.keys(stockStatus),
        datasets: [
          {
            data: Object.values(stockStatus),
            backgroundColor: [
              "rgba(16, 185, 129, 0.8)",
              "rgba(59, 130, 246, 0.8)",
              "rgba(245, 158, 11, 0.8)",
              "rgba(239, 68, 68, 0.8)",
            ],
            borderColor: [
              "rgba(16, 185, 129, 1)",
              "rgba(59, 130, 246, 1)",
              "rgba(245, 158, 11, 1)",
              "rgba(239, 68, 68, 1)",
            ],
            borderWidth: 3,
            cutout: "60%",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" },
        },
        animation: { duration: 2000, easing: "easeInOutQuart" },
      },
    });
  }

  createTrendChart() {
    const ctx = document.getElementById("trendChartCanvas");
    if (!ctx) return;

    const days = 30;
    const trendData = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      return {
        date: date.toISOString().split("T")[0],
        value: Math.random() * 10000 + 5000,
      };
    });

    new Chart(ctx.getContext("2d"), {
      type: "line",
      data: {
        labels: trendData.map((d) => d.date),
        datasets: [
          {
            label: "Valor Total do Estoque",
            data: trendData.map((d) => d.value),
            borderColor: "rgba(59, 130, 246, 1)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "rgba(59, 130, 246, 1)",
            pointBorderColor: "white",
            pointBorderWidth: 3,
            pointRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: false },
          x: { grid: { display: false } },
        },
        animation: { duration: 2000, easing: "easeInOutQuart" },
      },
    });
  }

  createTopProductsChart() {
    const ctx = document.getElementById("topProductsChartCanvas");
    if (!ctx) return;

    const topProducts = this.produtos
      .sort((a, b) => b.precovenda * b.qtd - a.precovenda * a.qtd)
      .slice(0, 8);

    new Chart(ctx.getContext("2d"), {
      type: "bar",
      data: {
        labels: topProducts.map((p) =>
          p.nome.length > 15 ? p.nome.substring(0, 15) + "..." : p.nome
        ),
        datasets: [
          {
            label: "Valor Total (R$)",
            data: topProducts.map((p) => p.precovenda * p.qtd),
            backgroundColor: "rgba(16, 185, 129, 0.8)",
            borderColor: "rgba(16, 185, 129, 1)",
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true },
          y: { grid: { display: false } },
        },
        animation: { duration: 2000, easing: "easeInOutQuart" },
      },
    });
  }

  createValidityChart() {
    const ctx = document.getElementById("validityChartCanvas");
    if (!ctx) return;

    const validityRanges = {
      Vencidos: this.produtos.filter(
        (p) => p.dtval && new Date(p.dtval) < new Date()
      ).length,
      "Vence em 7 dias": this.produtos.filter((p) => {
        if (!p.dtval) return false;
        const validityDate = new Date(p.dtval);
        const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        return validityDate <= sevenDaysFromNow && validityDate >= new Date();
      }).length,
      "Vence em 30 dias": this.produtos.filter((p) => {
        if (!p.dtval) return false;
        const validityDate = new Date(p.dtval);
        const thirtyDaysFromNow = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        );
        return (
          validityDate <= thirtyDaysFromNow &&
          validityDate > new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        );
      }).length,
      "Vence em 90 dias": this.produtos.filter((p) => {
        if (!p.dtval) return false;
        const validityDate = new Date(p.dtval);
        const ninetyDaysFromNow = new Date(
          Date.now() + 90 * 24 * 60 * 60 * 1000
        );
        return (
          validityDate <= ninetyDaysFromNow &&
          validityDate > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        );
      }).length,
      "Vence em mais de 90 dias": this.produtos.filter((p) => {
        if (!p.dtval) return false;
        const validityDate = new Date(p.dtval);
        const ninetyDaysFromNow = new Date(
          Date.now() + 90 * 24 * 60 * 60 * 1000
        );
        return validityDate > ninetyDaysFromNow;
      }).length,
      "Sem validade": this.produtos.filter((p) => !p.dtval).length,
    };

    new Chart(ctx.getContext("2d"), {
      type: "bar",
      data: {
        labels: Object.keys(validityRanges),
        datasets: [
          {
            label: "Quantidade de Produtos",
            data: Object.values(validityRanges),
            backgroundColor: [
              "rgba(239, 68, 68, 0.8)",
              "rgba(245, 158, 11, 0.8)",
              "rgba(59, 130, 246, 0.8)",
              "rgba(16, 185, 129, 0.8)",
              "rgba(139, 92, 246, 0.8)",
              "rgba(107, 114, 128, 0.8)",
            ],
            borderColor: [
              "rgba(239, 68, 68, 1)",
              "rgba(245, 158, 11, 1)",
              "rgba(59, 130, 246, 1)",
              "rgba(16, 185, 129, 1)",
              "rgba(139, 92, 246, 1)",
              "rgba(107, 114, 128, 1)",
            ],
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true },
          x: { grid: { display: false } },
        },
        animation: { duration: 2000, easing: "easeInOutQuart" },
      },
    });
  }

  populateTable() {
    const tbody = document.getElementById("produtosTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    this.produtos.forEach((product) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${product.nome}</td>
                <td>R$ ${product.precovenda.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}</td>
                <td>${product.qtd}</td>
                <td>${
                  product.dtval
                    ? new Date(product.dtval).toLocaleDateString("pt-BR")
                    : "N/A"
                }</td>
                <td>
                    <span class="status-badge ${this.getStatusClass(product)}">
                        ${this.getStatusText(product)}
                    </span>
                </td>
            `;
      tbody.appendChild(row);
    });

    console.log("📋 Tabela populada com", this.produtos.length, "produtos");
  }

  getStatusClass(product) {
    if (product.qtd === 0) return "status-out";
    if (product.qtd < 10) return "status-low";
    if (product.dtval && new Date(product.dtval) < new Date())
      return "status-expired";
    if (product.dtval) {
      const validityDate = new Date(product.dtval);
      const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      if (validityDate <= sevenDaysFromNow) return "status-expiring";
    }
    return "status-ok";
  }

  getStatusText(product) {
    if (product.qtd === 0) return "Sem Estoque";
    if (product.qtd < 10) return "Estoque Baixo";
    if (product.dtval && new Date(product.dtval) < new Date()) return "Vencido";
    if (product.dtval) {
      const validityDate = new Date(product.dtval);
      const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      if (validityDate <= sevenDaysFromNow) return "Vencendo";
    }
    return "OK";
  }

  filterTable(searchTerm) {
    const rows = document.querySelectorAll("#produtosTableBody tr");
    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      if (text.includes(searchTerm.toLowerCase())) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  }

  sortTable(sortBy) {
    const tbody = document.getElementById("produtosTableBody");
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll("tr"));

    rows.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case "nome":
          aVal = a.cells[0].textContent;
          bVal = b.cells[0].textContent;
          return aVal.localeCompare(bVal);
        case "precovenda":
          aVal = parseFloat(
            a.cells[1].textContent.replace("R$ ", "").replace(",", ".")
          );
          bVal = parseFloat(
            b.cells[1].textContent.replace("R$ ", "").replace(",", ".")
          );
          return bVal - aVal;
        case "qtd":
          aVal = parseInt(a.cells[2].textContent);
          bVal = parseInt(b.cells[2].textContent);
          return bVal - aVal;
        case "validade":
          aVal =
            a.cells[3].textContent === "N/A"
              ? new Date("9999-12-31")
              : new Date(a.cells[3].textContent.split("/").reverse().join("-"));
          bVal =
            b.cells[3].textContent === "N/A"
              ? new Date("9999-12-31")
              : new Date(b.cells[3].textContent.split("/").reverse().join("-"));
          return aVal - bVal;
        default:
          return 0;
      }
    });

    rows.forEach((row) => tbody.appendChild(row));
  }

  async updateAllReports() {
    console.log("🔄 Atualizando todos os relatórios...");
    await this.loadData();
    this.updateStatsCards();
    this.populateTable();

    // Se Chart.js estiver disponível, recriar gráficos
    if (typeof Chart !== "undefined") {
      this.createChartJSCharts();
    }
  }

  logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    window.location.href = "/";
  }
}

// Função global para visualizar produto
function viewProduct(productId) {
  console.log("👁️ Visualizando produto:", productId);
  // Implementar visualização do produto
  alert(`Visualizando produto ID: ${productId}`);
}

// Inicializar quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 DOM carregado, iniciando ReportsManager...");
  new ReportsManager();
});
