jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Mock do console
global.console = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
};

// Configurações de timeout
jest.setTimeout(30000);

