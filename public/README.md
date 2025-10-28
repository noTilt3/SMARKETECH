# 🛍️ Smarketech

## 📌 Nome da Instituição
**ETEC Lauro Gomes**

## 👥 Integrantes da Equipe
- Cauã Nascimento de Souza  
- Enzo Gimenes Brummund  
- Ettore César de Melo Faria

## 📖 Descrição do Projeto
O **Smarketech** é um modelo inovador de **mercado autônomo** que soluciona dois grandes problemas dos supermercados convencionais:  
- A falta de acessibilidade (com deslocamento por corredores extensos, dificuldade em alcançar prateleiras e obstáculos físicos) e  
- as longas filas (com tempo perdido aguardando atendimento em caixas).

A solução implementada elimina a necessidade de locomoção excessiva dentro do mercado através de totens interativos onde os clientes  
realizam pedidos sem precisar buscar produtos manualmente, e reduz drasticamente o tempo em filas mediante um sistema automatizado de  
prateleiras e esteiras inteligentes que entregam os produtos rapidamente até o ponto de coleta.

Este projeto corresponde ao **painel administrativo** para os gestores das unidades Smarketech, permitindo  
- Visualizar estoque de produtos  
- Monitorar quantidades críticas  
- Pesquisar produtos  
- Acompanhar lucros e movimentações

O sistema foi desenvolvido inicialmente como uma aplicação desktop e agora está disponível em **versão web**, alinhando acessibilidade,  
eficiência e praticidade para melhorar a experiência de compra para todos os consumidores.

---

### 🔗 Integração com Sistema Completo
Este website faz parte do **ecossistema Smarketech**, integrando-se com:

- 📱 **Aplicativo Mobile**, que representa a interface do totem

- 🤖 **Sistema ESP32** que controla a maquete física com esteiras automatizadas

- 🗄️ **Banco de dados** compartilhado para sincronização em tempo real

---

## 🛠️ Tecnologias Utilizadas 
Esta seção contempla as linguagens de programação, frameworks e outras ferramentas cruciais para o desenvolvimento deste projeto.

---

### 🔧 Backend
- **Node.js** (>= 16)  
- **Express.js** – framework web  
- **PostgreSQL (Supabase)** – banco de dados  
- **dotenv** – variáveis de ambiente  
- **pg** – integração com PostgreSQL  
- **JWT (jsonwebtoken)** – autenticação  
- **bcryptjs** – criptografia de senhas  
- **helmet** – segurança de cabeçalhos HTTP
- **cors** – controle de acessos externos  

---

### 🎨 Frontend
- **HTML5** – estrutura da interface  
- **CSS3** – estilização responsiva, com foco em usabilidade e design moderno  
- **JavaScript (puro)** – integração com a API, manipulação do DOM e atualização dinâmica dos produtos em tela

---

## ⚙️ Setup do Projeto (Ambiente Local)

Esta seção é destinada a quem deseja **executar o projeto localmente** para testes e avaliação.

---

### 📌 Pré-requisitos
- **Node.js** v16 ou superior instalado

---

### 🔧 Instalação

Os comandos abaixo devem ser executados em um **terminal** (Prompt de Comando ou PowerShell no Windows, ou o Terminal no Linux/macOS).  
Certifique-se de que o **Node.js** já está instalado antes de prosseguir.

```bash
# 1. Clonar o repositório para sua máquina
git clone https://github.com/meu-repositorio/smarketech-admin.git

# 2. Acessar a pasta do projeto
cd smarketech-admin

# 3. Instalar as dependências do projeto
npm install

```
---

## 📚 Documentação da API com Swagger

Este projeto utiliza **Swagger (OpenAPI 3.0)** para documentar e testar interativamente as rotas da API.  
A documentação é gerada automaticamente a partir das anotações no código-fonte.

---

### ✅ Recursos disponíveis
Na interface do Swagger é possível:
- Visualizar todas as rotas da API organizadas por categorias (ex: Produtos).  
- Conferir os parâmetros esperados, exemplos de requisições e respostas.  
- Testar as rotas diretamente no navegador usando o botão **"Try it out"**.  
- Obter os diferentes códigos de resposta (`200`, `400`, `401`, `404`, `500`).  

---

### 🧾 Endpoints documentados
- `GET /api/products` → Lista todos os produtos.  
- `GET /api/products/search?q=termo` → Pesquisa produtos por nome.  
- `GET /api/products/{id}` → Retorna um produto específico (requer autenticação JWT).  

---

### ▶️ Como acessar
Após iniciar o servidor localmente, acesse no navegador:
http://localhost:3000/api-docs

---

## 🧪 Testes com Jest

O projeto utiliza **Jest** como framework de testes para garantir a qualidade e confiabilidade do código. Foram implementados testes unitários e de integração para validar as funcionalidades críticas do sistema.

---

### 📋 Estrutura de Testes

tests/
    ├── unit/
    │ ├── middleware/
    │ │ ├── auth.unit.test.js
    │ │ └── validation.unit.test.js
    │ ├── controllers/
    │ │ └── controllerProdutos.unit.test.js
    │ └── models/
    │ └── Produto.unit.test.js
    ├── integration/
    │ ├── auth.integration.test.js
    │ └── products.integration.test.js
    ├── mocks/
    │ └── database.mock.js
    └── setup.js

---
    
### 🪛 Tipos de Testes Implementados

- **Testes Unitários**: Validam funções individuais dos middlewares, controllers e models  
- **Testes de Integração**: Verificam a integração entre diferentes componentes e rotas da API  
- **Mocks**: Simulam dependências externas como banco de dados e autenticação JWT

---

### 📊 Cobertura de Testes

Os testes cobrem:

- Validação de dados de entrada  
- Autenticação JWT e geração de tokens  
- Controladores de produtos (CRUD operations)  
- Integração com rotas da API  
- Manipulação de erros e respostas HTTP

### 🚀 Executando os Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo verbose
npm test -- --verbose

# Executar testes em série (para evitar conflitos de porta)
npm test -- --runInBand

# Executar todos os testes de integração
npm test -- tests/integration/

# Executar todos os testes unitários
npm test -- tests/unit/

# Executar todos os testes de middleware
npm test -- tests/unit/middleware/

# Executar todos os testes de controllers
npm test -- tests/unit/controllers/

# Executar todos os testes de models
npm test -- tests/unit/models/

# Executar com detecção de handles abertos
npm test -- --detectOpenHandles
```