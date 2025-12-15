# Stigmergy CLI 分层测试策略

## 概述

Stigmergy CLI 项目采用分层测试策略，以有效测试多CLI工具协调系统。考虑到项目涉及多个独立的外部CLI工具，我们设计了以下三层测试架构。

## 测试架构

### 第一层：单元测试 (Unit Tests)
**位置**: `tests/unit/`

**目的**: 测试各个模块的核心逻辑，不依赖外部系统

**包含**:
- CLI工具配置验证 (`cli-tool-detector.test.js`)
- 智能路由核心逻辑 (`smart-router-core.test.js`)
- 参数处理逻辑 (`parameter-handler-core.test.js`)
- 缓存清理器逻辑
- 错误处理器逻辑

**特点**:
- 快速执行
- 不涉及外部CLI
- 模拟依赖项
- 100%代码覆盖率目标

### 第二层：集成测试 (Integration Tests)
**位置**: `tests/integration/`

**目的**: 测试模块间的交互和数据流

**包含**:
- Router与Analyzer的集成
- Parameter Handler与Router的集成
- 缓存系统与各模块的集成
- 错误处理流程

**特点**:
- 部分真实依赖
- 测试模块间通信
- 中等执行时间

### 第三层：端到端测试 (E2E Tests)
**位置**: `tests/e2e/`

**目的**: 测试真实的CLI工具执行

**包含**:
- 实际CLI工具调用
- 完整的用户工作流
- 环境隔离测试

**特点**:
- 需要安装的实际CLI工具
- 较长的执行时间
- 环境隔离
- 可选执行（基于CLI可用性）

## 测试工具和命令

### 基本测试命令

```bash
# 运行所有分层测试
npm test
# 或
npm run test:layers

# 只运行单元测试
npm run test:unit

# 只运行集成测试
npm run test:integration

# 只运行端到端测试
npm run test:e2e

# 跳过E2E测试（快速验证）
npm run test:layers-skip-e2e

# 只运行核心逻辑测试
npm run test:core
```

### CLI可用性检查

```bash
# 检查哪些CLI工具可用
npm run test:availability
```

### 覆盖率报告

```bash
# 单元测试覆盖率
npm run coverage:unit

# 集成测试覆盖率
npm run coverage:integration

# 完整覆盖率报告
npm run coverage
```

## 环境隔离

### TestEnvironment类
提供完全隔离的测试环境：
- 临时目录结构
- 独立的环境变量
- Mock CLI工具生成
- 自动清理

### CLI可用性检测

CLIAvailabilityChecker类：
- 检测已安装的CLI工具
- 并发检测以提高性能
- 超时控制
- 缓存结果

## 测试最佳实践

### 1. 编写单元测试
```javascript
// 示例：测试路由逻辑
test('should detect use patterns', () => {
  const patterns = [
    'use claude to help',
    'using gemini for task'
  ];

  patterns.forEach(pattern => {
    expect(router.shouldRoute(pattern)).toBe(true);
  });
});
```

### 2. 编写集成测试
```javascript
// 示例：测试模块集成
test('should cache analysis results', async () => {
  const pattern1 = await router.getOptimizedCLIPattern('claude');
  const pattern2 = await router.getOptimizedCLIPattern('claude');

  if (pattern1 && pattern2) {
    expect(pattern1).toEqual(pattern2);
  }
});
```

### 3. 编写E2E测试
```javascript
// 示例：测试真实CLI执行
test('should execute available CLI tools safely', async () => {
  const routeResult = await router.smartRoute('use claude to say hello');
  const args = CLIParameterHandler.getToolSpecificArguments(
    routeResult.tool,
    routeResult.prompt
  );

  const result = await executeCLISafely(routeResult.tool, args);
  expect(result).toHaveProperty('success');
});
```

## CI/CD集成

### GitHub Actions示例

```yaml
name: Layered Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:unit

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    strategy:
      matrix:
        cli-tool: [claude, gemini, qwen]
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - name: Install CLI tool
        run: |
          case ${{ matrix.cli-tool }} in
            claude) npm install -g @anthropic-ai/claude-code ;;
            gemini) npm install -g @google/gemini-cli ;;
            # Add other tools as needed
          esac
      - run: npm run test:e2e
```

## 故障排除

### 常见问题

1. **E2E测试失败**
   - 检查CLI工具是否正确安装
   - 运行 `npm run test:availability` 查看可用性
   - 使用 `--skip-e2e` 跳过E2E测试

2. **测试超时**
   - 增加测试超时时间
   - 检查网络连接
   - 使用Mock CLI工具

3. **环境问题**
   - 确保Node.js版本 >= 16
   - 清理node_modules并重新安装
   - 检查权限设置

### 调试技巧

```bash
# 详细测试输出
npm test -- --verbose

# 运行特定测试
npm test -- --testNamePattern="should detect"

# 调试模式
node --inspect-brk node_modules/.bin/jest tests/unit
```

## 总结

分层测试策略提供了：
- **快速反馈**: 单元测试快速验证核心逻辑
- **可靠性**: 集成测试确保模块协作
- **信心**: E2E测试验证真实场景
- **灵活性**: 可选择性执行不同层级

这种策略确保了Stigmergy CLI的稳定性和可靠性，同时考虑了多CLI工具系统的特殊性。