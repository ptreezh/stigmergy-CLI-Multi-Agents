# Stigmergy CLI 测试执行指南

## 📋 概述

本指南提供了如何执行 Stigmergy CLI 全面测试的详细说明。

## 🚀 快速开始

### 1. 安装测试依赖

```bash
npm install --save-dev jest jest-junit @types/jest babel-jest @babel/core @babel/preset-env
```

### 2. 运行所有测试

```bash
npm test
```

## 🧪 测试类型

### 1. 单元测试 (Unit Tests)

测试单个模块和函数的功能。

```bash
npm run test:unit
```

**测试内容：**
- CLI路径检测
- CLI适配器
- 安装器
- 技能管理
- 智能路由
- 内存管理
- 错误处理

**输出：**
- 控制台测试结果
- 覆盖率报告 (coverage/)
- JUnit XML (test-results/junit.xml)

### 2. 集成测试 (Integration Tests)

测试多个模块之间的协作。

```bash
npm run test:integration
```

**测试内容：**
- 多CLI协作
- Hook系统集成
- 技能系统集成
- 跨CLI数据共享

### 3. 端到端测试 (E2E Tests)

测试完整的用户工作流程。

```bash
npm run test:e2e
```

**测试内容：**
- 全局安装流程
- 初始化流程
- Setup命令
- CLI工具管理
- 技能管理

### 4. 自动化测试 (Automation Tests)

测试自动化功能。

```bash
npm run test:automation
```

**测试内容：**
- 目录创建自动化
- CLI自动扫描
- 自动安装CLI
- 技能自动部署
- 技能自动同步
- Hook自动部署

### 5. 功能测试 (Functional Tests)

测试特定功能点。

```bash
npm run test:functional
```

### 6. 全量测试 (All Tests)

运行所有测试套件。

```bash
npm run test:all
```

## 📊 测试报告

### 查看覆盖率报告

```bash
npm run test:coverage
```

报告位置：
- HTML: `coverage/index.html`
- JSON: `coverage/coverage-summary.json`
- LCov: `coverage/lcov.info`

### 生成详细报告

```bash
npm run test:report
```

### 查看JUnit报告

```bash
cat test-results/junit.xml
```

## 🔍 监视模式

在开发时运行监视模式，自动重新运行测试：

```bash
npm run test:watch
```

## 🎯 测试覆盖率目标

- **语句覆盖率**: ≥ 80%
- **分支覆盖率**: ≥ 70%
- **函数覆盖率**: ≥ 75%
- **行覆盖率**: ≥ 80%

## 🐛 调试测试

### 运行单个测试文件

```bash
jest tests/unit/core/cli_path_detector.test.js
```

### 运行特定测试用例

```bash
jest -t "应该检测已安装的CLI工具"
```

### 显示详细输出

```bash
jest --verbose
```

### 显示测试覆盖率详情

```bash
jest --coverage --verbose
```

## 🔧 CI/CD 集成

### GitHub Actions

测试会自动在以下情况下运行：
- 推送到 main 或 develop 分支
- 创建 Pull Request
- 发布新版本

### 本地CI测试

```bash
# 模拟CI环境
NODE_ENV=test npm test
```

## 📝 测试最佳实践

### 1. 编写测试前

- 确保理解要测试的功能
- 编写清晰的测试描述
- 准备测试数据和模拟对象

### 2. 编写测试时

- 遵循 AAA 模式（Arrange, Act, Assert）
- 使用有意义的测试名称
- 测试正常情况和边界情况
- 测试错误处理

### 3. 测试后

- 确保测试独立运行
- 清理测试资源
- 检查测试覆盖率
- 更新文档

## 🚨 常见问题

### Q: 测试超时怎么办？

A: 增加 Jest 的超时时间：
```javascript
// jest.config.js
testTimeout: 180000 // 3分钟
```

### Q: 如何跳过某些测试？

A: 使用 `skip` 或 `only`：
```javascript
test.skip('跳过这个测试', () => { ... });
test.only('只运行这个测试', () => { ... });
```

### Q: 测试需要网络怎么办？

A: 使用模拟函数：
```javascript
jest.mock('node-fetch', () => ({
  default: jest.fn(() => Promise.resolve({ ... }))
}));
```

### Q: 如何测试需要权限的操作？

A: 使用临时目录和模拟权限：
```javascript
const tempDir = path.join(os.tmpdir(), 'test-' + Date.now());
fs.mkdirSync(tempDir, { recursive: true });
```

## 📈 性能基准

### 预期测试时间

- 单元测试: < 30秒
- 集成测试: < 60秒
- E2E测试: < 120秒
- 自动化测试: < 180秒
- 全量测试: < 5分钟

### 性能优化

- 使用并行测试执行
- 减少不必要的I/O操作
- 使用内存文件系统
- 缓存测试结果

## 🔐 安全测试

### 测试敏感数据处理

```javascript
test('应该正确处理敏感信息', () => {
  const sensitiveData = 'password123';
  const result = processSensitiveData(sensitiveData);

  expect(result).not.toContain(sensitiveData);
});
```

### 测试权限验证

```javascript
test('应该拒绝未授权访问', async () => {
  const result = await performUnauthorizedAction();

  expect(result.success).toBe(false);
  expect(result.error).toContain('unauthorized');
});
```

## 🌍 跨平台测试

### Windows

```powershell
npm test
```

### macOS/Linux

```bash
npm test
```

### Docker

```bash
docker run -it --rm -v $(pwd):/app -w /app node:18 npm test
```

## 📞 获取帮助

如果遇到问题：

1. 查看测试日志：`test-results/`
2. 检查覆盖率报告：`coverage/`
3. 查看详细输出：`npm test -- --verbose`
4. 提交Issue：[GitHub Issues](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/issues)

## 🎓 学习资源

- [Jest 官方文档](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Node.js 测试最佳实践](https://github.com/goldbergyoni/nodebestpractices#-testing-and-overall-quality-practices)

---

**最后更新**: 2026-01-17
**版本**: 1.0.0