// tests/unit/cli_help_analyzer.test.js

const CLIHelpAnalyzer = require('../../src/core/cli_help_analyzer');
const path = require('path');
const os = require('os');
const fs = require('fs/promises');

describe('CLIHelpAnalyzer', () => {
  let analyzer;
  let tempDir;
  
  beforeEach(async () => {
    // Create a temporary directory for testing
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'stigmergy-analyzer-test-'));
    
    analyzer = new CLIHelpAnalyzer();
    analyzer.configDir = tempDir;
    analyzer.persistentConfig = path.join(tempDir, 'cli-patterns.json');
    
    // Mock the CLI tools for testing
    analyzer.cliTools = {
      claude: { name: 'Claude CLI', version: 'claude --version' },
      qwen: { name: 'Qwen CLI', version: 'qwen --version' }
    };
  });
  
  afterEach(async () => {
    // Clean up temporary directory
    await fs.rm(tempDir, { recursive: true, force: true });
  });
  
  describe('constructor', () => {
    test('should create a CLIHelpAnalyzer instance', () => {
      expect(analyzer).toBeInstanceOf(CLIHelpAnalyzer);
      expect(analyzer.configDir).toBeDefined();
      expect(analyzer.persistentConfig).toBeDefined();
      expect(analyzer.cliTools).toBeDefined();
    });
  });
  
  describe('initialize', () => {
    test('should create config directory and initialize config file', async () => {
      await analyzer.initialize();
      
      const configExists = await fs.access(analyzer.persistentConfig).then(() => true).catch(() => false);
      expect(configExists).toBe(true);
      
      const config = JSON.parse(await fs.readFile(analyzer.persistentConfig, 'utf8'));
      expect(config.version).toBe('1.0.0');
      expect(config.cliPatterns).toEqual({});
    });
  });
  
  describe('isCacheExpired', () => {
    test('should return true for expired cache (more than 24 hours)', () => {
      const oldTimestamp = new Date(Date.now() - (25 * 60 * 60 * 1000)).toISOString();
      expect(analyzer.isCacheExpired(oldTimestamp)).toBe(true);
    });
    
    test('should return false for fresh cache (less than 24 hours)', () => {
      const freshTimestamp = new Date(Date.now() - (23 * 60 * 60 * 1000)).toISOString();
      expect(analyzer.isCacheExpired(freshTimestamp)).toBe(false);
    });
  });
  
  describe('fileExists', () => {
    test('should return true for existing file', async () => {
      const testFile = path.join(tempDir, 'test-file.txt');
      await fs.writeFile(testFile, 'test content');
      
      const exists = await analyzer.fileExists(testFile);
      expect(exists).toBe(true);
    });
    
    test('should return false for non-existing file', async () => {
      const nonExistingFile = path.join(tempDir, 'non-existing-file.txt');
      
      const exists = await analyzer.fileExists(nonExistingFile);
      expect(exists).toBe(false);
    });
  });
});
