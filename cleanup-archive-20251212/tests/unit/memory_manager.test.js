// tests/unit/memory_manager.test.js

const MemoryManager = require('../../src/core/memory_manager');
const path = require('path');
const os = require('os');
const fs = require('fs/promises');

describe('MemoryManager', () => {
  let memoryManager;
  let tempDir;
  
  beforeEach(async () => {
    // Create a temporary directory for testing
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'stigmergy-memory-test-'));
    
    // Create a new instance of MemoryManager
    memoryManager = new MemoryManager();
    memoryManager.globalMemoryFile = path.join(tempDir, 'memory.json');
  });
  
  afterEach(async () => {
    // Clean up temporary directory
    await fs.rm(tempDir, { recursive: true, force: true });
  });
  
  describe('constructor', () => {
    test('should create a MemoryManager instance', () => {
      expect(memoryManager).toBeInstanceOf(MemoryManager);
      expect(memoryManager.globalMemoryFile).toBeDefined();
      expect(memoryManager.projectMemoryFile).toBeDefined();
    });
  });
  
  describe('getGlobalMemory', () => {
    test('should return empty memory when file does not exist', async () => {
      const memory = await memoryManager.getGlobalMemory();
      expect(memory).toEqual({
        version: '1.0.0',
        lastUpdated: expect.any(String),
        interactions: [],
        collaborations: []
      });
    });
    
    test('should return parsed memory when file exists', async () => {
      const testData = {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        interactions: [{ tool: 'claude', prompt: 'test' }],
        collaborations: []
      };
      await fs.writeFile(memoryManager.globalMemoryFile, JSON.stringify(testData));
      
      const memory = await memoryManager.getGlobalMemory();
      expect(memory).toEqual(testData);
    });
  });
});
