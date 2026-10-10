# Stigmergy CLI 测试驱动开发实施计划

## 1. 测试策略

### 1.1 测试类型
- **单元测试**：针对各个模块的独立功能测试
- **集成测试**：模块间协作和数据流测试
- **端到端测试**：完整的用户场景测试
- **性能测试**：关键路径性能验证

### 1.2 测试工具
- **测试框架**：Jest
- **断言库**：内置Jest断言
- **测试覆盖率**：nyc/istanbul
- **模拟工具**：Jest Mock功能

## 2. 测试计划

### 2.1 智能路由模块测试

#### 2.1.1 单元测试用例
```javascript
// tests/unit/smart_router.test.js

describe('SmartRouter', () => {
  let router;
  
  beforeEach(() => {
    router = new SmartRouter();
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
    
    test('should route to default tool when no keyword is detected', async () => {
      const result = await router.smartRoute('分析项目架构');
      expect(result.tool).toBe('claude');
      expect(result.prompt).toBe('分析项目架构');
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
  });
});
```

#### 2.1.2 集成测试用例
```javascript
// tests/integration/routing_integration.test.js

describe('Routing Integration', () => {
  test('should successfully route and execute CLI command', async () => {
    // 模拟CLI工具执行
    const mockSpawn = jest.spyOn(require('child_process'), 'spawn');
    mockSpawn.mockImplementation(() => {
      return {
        on: jest.fn().mockImplementation((event, callback) => {
          if (event === 'close') {
            setTimeout(() => callback(0), 10);
          }
        }),
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      };
    });
    
    // 执行路由
    const router = new SmartRouter();
    const route = await router.smartRoute('用claude分析代码');
    
    // 验证路由结果
    expect(route.tool).toBe('claude');
    expect(route.prompt).toBe('分析代码');
    
    // 验证CLI执行
    expect(mockSpawn).toHaveBeenCalledWith('claude', ['分析代码'], expect.any(Object));
  });
});
```

### 2.2 上下文管理模块测试

#### 2.2.1 单元测试用例
```javascript
// tests/unit/memory_manager.test.js

describe('MemoryManager', () => {
  let memoryManager;
  let tempDir;
  
  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'stigmergy-test-'));
    memoryManager = new MemoryManager();
    memoryManager.globalMemoryFile = path.join(tempDir, 'memory.json');
  });
  
  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });
  
  describe('getGlobalMemory', () => {
    test('should return empty memory when file does not exist', async () => {
      const memory = await memoryManager.getGlobalMemory();
      expect(memory).toEqual({
        interactions: [],
        collaborations: []
      });
    });
    
    test('should return parsed memory when file exists', async () => {
      const testData = {
        interactions: [{ tool: 'claude', prompt: 'test' }],
        collaborations: []
      };
      await fs.writeFile(memoryManager.globalMemoryFile, JSON.stringify(testData));
      
      const memory = await memoryManager.getGlobalMemory();
      expect(memory).toEqual(testData);
    });
  });
  
  describe('updateGlobalMemory', () => {
    test('should update memory and return updated data', async () => {
      const updateFn = (memory) => {
        memory.interactions.push({ tool: 'qwen', prompt: 'test' });
        return memory;
      };
      
      const updatedMemory = await memoryManager.updateGlobalMemory(updateFn);
      
      expect(updatedMemory.interactions).toHaveLength(1);
      expect(updatedMemory.interactions[0].tool).toBe('qwen');
    });
  });
});
```

### 2.3 CLI模式分析模块测试

#### 2.3.1 单元测试用例
```javascript
// tests/unit/cli_help_analyzer.test.js

describe('CLIHelpAnalyzer', () => {
  let analyzer;
  let tempDir;
  
  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'stigmergy-analyzer-test-'));
    analyzer = new CLIHelpAnalyzer();
    analyzer.configDir = tempDir;
    analyzer.persistentConfig = path.join(tempDir, 'cli-patterns.json');
  });
  
  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
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
  
  describe('analyzeCLI', () => {
    test('should throw error when CLI is not configured', async () => {
      await expect(analyzer.analyzeCLI('nonexistent-cli')).rejects.toThrow();
    });
    
    test('should cache analysis results', async () => {
      // 模拟CLI工具帮助信息
      const mockSpawnSync = jest.spyOn(require('child_process'), 'spawnSync');
      mockSpawnSync.mockReturnValue({
        status: 0,
        stdout: 'Usage: claude [options] [command]\n\nCommands:\n  analyze  Analyze code\n  generate Generate code',
        stderr: ''
      });
      
      const result = await analyzer.analyzeCLI('claude');
      
      expect(result.success).toBe(true);
      expect(result.cliName).toBe('claude');
      expect(result.patterns.commands).toHaveLength(2);
      
      // 验证缓存
      const cached = await analyzer.getCachedAnalysis('claude');
      expect(cached).toEqual(result);
    });
  });
});
```

