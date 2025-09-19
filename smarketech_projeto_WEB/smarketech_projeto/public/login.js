class AuthManager {
    constructor() {
        this.currentForm = 'login';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkExistingAuth();
    }

    setupEventListeners() {
        // Formulário de Login
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Formulário de Cadastro
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Alternar entre formulários
        document.getElementById('showRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterForm();
        });

        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });
    }

    async handleLogin() {
        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('senha').value;

        if (!email || !senha) {
            this.showMessage('Por favor, preencha todos os campos', 'error');
            return;
        }

        try {
            this.showLoading(true);
            this.hideMessage();

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao fazer login');
            }

            // Salvar token no localStorage
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userEmail', email);

            this.showMessage('Login realizado com sucesso! Redirecionando...', 'success');
            
            setTimeout(() => {
                window.location.href = '/home.html';
            }, 1000);

        } catch (error) {
            console.error('Erro no login:', error);
            this.showMessage(error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleRegister() {
        const nome = document.getElementById('regNome').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const senha = document.getElementById('regSenha').value;
        const dtnasc = document.getElementById('regDtnasc').value;

        if (!nome || !email || !senha || !dtnasc) {
            this.showMessage('Por favor, preencha todos os campos', 'error');
        return;
    }
    
        if (senha.length < 6) {
            this.showMessage('A senha deve ter pelo menos 6 caracteres', 'error');
        return;
    }
    
        try {
            this.showLoading(true);
            this.hideMessage();

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nome, email, senha, dtnasc })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao cadastrar usuário');
            }

            // Salvar token no localStorage
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userEmail', email);

            this.showMessage('Cadastro realizado com sucesso! Redirecionando...', 'success');
            
        setTimeout(() => {
                window.location.href = '/home.html';
        }, 1000);
        
        } catch (error) {
            console.error('Erro no cadastro:', error);
            this.showMessage(error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    showLoginForm() {
        document.getElementById('loginForm').parentElement.classList.remove('hidden');
        document.getElementById('registerCard').classList.add('hidden');
        this.currentForm = 'login';
        this.hideMessage();
    }

    showRegisterForm() {
        document.getElementById('loginForm').parentElement.classList.add('hidden');
        document.getElementById('registerCard').classList.remove('hidden');
        this.currentForm = 'register';
        this.hideMessage();
    }

    showMessage(message, type) {
        const messageElement = document.getElementById(
            this.currentForm === 'login' ? 'authMessage' : 'registerMessage'
        );
        
        messageElement.textContent = message;
        messageElement.className = `auth-message ${type}`;
        messageElement.classList.remove('hidden');

        // Auto-hide após 5 segundos
    setTimeout(() => {
            this.hideMessage();
        }, 5000);
    }

    hideMessage() {
        document.getElementById('authMessage').classList.add('hidden');
        document.getElementById('registerMessage').classList.add('hidden');
    }

    showLoading(show) {
        const loginBtn = document.querySelector('#loginForm button[type="submit"]');
        const registerBtn = document.querySelector('#registerForm button[type="submit"]');
        
        if (show) {
            if (this.currentForm === 'login') {
                loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
                loginBtn.disabled = true;
            } else {
                registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cadastrando...';
                registerBtn.disabled = true;
            }
        } else {
            if (this.currentForm === 'login') {
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
                loginBtn.disabled = false;
            } else {
                registerBtn.innerHTML = '<i class="fas fa-user-plus"></i> Cadastrar';
                registerBtn.disabled = false;
            }
        }
    }

    checkExistingAuth() {
        const token = localStorage.getItem('authToken');
        if (token) {
            // Verificar se o token ainda é válido
            this.validateToken(token);
        }
    }

    async validateToken(token) {
        try {
            console.log('Validando token...');
            const response = await fetch('middleware/validation.js', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            console.log('Status da resposta:', response.status);
            
            if (response.ok) {
                window.location.href = '/home.html';
            } else {
                console.log('Token inválido!');
                localStorage.removeItem('authToken');
                localStorage.removeItem('userEmail');
            }
        } catch (error) {
            console.error('Erro ao validar token:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('userEmail');
        }
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});