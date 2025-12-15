// Jest测试环境设置

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Mock file system operations
jest.mock('fs-extra');
jest.mock('path');

// Mock external dependencies
jest.mock('open');
jest.mock('express');
jest.mock('socket.io');
jest.mock('chokidar');
jest.mock('uuid');

// Global test utilities
global.createMockCliContext = () => ({
  llm: {
    generate: jest.fn().mockResolvedValue({ content: 'Test LLM response' })
  },
  tools: {
    search: { search: jest.fn().mockResolvedValue([]) },
    download: { download: jest.fn().mockResolvedValue('Downloaded content') },
    fileReader: { parse: jest.fn().mockResolvedValue({ metadata: {} }) },
    codeExecutor: { execute: jest.fn().mockResolvedValue({ success: true }) },
    calculator: { calculate: jest.fn().mockResolvedValue({ result: 42 }) }
  },
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
    debug: jest.fn()
  }
});

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});