// tests/unit/smart_router.test.js

const SmartRouter = require('../../src/core/smart_router');
const CLIHelpAnalyzer = require('../../src/core/cli_help_analyzer');
const path = require('path');
const os = require('os');
const fs = require('fs/promises');

describe('SmartRouter', () => {
  let router;
  let tempDir;
  
  beforeEach(async () => {
    // Create a temporary directory for testing
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'stigmergy-router-test-'));
    
    router = new SmartRouter();
    
    // Mock the CLI tools for testing
    router.tools = {
      claude: { name: 'Claude CLI' },
      qwen: { name: 'Qwen CLI' },
      gemini: { name: 'Gemini CLI' },
      iflow: { name: 'iFlow CLI' }
    };
  });
  
  afterEach(async () => {
    // Clean up temporary directory
    await fs.rm(tempDir, { recursive: true, force: true });
  });
  
  describe('constructor', () => {
    test('should create a SmartRouter instance', () => {
      expect(router).toBeInstanceOf(SmartRouter);
      expect(router.tools).toBeDefined();
      expect(router.defaultTool).toBe('claude');
    });
  });
  
  describe('extractKeywords', () => {
    test('should extract correct keywords for claude', () => {
      const keywords = router.extractKeywords('claude');
      expect(keywords).toContain('claude');
      expect(keywords).toContain('anthropic');
    });
    
    test('should extract correct keywords for qwen', () => {
      const keywords = router.extractKeywords('qwen');
      expect(keywords).toContain('qwen');
      expect(keywords).toContain('alibaba');
      expect(keywords).toContain('tongyi');
    });
    
    test('should extract correct keywords for gemini', () => {
      const keywords = router.extractKeywords('gemini');
      expect(keywords).toContain('gemini');
      expect(keywords).toContain('google');
    });
    
    test('should return tool name as keyword when not found in mapping', () => {
      const keywords = router.extractKeywords('unknown-tool');
      expect(keywords).toEqual(['unknown-tool']);
    });
  });
  
  describe('smartRoute', () => {
    test('should route to claude when claude keyword is detected', async () => {
      const result = await router.smartRoute('用claude分析这段代码');
      expect(result.tool).toBe('claude');
      expect(result.prompt).toBe('分析这段代码');
    });
    
    test('should route to qwen when qwen keyword is detected', async () => {
      const result = await router.smartRoute('用qwen写一个hello world程序');
      expect(result.tool).toBe('qwen');
      expect(result.prompt).toBe('写一个hello world程序');
    });
    
    test('should route to gemini when gemini keyword is detected', async () => {
      const result = await router.smartRoute('用gemini分析数据');
      expect(result.tool).toBe('gemini');
      expect(result.prompt).toBe('分析数据');
    });
    
    test('should route to default tool when no keyword is detected', async () => {
      const result = await router.smartRoute('分析项目架构');
      expect(result.tool).toBe('claude');
      expect(result.prompt).toBe('分析项目架构');
    });
    
    test('should handle complex input with multiple keywords', async () => {
      const result = await router.smartRoute('请用qwen生成一个python的web应用');
      expect(result.tool).toBe('qwen');
      expect(result.prompt).toBe('生成一个python的web应用');
    });
    
    test('should handle input with tool name at the end', async () => {
      const result = await router.smartRoute('帮我用claude');
      expect(result.tool).toBe('claude');
      // When there's no content after the tool name, the prompt should be empty
      expect(result.prompt).toBe('');
    });
  });
});