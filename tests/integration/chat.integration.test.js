const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();
const app = require('../../server');

// Importar o service diretamente
const chatService = require('../../service/chatService');

describe('Chat Integration Tests - FLUXO REAL', () => {
  let authTokenUser1, authTokenUser2;
  let user1, user2;

  beforeAll(async () => {
    console.log('🔧 INICIANDO beforeAll DO CHAT...');
    
    try {
      console.log('🔧 Criando user1...');
      user1 = await prisma.adms.create({
        data: {
          nome: 'User Real Test Chat 1',
          email: 'chat_test1@email.com',
          senha: '$2b$10$hashed_password_placeholder',
          dtnasc: new Date('1990-01-01'),
          dtcad: new Date(),
          reset_token: null,
          reset_expires: null,
          twofa_enabled: false,
          twofa_secret: null
        }
      });
      console.log('✅ user1 criado:', user1.id);

      console.log('🔧 Criando user2...');
      user2 = await prisma.adms.create({
        data: {
          nome: 'User Real Test Chat 2', 
          email: 'chat_test2@email.com',
          senha: '$2b$10$hashed_password_placeholder',
          dtnasc: new Date('1990-01-01'),
          dtcad: new Date(),
          reset_token: null,
          reset_expires: null,
          twofa_enabled: false,
          twofa_secret: null
        }
      });
      console.log('✅ user2 criado:', user2.id);

      // Gerar tokens JWT
      authTokenUser1 = jwt.sign(
        { userId: user1.id, email: user1.email },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '1h' }
      );
      
      authTokenUser2 = jwt.sign(
        { userId: user2.id, email: user2.email },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '1h' }
      );
      
      console.log('✅ Tokens JWT gerados');
      console.log('✅ beforeAll do CHAT concluído');
    } catch (error) {
      console.log('❌ ERRO NO beforeAll DO CHAT:', error.message);
      throw error;
    }
  });

  afterAll(async () => {
    console.log('🧹 Executando cleanup do CHAT...');
    try {
      await prisma.mensagens.deleteMany({
        where: { 
          OR: [
            { sender_id: user1.id }, 
            { sender_id: user2.id }
          ] 
        }
      });
      
      await prisma.contatos.deleteMany({
        where: { 
          OR: [
            { user_id: user1.id }, 
            { user_id: user2.id }
          ] 
        }
      });
      
      await prisma.adms.deleteMany({
        where: { 
          id: { in: [user1.id, user2.id] } 
        }
      });
    } catch (error) {
      console.log('⚠️ Erro no cleanup do CHAT:', error.message);
    }
    
    await prisma.$disconnect();
    console.log('✅ Cleanup do CHAT concluído');
  });

  describe('Teste DIRETO do Service', () => {
    test('DEVE adicionar contato via SERVICE', async () => {
      console.log('🚀 TESTANDO SERVICE DIRETAMENTE...');
      
      try {
        const result = await chatService.addContactByEmail(user1.id, user2.email);
        console.log('✅ SERVICE RESULT:', result);
        expect(result).toBeDefined();
        expect(result.id).toBe(user2.id);
        expect(result.email).toBe(user2.email);
      } catch (error) {
        console.log('❌ ERRO NO SERVICE:', error.message);
        throw error;
      }
    });

    test('DEVE listar contatos via SERVICE', async () => {
      console.log('🚀 TESTANDO LISTAGEM DE CONTATOS...');
      
      try {
        const contacts = await chatService.listContacts(user1.id);
        console.log('✅ CONTACTS RESULT:', contacts);
        expect(Array.isArray(contacts)).toBe(true);
      } catch (error) {
        console.log('❌ ERRO NA LISTAGEM:', error.message);
        throw error;
      }
    });
  });

  describe('Teste HTTP das Rotas', () => {
    test('DEVE adicionar contato via HTTP', async () => {
      console.log('🚀 TESTANDO ROTA HTTP...');
      
      const response = await request(app)
        .post('/api/chat/contatos')
        .set('Authorization', `Bearer ${authTokenUser1}`)
        .send({ email: user2.email });

      console.log('🔍 HTTP RESPONSE STATUS:', response.status);
      console.log('🔍 HTTP RESPONSE BODY:', response.body);

      if (response.status !== 200 && response.status !== 201) {
        console.log('❌ ERRO HTTP - Status:', response.status);
        // Se falhar, vamos verificar o controller
        console.log('📋 Verifique se o controller está extraindo userId do req.user');
      } else {
        console.log('✅ SUCESSO HTTP - Status:', response.status);
      }

      expect([200, 201]).toContain(response.status);
    });
  });
});