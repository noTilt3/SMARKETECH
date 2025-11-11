// tests/setup.js - Para testes de integração real
process.env.NODE_ENV = 'test';

// Timeout aumentado para testes de integração
jest.setTimeout(60000); // 60 segundos

// Cleanup global
afterAll(async () => {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  await prisma.$disconnect();
});