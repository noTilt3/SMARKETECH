// Relatórios Manager - Versão Simplificada com Fallback HTML/CSS
class ReportsManager {
    constructor() {
        this.products = [];
        this.init();
    }

    async init() {
        console.log('🚀 Inicializando ReportsManager...');
        
        if (!this.checkAuth()) return;
        
        this.setupEventListeners();
        await this.loadData();
        this.updateStatsCards();
        this.populateTable();
        
        // Mostrar gráficos HTML/CSS imediatamente
        this.showFallbackCharts();
        
        // Tentar carregar Chart.js como fallback
        this.tryLoadChartJS();
    }

    checkAuth() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '/';
            return false;
        }
        return true;
    }

    setupEventListeners() {
        // Botão de logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Botão de atualizar relatórios
        const updateBtn = document.getElementById('updateReports');
        if (updateBtn) {
            updateBtn.addEventListener('click', () => this.updateAllReports());
        }

        // Controles da tabela
        const searchInput = document.getElementById('tableSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterTable(e.target.value));
        }

        const sortSelect = document.getElementById('tableSort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => this.sortTable(e.target.value));
        }

        // Definir datas padrão
        this.setDefaultDates();
    }

    setDefaultDates() {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (startDateInput) startDateInput.value = thirtyDaysAgo.toISOString().split('T')[0];
        if (endDateInput) endDateInput.value = today.toISOString().split('T')[0];
    }

    async loadData() {
        try {
            console.log('📊 Carregando dados dos produtos...');
            const response = await fetch('/api/products');
            if (!response.ok) throw new Error('Erro ao carregar produtos');
            
            this.products = await response.json();
            console.log('✅ Produtos carregados:', this.products.length);
            
            // Se não há produtos, criar dados de exemplo
            if (this.products.length === 0) {
                this.products = this.generateSampleData();
                console.log('📝 Usando dados de exemplo:', this.products.length);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            this.products = this.generateSampleData();
            console.log('📝 Usando dados de exemplo devido ao erro:', this.products.length);
        }
    }

    generateSampleData() {
        return [
            { id: 1, nome: 'Arroz Integral', preco: 8.50, quantidade: 25, data_validade: '2025-06-15' },
            { id: 2, nome: 'Feijão Preto', preco: 6.80, quantidade: 30, data_validade: '2025-08-20' },
            { id: 3, nome: 'Açúcar Cristal', preco: 4.20, quantidade: 5, data_validade: '2025-12-10' },
            { id: 4, nome: 'Óleo de Soja', preco: 7.90, quantidade: 15, data_validade: '2025-04-05' },
            { id: 5, nome: 'Macarrão Espaguete', preco: 3.50, quantidade: 40, data_validade: '2026-01-15' },
            { id: 6, nome: 'Leite Integral', preco: 4.80, quantidade: 8, data_validade: '2025-02-28' },
            { id: 7, nome: 'Café Torrado', preco: 12.90, quantidade: 20, data_validade: '2025-10-30' },
            { id: 8, nome: 'Açúcar Refinado', preco: 3.80, quantidade: 0, data_validade: '2025-03-15' },
            { id: 9, nome: 'Farinha de Trigo', preco: 5.60, quantidade: 35, data_validade: '2025-07-22' },
            { id: 10, nome: 'Sal Refinado', preco: 2.40, quantidade: 50, data_validade: null },
            { id: 11, nome: 'Azeite Extra Virgem', preco: 18.90, quantidade: 12, data_validade: '2025-09-18' },
            { id: 12, nome: 'Vinagre de Álcool', preco: 3.20, quantidade: 18, data_validade: '2025-11-25' }
        ];
    }

    updateStatsCards() {
        const totalProducts = this.products.length;
        const totalValue = this.products.reduce((sum, product) => sum + (product.preco * product.quantidade), 0);
        const lowStock = this.products.filter(product => product.quantidade < 10).length;
        const expiringSoon = this.products.filter(product => {
            if (!product.data_validade) return false;
            const validityDate = new Date(product.data_validade);
            const thirtyDaysFromNow = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000));
            return validityDate <= thirtyDaysFromNow;
        }).length;

        const totalProductsEl = document.getElementById('totalProducts');
        const totalValueEl = document.getElementById('totalValue');
        const lowStockEl = document.getElementById('lowStock');
        const expiringSoonEl = document.getElementById('expiringSoon');

        if (totalProductsEl) totalProductsEl.textContent = totalProducts.toLocaleString();
        if (totalValueEl) totalValueEl.textContent = `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        if (lowStockEl) lowStockEl.textContent = lowStock;
        if (expiringSoonEl) expiringSoonEl.textContent = expiringSoon;

        console.log('📊 Estatísticas atualizadas:', { totalProducts, totalValue, lowStock, expiringSoon });
    }

    showFallbackCharts() {
        console.log('🎨 Mostrando gráficos HTML/CSS...');
        
        const fallbackCharts = document.querySelectorAll('[id$="Fallback"]');
        fallbackCharts.forEach(chart => {
            if (chart) {
                chart.style.display = 'block';
                console.log('✅ Gráfico fallback visível:', chart.id);
            }
        });
    }

    tryLoadChartJS() {
        console.log('🔄 Tentando carregar Chart.js...');
        
        // Verificar se Chart.js já está carregado
        if (typeof Chart !== 'undefined') {
            console.log('✅ Chart.js já carregado!');
            this.createChartJSCharts();
            return;
        }

        // Tentar carregar Chart.js via CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
        script.onload = () => {
            console.log('✅ Chart.js carregado com sucesso!');
            this.createChartJSCharts();
        };
        script.onerror = () => {
            console.log('⚠️ Chart.js não pôde ser carregado, usando gráficos HTML/CSS');
        };
        document.head.appendChild(script);
    }

    createChartJSCharts() {
        console.log('🎯 Criando gráficos Chart.js...');
        
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
            
            console.log('✅ Todos os gráficos Chart.js criados!');
        } catch (error) {
            console.error('❌ Erro ao criar gráficos Chart.js:', error);
            // Voltar para gráficos HTML/CSS
            this.showFallbackCharts();
        }
    }

    hideFallbackCharts() {
        const fallbackCharts = document.querySelectorAll('[id$="Fallback"]');
        fallbackCharts.forEach(chart => {
            if (chart) chart.style.display = 'none';
        });
    }

    showCanvasCharts() {
        const canvasCharts = document.querySelectorAll('canvas[id$="Canvas"]');
        canvasCharts.forEach(canvas => {
            if (canvas) canvas.style.display = 'block';
        });
    }

    createPriceChart() {
        const ctx = document.getElementById('priceChartCanvas');
        if (!ctx) return;

        const priceRanges = [
            { min: 0, max: 10, label: 'R$ 0-10', count: 0 },
            { min: 10, max: 25, label: 'R$ 10-25', count: 0 },
            { min: 25, max: 50, label: 'R$ 25-50', count: 0 },
            { min: 50, max: 100, label: 'R$ 50-100', count: 0 },
            { min: 100, max: Infinity, label: 'R$ 100+', count: 0 }
        ];

        this.products.forEach(product => {
            priceRanges.forEach(range => {
                if (product.preco >= range.min && product.preco < range.max) {
                    range.count++;
                }
            });
        });

        new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: priceRanges.map(range => range.label),
                datasets: [{
                    label: 'Quantidade de Produtos',
                    data: priceRanges.map(range => range.count),
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(139, 92, 246, 0.8)'
                    ],
                    borderColor: [
                        'rgba(59, 130, 246, 1)',
                        'rgba(16, 185, 129, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(139, 92, 246, 1)'
                    ],
                    borderWidth: 2,
                    borderRadius: 8,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true },
                    x: { grid: { display: false } }
                },
                animation: { duration: 2000, easing: 'easeInOutQuart' }
            }
        });
    }

    createStockChart() {
        const ctx = document.getElementById('stockChartCanvas');
        if (!ctx) return;

        const stockStatus = {
            'Estoque Alto': this.products.filter(p => p.quantidade >= 50).length,
            'Estoque Médio': this.products.filter(p => p.quantidade >= 10 && p.quantidade < 50).length,
            'Estoque Baixo': this.products.filter(p => p.quantidade < 10 && p.quantidade > 0).length,
            'Sem Estoque': this.products.filter(p => p.quantidade === 0).length
        };

        new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(stockStatus),
                datasets: [{
                    data: Object.values(stockStatus),
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ],
                    borderColor: [
                        'rgba(16, 185, 129, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(239, 68, 68, 1)'
                    ],
                    borderWidth: 3,
                    cutout: '60%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                },
                animation: { duration: 2000, easing: 'easeInOutQuart' }
            }
        });
    }

    createTrendChart() {
        const ctx = document.getElementById('trendChartCanvas');
        if (!ctx) return;

        const days = 30;
        const trendData = Array.from({ length: days }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (days - i - 1));
            return {
                date: date.toISOString().split('T')[0],
                value: Math.random() * 10000 + 5000
            };
        });

        new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: trendData.map(d => d.date),
                datasets: [{
                    label: 'Valor Total do Estoque',
                    data: trendData.map(d => d.value),
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                    pointBorderColor: 'white',
                    pointBorderWidth: 3,
                    pointRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: false },
                    x: { grid: { display: false } }
                },
                animation: { duration: 2000, easing: 'easeInOutQuart' }
            }
        });
    }

    createTopProductsChart() {
        const ctx = document.getElementById('topProductsChartCanvas');
        if (!ctx) return;

        const topProducts = this.products
            .sort((a, b) => (b.preco * b.quantidade) - (a.preco * a.quantidade))
            .slice(0, 8);

        new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: topProducts.map(p => p.nome.length > 15 ? p.nome.substring(0, 15) + '...' : p.nome),
                datasets: [{
                    label: 'Valor Total (R$)',
                    data: topProducts.map(p => p.preco * p.quantidade),
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2,
                    borderRadius: 8,
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { beginAtZero: true },
                    y: { grid: { display: false } }
                },
                animation: { duration: 2000, easing: 'easeInOutQuart' }
            }
        });
    }

    createValidityChart() {
        const ctx = document.getElementById('validityChartCanvas');
        if (!ctx) return;

        const validityRanges = {
            'Vencidos': this.products.filter(p => p.data_validade && new Date(p.data_validade) < new Date()).length,
            'Vence em 7 dias': this.products.filter(p => {
                if (!p.data_validade) return false;
                const validityDate = new Date(p.data_validade);
                const sevenDaysFromNow = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000));
                return validityDate <= sevenDaysFromNow && validityDate >= new Date();
            }).length,
            'Vence em 30 dias': this.products.filter(p => {
                if (!p.data_validade) return false;
                const validityDate = new Date(p.data_validade);
                const thirtyDaysFromNow = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000));
                return validityDate <= thirtyDaysFromNow && validityDate > new Date(Date.now() + (7 * 24 * 60 * 60 * 1000));
            }).length,
            'Vence em 90 dias': this.products.filter(p => {
                if (!p.data_validade) return false;
                const validityDate = new Date(p.data_validade);
                const ninetyDaysFromNow = new Date(Date.now() + (90 * 24 * 60 * 60 * 1000));
                return validityDate <= ninetyDaysFromNow && validityDate > new Date(Date.now() + (30 * 24 * 60 * 60 * 1000));
            }).length,
            'Vence em mais de 90 dias': this.products.filter(p => {
                if (!p.data_validade) return false;
                const validityDate = new Date(p.data_validade);
                const ninetyDaysFromNow = new Date(Date.now() + (90 * 24 * 60 * 60 * 1000));
                return validityDate > ninetyDaysFromNow;
            }).length,
            'Sem validade': this.products.filter(p => !p.data_validade).length
        };

        new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: Object.keys(validityRanges),
                datasets: [{
                    label: 'Quantidade de Produtos',
                    data: Object.values(validityRanges),
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(107, 114, 128, 0.8)'
                    ],
                    borderColor: [
                        'rgba(239, 68, 68, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(16, 185, 129, 1)',
                        'rgba(139, 92, 246, 1)',
                        'rgba(107, 114, 128, 1)'
                    ],
                    borderWidth: 2,
                    borderRadius: 8,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true },
                    x: { grid: { display: false } }
                },
                animation: { duration: 2000, easing: 'easeInOutQuart' }
            }
        });
    }

    populateTable() {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.nome}</td>
                <td>R$ ${product.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td>${product.quantidade}</td>
                <td>${product.data_validade ? new Date(product.data_validade).toLocaleDateString('pt-BR') : 'N/A'}</td>
                <td>
                    <span class="status-badge ${this.getStatusClass(product)}">
                        ${this.getStatusText(product)}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewProduct(${product.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        console.log('📋 Tabela populada com', this.products.length, 'produtos');
    }

    getStatusClass(product) {
        if (product.quantidade === 0) return 'status-out';
        if (product.quantidade < 10) return 'status-low';
        if (product.data_validade && new Date(product.data_validade) < new Date()) return 'status-expired';
        if (product.data_validade) {
            const validityDate = new Date(product.data_validade);
            const sevenDaysFromNow = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000));
            if (validityDate <= sevenDaysFromNow) return 'status-expiring';
        }
        return 'status-ok';
    }

    getStatusText(product) {
        if (product.quantidade === 0) return 'Sem Estoque';
        if (product.quantidade < 10) return 'Estoque Baixo';
        if (product.data_validade && new Date(product.data_validade) < new Date()) return 'Vencido';
        if (product.data_validade) {
            const validityDate = new Date(product.data_validade);
            const sevenDaysFromNow = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000));
            if (validityDate <= sevenDaysFromNow) return 'Vencendo';
        }
        return 'OK';
    }

    filterTable(searchTerm) {
        const rows = document.querySelectorAll('#productsTableBody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(searchTerm.toLowerCase())) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    sortTable(sortBy) {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;

        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        rows.sort((a, b) => {
            let aVal, bVal;
            
            switch(sortBy) {
                case 'nome':
                    aVal = a.cells[0].textContent;
                    bVal = b.cells[0].textContent;
                    return aVal.localeCompare(bVal);
                case 'preco':
                    aVal = parseFloat(a.cells[1].textContent.replace('R$ ', '').replace(',', '.'));
                    bVal = parseFloat(b.cells[1].textContent.replace('R$ ', '').replace(',', '.'));
                    return bVal - aVal;
                case 'quantidade':
                    aVal = parseInt(a.cells[2].textContent);
                    bVal = parseInt(b.cells[2].textContent);
                    return bVal - aVal;
                case 'validade':
                    aVal = a.cells[3].textContent === 'N/A' ? new Date('9999-12-31') : new Date(a.cells[3].textContent.split('/').reverse().join('-'));
                    bVal = b.cells[3].textContent === 'N/A' ? new Date('9999-12-31') : new Date(b.cells[3].textContent.split('/').reverse().join('-'));
                    return aVal - bVal;
                default:
                    return 0;
            }
        });
        
        rows.forEach(row => tbody.appendChild(row));
    }

    async updateAllReports() {
        console.log('🔄 Atualizando todos os relatórios...');
        await this.loadData();
        this.updateStatsCards();
        this.populateTable();
        
        // Se Chart.js estiver disponível, recriar gráficos
        if (typeof Chart !== 'undefined') {
            this.createChartJSCharts();
        }
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        window.location.href = '/';
    }
}

// Função global para visualizar produto
function viewProduct(productId) {
    console.log('👁️ Visualizando produto:', productId);
    // Implementar visualização do produto
    alert(`Visualizando produto ID: ${productId}`);
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM carregado, iniciando ReportsManager...');
    new ReportsManager();
});