## 3. 实施路线图

### 3.1 第一阶段：基础模块测试 (Week 1-2)
- [ ] 智能路由模块单元测试
- [ ] 上下文管理模块单元测试
- [ ] CLI模式分析模块单元测试
- [ ] 建立测试基础设施

### 3.2 第二阶段：集成测试 (Week 3)
- [ ] 模块间集成测试
- [ ] 数据流测试
- [ ] 错误处理测试

### 3.3 第三阶段：端到端测试 (Week 4)
- [ ] 完整用户场景测试
- [ ] 性能测试
- [ ] 兼容性测试

### 3.4 第四阶段：测试优化 (Week 5)
- [ ] 测试覆盖率分析
- [ ] 测试稳定性优化
- [ ] 自动化测试流程

## 4. 质量门禁

### 4.1 测试覆盖率要求
- **行覆盖率**：≥ 80%
- **函数覆盖率**：≥ 85%
- **分支覆盖率**：≥ 75%

### 4.2 代码质量要求
- **ESLint**：无警告和错误
- **代码复杂度**：函数圈复杂度 ≤ 10
- **重复代码**：≤ 5%

## 5. 持续集成配置

### 5.1 GitHub Actions 配置
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]
    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
    - run: npm ci
    - run: npm test
    - run: npm run coverage
```

### 5.2 测试脚本配置
```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:e2e": "jest tests/e2e",
    "coverage": "jest --coverage",
    "test:watch": "jest --watch"
  },
  "jest": {
    "testEnvironment": "node",
    "collectCoverageFrom": [
      "src/**/*.js",
      "!src/index.js"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 75,
        "functions": 85,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

## 6. 测试数据管理

### 6.1 测试数据工厂
```javascript
// tests/factories/test_data_factory.js

class TestDataFactory {
  static createInteraction(tool = 'claude', prompt = 'test prompt') {
    return {
      timestamp: new Date().toISOString(),
      tool,
      prompt,
      response: 'test response',
      duration: 100
    };
  }
  
  static createCLIConfig(name = 'test-cli') {
    return {
      name: `${name} CLI`,
      version: `${name} --version`,
      install: `npm install -g ${name}-cli`,
      hooksDir: path.join(os.homedir(), `.${name}`, 'hooks'),
      config: path.join(os.homedir(), `.${name}`, 'config.json')
    };
  }
}
```

### 6.2 测试环境配置
```javascript
// tests/test_setup.js

// 设置测试环境
process.env.NODE_ENV = 'test';
process.env.STIGMERGY_TEST_MODE = 'true';

// 创建测试临时目录
const testTempDir = path.join(os.tmpdir(), 'stigmergy-tests');
fs.mkdirSync(testTempDir, { recursive: true });

// 清理测试环境
afterAll(async () => {
  await fs.rm(testTempDir, { recursive: true, force: true });
});
```

## 7. 性能测试计划

### 7.1 关键性能指标
- 路由决策时间：< 100ms
- 内存读写时间：< 50ms
- CLI模式分析时间：< 5s

### 7.2 性能测试用例
```javascript
// tests/performance/routing_performance.test.js

describe('Routing Performance', () => {
  test('should route decision time be less than 100ms', async () => {
    const router = new SmartRouter();
    const startTime = performance.now();
    
    await router.smartRoute('用claude分析项目架构');
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    expect(executionTime).toBeLessThan(100);
  });
});
```

通过以上TDD实施计划，我们可以确保Stigmergy CLI系统的质量和可靠性，同时保持开发效率。