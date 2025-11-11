const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();
const app = require('../../server');

describe('Pedidos Integration Tests', () => {
  let authToken;
  let produtoTest;
  let testUser;

  beforeAll(async () => {
    console.log('🔧 INICIANDO beforeAll DOS PEDIDOS...');
    
    try {
      // Criar um usuário de teste para o pedido
      testUser = await prisma.adms.create({
        data: {
          nome: 'User Test Pedidos',
          email: 'pedidos_test@email.com',
          senha: '$2b$10$hashed_password_placeholder',
          dtnasc: new Date('1990-01-01'),
          dtcad: new Date(),
          reset_token: null,
          reset_expires: null,
          twofa_enabled: false,
          twofa_secret: null
        }
      });
      console.log('✅ Usuário de teste criado:', testUser.id);

      console.log('🔧 Criando produto de teste...');
      produtoTest = await prisma.produtos.create({
        data: {
          nome: 'Produto Teste Pedido Jest',
          precovenda: 29.99,
          precocompra: 15.50,
          qtd: 100,
          dtval: new Date('2030-12-31'),
          ativo: true
        }
      });
      console.log('✅ Produto criado:', produtoTest.id);

      // 🚨 CORREÇÃO: Usar JWT real com userId
      authToken = jwt.sign(
        { userId: testUser.id, email: testUser.email },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '1h' }
      );
      
      console.log('✅ Token JWT gerado');
      console.log('✅ beforeAll dos PEDIDOS concluído');
    } catch (error) {
      console.log('❌ ERRO NO beforeAll DOS PEDIDOS:', error.message);
      throw error;
    }
  });

  afterAll(async () => {
    console.log('🧹 Executando cleanup dos PEDIDOS...');
    try {
      await prisma.pedidos.deleteMany({
        where: { cliente: 'Cliente Teste Jest' }
      });
      await prisma.produtos.deleteMany({
        where: { nome: 'Produto Teste Pedido Jest' }
      });
      await prisma.adms.deleteMany({
        where: { email: 'pedidos_test@email.com' }
      });
    } catch (error) {
      console.log('⚠️ Erro no cleanup dos PEDIDOS:', error.message);
    }
    
    await prisma.$disconnect();
    console.log('✅ Cleanup dos PEDIDOS concluído');
  });

  describe('POST /api/pedidos', () => {
    test('DEVE criar pedido', async () => {
      console.log('🚀 INICIANDO TESTE DE CRIAR PEDIDO...');
      
      const pedidoData = {
        cliente: 'Cliente Teste Jest',
        itens: ([
          {
            nome: 'Produto Teste Pedido Jest',
            quantidade: 2,
            preco: 29.99
          }
        ]),
        total: 59.98
      };

      const response = await request(app)
        .post('/api/pedidos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(pedidoData);

      console.log('🔍 PEDIDOS RESPONSE STATUS:', response.status);
      console.log('🔍 PEDIDOS RESPONSE BODY:', response.body);

      if (response.status !== 200 && response.status !== 201) {
        console.log('❌ ERRO PEDIDOS - Status:', response.status);
      } else {
        console.log('✅ PEDIDOS SUCESSO - Status:', response.status);
      }

      expect([200, 201]).toContain(response.status);
    });
  });
});