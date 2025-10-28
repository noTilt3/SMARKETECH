process.env.JWT_SECRET = "fallback-secret";

// Mock do console
global.console = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Configurações de timeout
jest.setTimeout(30000);

// Cleanup after all tests
afterAll(async () => {
  // Close any open handles
  if (global.gc) {
    global.gc();
  }
});
