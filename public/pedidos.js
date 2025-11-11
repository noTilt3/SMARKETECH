class OrdersManager {
  constructor() {
    this.pedidos = [];
    this.filtered = [];
    this.sort = { key: "data_pedido", dir: "desc" };
    this.ordersChart = null;
    this.revenueChart = null;
  }

  async init() {
    if (!this.checkAuth()) return;
    this.bindUI();
    await this.load();
  }

  checkAuth() {
    const token = localStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/";
      return false;
    }
    return true;
  }

  bindUI() {
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userEmail");
      window.location.href = "/";
    });

    document
      .getElementById("searchBtn")
      ?.addEventListener("click", () => this.applyFilters());
    document
      .getElementById("searchInput")
      ?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.applyFilters();
      });
    document
      .getElementById("statusFilter")
      ?.addEventListener("change", () => this.applyFilters());
    document
      .getElementById("dateFrom")
      ?.addEventListener("change", () => this.applyFilters());
    document
      .getElementById("dateTo")
      ?.addEventListener("change", () => this.applyFilters());
    document
      .getElementById("refreshBtn")
      ?.addEventListener("click", async () => {
        await this.load();
      });

    const thead = document.querySelector("#ordersTable thead");
    thead?.addEventListener("click", (e) => {
      const th = e.target.closest("th");
      if (!th || !th.dataset.sort) return;
      const key = th.dataset.sort;
      if (this.sort.key === key) {
        this.sort.dir = this.sort.dir === "asc" ? "desc" : "asc";
      } else {
        this.sort.key = key;
        this.sort.dir = "asc";
      }
      this.renderTable();
    });

    document
      .getElementById("closeOrderModal")
      ?.addEventListener("click", () => {
        document.getElementById("orderModal").style.display = "none";
      });

    window.onclick = (event) => {
      const modal = document.getElementById("orderModal");
      if (event.target === modal) modal.style.display = "none";
    };
  }

  async load() {
    this.showError(false);
    this.showEmpty(false);
    try {
      // ✅ CORREÇÃO: Use a rota pública /api/pedidos/historico
      const data = await apiFetch("/api/pedidos/historico");

      // Normaliza dados - agora os itens já vêm como array
      this.pedidos = (data || []).map((p) => ({
        ...p,
        itens: Array.isArray(p.itens) ? p.itens : [],
        data_pedido: p.data_pedido ? new Date(p.data_pedido) : null,
      }));

      this.applyFilters();
    } catch (err) {
      console.error("Erro ao carregar pedidos", err);
      this.showError(true, err.message || "Erro ao carregar pedidos");
    }
  }

  applyFilters() {
    const q = (document.getElementById("searchInput")?.value || "")
      .trim()
      .toLowerCase();
    const status = document.getElementById("statusFilter")?.value || "";
    const dFrom = document.getElementById("dateFrom")?.value || "";
    const dTo = document.getElementById("dateTo")?.value || "";

    let list = [...this.pedidos];

    if (q) {
      list = list.filter((p) => {
        const inCliente = (p.cliente || "").toLowerCase().includes(q);
        const inItens = (p.itens || []).some((i) =>
          (i.nome || "").toLowerCase().includes(q)
        );
        const inItensTexto = (p.itens_texto || "").toLowerCase().includes(q);
        return inCliente || inItens || inItensTexto;
      });
    }

    if (status)
      list = list.filter((p) => (p.status || "").toLowerCase() === status);

    if (dFrom) {
      const from = new Date(dFrom);
      list = list.filter((p) => !p.data_pedido || p.data_pedido >= from);
    }
    if (dTo) {
      const to = new Date(dTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter((p) => !p.data_pedido || p.data_pedido <= to);
    }

    this.filtered = list;
    this.updateKPIs();
    this.updateCharts();
    this.renderTable();
    document.getElementById("ordersCount").textContent = `${
      this.filtered.length
    } pedido${this.filtered.length !== 1 ? "s" : ""}`;
    this.showEmpty(this.filtered.length === 0);
  }

  renderTable() {
    const tbody = document.querySelector("#ordersTable tbody");
    tbody.innerHTML = "";

    const arr = [...this.filtered].sort((a, b) =>
      this.compare(a, b, this.sort.key, this.sort.dir)
    );

    arr.forEach((p) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.id}</td>
        <td>${p.data_pedido ? p.data_pedido.toLocaleString("pt-BR") : "-"}</td>
        <td>${this.escape(p.cliente || "")}</td>
        <td>${this.statusBadge(p.status)}</td>
        <td>R$ ${(Number(p.total) || 0).toFixed(2)}</td>
        <td>${this.renderItensTags(p.itens)}</td>
      `;
      tr.style.cursor = "pointer";
      tr.addEventListener("click", () => this.openOrderModal(p));
      tbody.appendChild(tr);
    });
  }

  updateKPIs() {
    const orders = this.filtered.length;
    const revenue = this.filtered.reduce(
      (sum, p) => sum + (Number(p.total) || 0),
      0
    );
    let items = 0;
    this.filtered.forEach(
      (p) =>
        (items += (p.itens || []).reduce(
          (s, i) => s + (Number(i.quantidade) || 0),
          0
        ))
    );
    const avg = orders ? revenue / orders : 0;

    document.getElementById("kpiOrders").textContent = `${orders}`;
    document.getElementById("kpiRevenue").textContent = `R$ ${revenue.toFixed(
      2
    )}`;
    document.getElementById("kpiAvgTicket").textContent = `R$ ${avg.toFixed(
      2
    )}`;
    document.getElementById("kpiItems").textContent = `${items}`;
  }

  updateCharts() {
    const byDay = {};
    this.filtered.forEach((p) => {
      const day = p.data_pedido
        ? p.data_pedido.toISOString().slice(0, 10)
        : "Sem data";
      if (!byDay[day]) byDay[day] = { count: 0, revenue: 0 };
      byDay[day].count += 1;
      byDay[day].revenue += Number(p.total) || 0;
    });

    const labels = Object.keys(byDay).sort();
    const counts = labels.map((d) => byDay[d].count);
    const revenues = labels.map((d) => byDay[d].revenue);

    const ordersCtx = document.getElementById("ordersChart");
    const revenueCtx = document.getElementById("revenueChart");

    if (this.ordersChart) this.ordersChart.destroy();
    if (this.revenueChart) this.revenueChart.destroy();

    this.ordersChart = new Chart(ordersCtx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Pedidos",
            data: counts,
            borderColor: "#1d4ed8",
            backgroundColor: "rgba(29,78,216,.15)",
            fill: true,
            tension: 0.35,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
      },
    });

    this.revenueChart = new Chart(revenueCtx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Faturamento (R$)",
            data: revenues,
            backgroundColor: "#10b981",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
      },
    });
  }

  openOrderModal(p) {
    const modal = document.getElementById("orderModal");
    const details = document.getElementById("orderDetails");

    // ✅ AGORA os itens já vêm como array formatado
    const itens = (p.itens || [])
      .map(
        (i) =>
          `<span class="item-tag">${this.escape(i.nome)} × ${
            i.quantidade
          } • R$ ${(Number(i.preco) || 0).toFixed(2)}</span>`
      )
      .join(" ");

    details.innerHTML = `
      <div style="display:grid; gap:1rem;">
        <div style="display:grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap:1rem;">
          <div><strong>Pedido #</strong><div>${p.id}</div></div>
          <div><strong>Data</strong><div>${
            p.data_pedido ? p.data_pedido.toLocaleString("pt-BR") : "-"
          }</div></div>
        </div>
        <div style="display:grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap:1rem;">
          <div><strong>Cliente</strong><div>${this.escape(
            p.cliente || ""
          )}</div></div>
          <div><strong>Status</strong><div>${this.statusBadge(
            p.status
          )}</div></div>
        </div>
        <div>
          <strong>Itens</strong>
          <div class="item-tags" style="margin-top:.5rem;">${
            itens || '<span class="item-tag">Sem itens</span>'
          }</div>
        </div>
        <div style="display:flex; justify-content:flex-end; font-weight:800; color:#065f46;">Total: R$ ${(
          Number(p.total) || 0
        ).toFixed(2)}</div>
      </div>
    `;
    modal.style.display = "block";
  }

  statusBadge(status) {
    const s = (status || "").toLowerCase();
    const map = {
      pendente: "status-pendente",
      preparando: "status-preparando",
      pronto: "status-pronto",
      entregue: "status-entregue",
    };
    const cls = map[s] || "status-pendente";
    const icon =
      {
        pendente: "clock",
        preparando: "utensils",
        pronto: "check",
        entregue: "bag-shopping",
      }[s] || "clock";
    return `<span class="status-badge ${cls}"><i class="fas fa-${icon}"></i>${
      s || "pendente"
    }</span>`;
  }

  renderItensTags(itens) {
    if (!Array.isArray(itens) || itens.length === 0)
      return '<span class="item-tag">-</span>';
    return `<div class="item-tags">${itens
      .map(
        (i) =>
          `<span class=\"item-tag\">${this.escape(i.nome)} × ${
            i.quantidade
          }</span>`
      )
      .join("")}</div>`;
  }

  compare(a, b, key, dir) {
    const va = this.getVal(a, key);
    const vb = this.getVal(b, key);
    const comp = va > vb ? 1 : va < vb ? -1 : 0;
    return dir === "asc" ? comp : -comp;
  }

  getVal(obj, key) {
    const v = obj[key];
    if (v instanceof Date) return v.getTime();
    if (key === "total") return Number(v) || 0;
    if (typeof v === "string") return v.toLowerCase();
    return v;
  }

  escape(str) {
    const div = document.createElement("div");
    div.textContent = String(str);
    return div.innerHTML;
  }

  safeParseJSON(s) {
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  }

  showError(show, message = "Erro ao carregar") {
    const box = document.getElementById("errorMessage");
    if (!box) return;
    if (show) {
      box.querySelector("p").textContent = message;
      box.classList.remove("hidden");
    } else {
      box.classList.add("hidden");
    }
  }

  showEmpty(show) {
    const box = document.getElementById("noOrders");
    if (!box) return;
    box.classList.toggle("hidden", !show);
  }
}

// Bootstrap
document.addEventListener("DOMContentLoaded", () => {
  const mgr = new OrdersManager();
  mgr.init();
});
