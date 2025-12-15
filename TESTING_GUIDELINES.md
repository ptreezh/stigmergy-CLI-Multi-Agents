# Stigmergy CLI 测试指南

## 测试架构说明

### 1. 测试分层策略

#### Unit Tests (单元测试) - `tests/unit/`
- **目的**：测试单个模块和函数的逻辑
- **特点**：快速、隔离、不依赖外部资源
- **示例**：数学函数、加密解密、数据结构操作

#### Integration Tests (集成测试) - `tests/integration/`
- **目的**：测试模块间的交互和CLI工具检测
- **特点**：中等速度、部分依赖外部系统
- **示例**：Smart Router与CLI工具的集成

#### E2E Tests (端到端测试) - `tests/e2e/`
- **目的**：测试完整的工作流程
- **特点**：较慢、模拟真实使用场景
- **示例**：完整安装和部署流程

#### Shell Integration Tests - `tests/integration/shell_integration_test.js`
- **目的**：在真实shell环境中测试
- **特点**：最慢、需要真实环境配置
- **运行条件**：需要特定的环境变量和CLI工具

### 2. 环境变量配置

```bash
# 设置是否安装了特定的CLI工具
export HAS_CLAUDE_CLI=true
export HAS_GEMINI_CLI=true
export HAS_QWEN_CLI=false

# CI环境设置
export CI=true
```

### 3. 测试运行策略

#### 开发阶段
```bash
# 只运行单元测试（快速反馈）
npm test -- --testPathPattern=unit

# 运行单元测试 + 集成测试
npm test -- --testPathPattern="unit|integration"

# 运行特定测试文件
npm test -- tests/unit/smart_router.test.js
```

#### CI/CD阶段
```bash
# 运行所有测试（不包括shell集成）
npm test

# 如果有真实CLI工具环境，运行shell集成测试
npm test -- --testPathPattern=shell_integration
```

#### 发布前
```bash
# 完整测试套件 + 覆盖率报告
npm run test:coverage

# 性能测试
npm run test:performance
```

### 4. 端到端测试的可行性解决方案

#### 问题分析
1. **外部依赖**：AI CLI工具需要认证和API密钥
2. **网络依赖**：需要连接到AI服务
3. **环境差异**：开发者环境配置不同
4. **执行时间**：真实CLI调用可能很慢

#### 解决方案

##### 方案A：Mock-Based E2E（推荐用于常规开发）
- 使用Mock模拟CLI工具响应
- 快速、可靠、可重复
- 适合CI/CD环境
- 缺点：无法测试真实集成

##### 方案B：Conditional Shell Tests（推荐用于发布验证）
- 使用环境变量控制测试执行
- 只在有相应工具时运行测试
- 可以验证真实集成
- 需要特定的测试环境

##### 方案C：Docker-Based Testing（推荐用于完整验证）
```bash
# 创建包含所有CLI工具的Docker镜像
docker build -t stigmergy-test-env .

# 在Docker中运行完整测试
docker run --rm stigmergy-test-env npm test
```

##### 方案D：Integration-as-a-Service
- 创建专门的集成测试环境
- 通过API触发测试
- 返回测试结果和报告

### 5. 最佳实践

#### 测试编写原则
1. **独立性**：每个测试应该独立运行
2. **可重复性**：测试结果应该一致
3. **快速反馈**：单元测试应该在秒级完成
4. **清晰命名**：测试名称应该清楚描述测试内容

#### Mock使用指南
```javascript
// 好的Mock示例
jest.mock('../../src/core/installer', () => ({
  checkCLI: jest.fn().mockResolvedValue(true),
  scanCLI: jest.fn().mockResolvedValue({
    available: { claude: { name: 'Claude CLI' } },
    missing: {}
  })
}));
```

#### 错误处理测试
```javascript
// 测试错误场景
test('should handle network errors gracefully', async () => {
  // Mock网络错误
  jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

  await expect(asyncFunction()).rejects.toThrow('Network error');
});
```

### 6. 测试数据管理

#### 测试夹具（Fixtures）
```javascript
// tests/fixtures/cliTools.js
export const mockCLITools = {
  claude: { name: 'Claude CLI', version: '1.0.0' },
  gemini: { name: 'Gemini CLI', version: '1.0.0' }
};
```

#### 测试工具函数
```javascript
// tests/helpers/testUtils.js
export function createMockCLIResponse(tool, status = 0, stdout = '') {
  return {
    tool,
    status,
    stdout,
    stderr: '',
    timestamp: new Date().toISOString()
  };
}
```

### 7. 持续集成配置

#### GitHub Actions示例
```yaml
name: Tests
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --testPathPattern=unit

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --testPathPattern="unit|integration"

  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:e2e
```

### 8. 测试报告和覆盖率

#### 覆盖率目标
- **单元测试**：90%+
- **集成测试**：80%+
- **总体覆盖率**：85%+

#### 报告生成
```json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "jest --testPathPattern=e2e",
    "test:shell": "jest --testPathPattern=shell_integration"
  }
}
```

### 9. 故障排查

#### 常见问题
1. **测试超时**：增加timeout值或检查外部依赖
2. **Mock失效**：检查Mock配置和清理
3. **异步测试**：确保正确使用await或done回调
4. **环境差异**：使用环境变量控制测试执行

#### 调试技巧
```javascript
// Jest调试
test('debug example', () => {
  debugger; // 在浏览器中调试
  expect(someFunction()).toBe(true);
});

// 控制台输出
test('console output', () => {
  console.log('Debug:', someVariable);
  expect(someFunction()).toBe(true);
});
```

## 总结

通过这种分层的测试策略，我们可以在不同阶段获得适当的测试覆盖：

1. **开发阶段**：专注于单元测试，获得快速反馈
2. **集成阶段**：验证模块间交互，确保系统稳定性
3. **发布阶段**：运行完整测试套件，包括真实环境验证

这种方法平衡了测试速度、可靠性和真实性，为复杂的AI CLI工具多代理系统提供了全面的测试保障。