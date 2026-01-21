# Stigmergy CLI 全面测试计划

## 📋 测试计划概述

### 目标
1. **单元测试**：覆盖所有核心模块和功能
2. **功能测试**：验证完整的工作流程
3. **集成测试**：测试多CLI工具协作
4. **包发布测试**：确保npm包安装和部署正常
5. **自动化测试**：解决安装问题，实现自动扫描和部署

### 测试范围
- ✅ CLI工具扫描和安装
- ✅ 目录创建和文件管理
- ✅ 自动化部署内置技能
- ✅ 技能同步到所有CLI
- ✅ 跨CLI通信
- ✅ 智能路由
- ✅ 会话恢复

---

## 🧪 第一阶段：单元测试

### 1.1 核心模块测试

#### 1.1.1 CLI工具检测模块 (`cli_path_detector.js`)
```javascript
// 测试用例：
- 检测已安装的CLI工具（Windows/macOS/Linux）
- 检测未安装的CLI工具
- 处理路径环境变量
- 处理自定义安装路径
- 处理权限错误
```

#### 1.1.2 CLI适配器模块 (`cli_adapters.js`)
```javascript
// 测试用例：
- 创建正确的CLI适配器
- 处理不同CLI的参数格式
- 处理认证参数
- 处理错误响应
- 测试所有9个CLI工具
```

#### 1.1.3 安装器模块 (`installer.js`, `enhanced_cli_installer.js`)
```javascript
// 测试用例：
- 安装单个CLI工具
- 批量安装多个CLI工具
- 处理安装失败
- 处理权限问题
- 验证安装成功
- 处理npm全局安装
```

#### 1.1.4 技能管理模块 (`skills/`)
```javascript
// 测试用例：
- 扫描本地技能
- 安装技能从GitHub
- 验证技能格式
- 列出已安装技能
- 删除技能
- 同步技能到多个CLI
```

#### 1.1.5 智能路由模块 (`smart_router.js`)
```javascript
// 测试用例：
- 分析任务类型
- 选择最佳CLI工具
- 处理多语言任务
- 处理模糊任务
- 返回路由结果
```

#### 1.1.6 内存管理模块 (`memory_manager.js`)
```javascript
// 测试用例：
- 保存会话数据
- 恢复会话数据
- 跨CLI会话共享
- 处理会话过期
- 清理过期会话
```

#### 1.1.7 错误处理模块 (`error_handler.js`)
```javascript
// 测试用例：
- 捕获同步错误
- 捕获异步错误
- 格式化错误消息
- 记录错误日志
- 提供恢复建议
```

### 1.2 工具函数测试

#### 1.2.1 格式化工具 (`utils/formatters.js`)
```javascript
// 测试用例：
- 格式化字节大小
- 格式化时间戳
- 格式化版本号
- 格式化CLI状态
```

#### 1.2.2 环境工具 (`utils/environment.js`)
```javascript
// 测试用例：
- 获取工作目录
- 获取环境变量
- 设置环境变量
- 处理路径分隔符
```

---

## 🔄 第二阶段：功能测试

### 2.1 安装和初始化功能

#### 2.1.1 全局安装测试
```bash
# 测试场景：
1. 全新安装（首次）
   - npm install -g stigmergy@beta
   - 验证 stigmergy 命令可用
   - 验证版本号正确

2. 升级安装
   - 从旧版本升级
   - 验证配置保留
   - 验证技能保留

3. 重新安装
   - 卸载后重新安装
   - 验证清理干净
   - 验证重新初始化
```

#### 2.1.2 初始化测试
```bash
# 测试场景：
1. stigmergy init
   - 创建 .stigmergy 目录
   - 创建配置文件
   - 验证目录权限

2. stigmergy setup
   - 扫描可用CLI工具
   - 部署hooks
   - 安装内置技能
   - 验证所有步骤成功
```

### 2.2 CLI工具管理功能

#### 2.2.1 扫描功能测试
```bash
# 测试场景：
1. stigmergy scan
   - 检测已安装CLI
   - 检测未安装CLI
   - 生成状态报告
   - 验证准确性

2. stigmergy status
   - 显示所有CLI状态
   - 显示版本信息
   - 显示安装路径
   - 验证格式正确
```

#### 2.2.2 安装功能测试
```bash
# 测试场景：
1. stigmergy install
   - 自动安装所有未安装CLI
   - 处理安装失败
   - 提供安装报告
   - 验证安装成功

2. stigmergy install <tool>
   - 安装指定CLI
   - 处理已安装CLI
   - 处理不存在的CLI
   - 验证正确性
```

### 2.3 技能管理功能

#### 2.3.1 技能安装测试
```bash
# 测试场景：
1. stigmergy skill install <repo>
   - 从GitHub安装技能
   - 处理不同URL格式
   - 处理私有仓库
   - 验证安装成功

2. stigmergy skill list
   - 列出所有技能
   - 显示技能信息
   - 验证格式正确
```

#### 2.3.2 技能同步测试
```bash
# 测试场景：
1. stigmergy skill sync
   - 同步到所有CLI
   - 处理不存在的CLI目录
   - 创建必要目录
   - 验证同步成功

2. 跨CLI技能访问
   - 在Claude中使用技能
   - 在Qwen中使用技能
   - 验证所有CLI可访问
```

### 2.4 执行功能测试

#### 2.4.1 直接调用测试
```bash
# 测试场景：
1. stigmergy claude "task"
   - 调用Claude CLI
   - 传递参数正确
   - 返回结果正确

2. stigmergy gemini "task"
   - 调用Gemini CLI
   - 验证参数传递
   - 验证结果返回

3. 测试所有9个CLI工具
```

#### 2.4.2 智能路由测试
```bash
# 测试场景：
1. stigmergy call "code task"
   - 自动选择最佳CLI
   - 验证选择逻辑
   - 验证结果正确

2. stigmergy call "翻译任务"
   - 多语言支持
   - 验证语言识别
   - 验证路由正确
```

### 2.5 会话管理功能

#### 2.5.1 会话恢复测试
```bash
# 测试场景：
1. stigmergy resume
   - 列出最近会话
   - 恢复指定会话
   - 验证数据完整

2. 跨CLI会话
   - Claude创建会话
   - Qwen恢复会话
   - 验证数据共享
```

### 2.6 交互模式测试

```bash
# 测试场景：
1. stigmergy interactive
   - 进入交互模式
   - 执行多个命令
   - 退出模式
   - 验证历史记录

2. 交互模式命令
   - 所有CLI命令可用
   - 技能命令可用
   - 验证响应正确
```

---

## 🔗 第三阶段：集成测试

### 3.1 多CLI协作测试

#### 3.1.1 顺序协作测试
```bash
# 测试场景：
1. Claude → Qwen → Gemini
   - Claude生成代码
   - Qwen优化代码
   - Gemini添加注释
   - 验证结果正确

2. 多步骤任务
   - 分配给不同CLI
   - 传递上下文
   - 验证协作成功
```

#### 3.1.2 并发协作测试
```bash
# 测试场景：
1. stigmergy concurrent
   - 同时调用多个CLI
   - 处理并发请求
   - 合并结果
   - 验证性能

2. 资源竞争
   - 多个CLI访问同一文件
   - 处理文件锁
   - 验证数据完整性
```

### 3.2 Hook系统集成测试

```bash
# 测试场景：
1. Hook部署
   - 部署到所有CLI
   - 验证hook文件存在
   - 验证hook可执行

2. Hook执行
   - CLI调用时触发hook
   - 传递正确参数
   - 验证hook功能

3. Hook更新
   - 更新hook代码
   - 重新部署
   - 验证更新生效
```

### 3.3 技能系统集成测试

```bash
# 测试场景：
1. 技能安装 → 同步 → 使用
   - 安装技能
   - 同步到所有CLI
   - 在各CLI中使用
   - 验证完整流程

2. 技能依赖
   - 安装依赖技能
   - 处理依赖冲突
   - 验证依赖关系
```

---

## 📦 第四阶段：包发布测试

### 4.1 包构建测试

```bash
# 测试场景：
1. npm run build:orchestration
   - 编译TypeScript
   - 验证输出文件
   - 验证无编译错误

2. npm run verify:package
   - 验证包内容
   - 验证文件列表
   - 验证依赖完整
```

### 4.2 包安装测试

#### 4.2.1 全局安装测试
```bash
# 测试场景：
1. npm install -g stigmergy@beta
   - 下载包
   - 安装依赖
   - 创建符号链接
   - 验证命令可用

2. 不同平台测试
   - Windows (PowerShell/CMD)
   - macOS
   - Linux
   - 验证跨平台兼容性
```

#### 4.2.2 本地安装测试
```bash
# 测试场景：
1. npm install ./stigmergy-CLI-Multi-Agents
   - 本地文件安装
   - 验证路径正确
   - 验证功能正常

2. npm pack + npm install
   - 打包tarball
   - 安装tarball
   - 验证完整性
```

### 4.3 包发布测试

```bash
# 测试场景：
1. npm publish --tag beta
   - 发布到npm
   - 验证版本号
   - 验证元数据

2. npm info stigmergy
   - 查询包信息
   - 验证发布成功
   - 验证版本可用

3. 从npm安装测试
   - 全新环境
   - npm install -g stigmergy@beta
   - 验证功能完整
```

---

## 🤖 第五阶段：自动化测试

### 5.1 自动化安装测试

#### 5.1.1 目录创建自动化
```javascript
// 测试目标：
- 自动创建 ~/.stigmergy 目录
- 自动创建技能目录
- 自动创建配置目录
- 自动创建日志目录
- 验证权限正确
- 验证父目录不存在时创建
```

#### 5.1.2 CLI自动扫描
```javascript
// 测试目标：
- 自动扫描PATH环境变量
- 自动检测已安装CLI
- 自动检测CLI版本
- 自动生成CLI列表
- 处理扫描错误
- 生成扫描报告
```

#### 5.1.3 自动安装CLI
```javascript
// 测试目标：
- 自动识别未安装CLI
- 自动执行npm install
- 处理安装失败
- 重试机制
- 验证安装成功
- 生成安装报告
```

### 5.2 自动化部署测试

#### 5.2.1 技能自动部署
```javascript
// 测试目标：
- 自动检测内置技能
- 自动复制到技能目录
- 自动验证技能格式
- 自动创建技能索引
- 处理部署失败
- 生成部署报告
```

#### 5.2.2 技能自动同步
```javascript
// 测试目标：
- 自动检测所有CLI目录
- 自动同步技能到CLI
- 处理不存在的目录（自动创建）
- 验证同步完整性
- 处理同步冲突
- 生成同步报告
```

#### 5.2.3 Hook自动部署
```javascript
// 测试目标：
- 自动检测CLI配置目录
- 自动创建hook目录
- 自动部署hook文件
- 验证hook权限
- 处理部署失败
- 生成部署报告
```

### 5.3 自动化测试脚本

#### 5.3.1 单元测试套件
```javascript
// 创建文件：tests/unit/core/cli_path_detector.test.js
describe('CLI Path Detector', () => {
  test('should detect installed CLI tools', async () => {
    const detector = new CLIPathDetector();
    const tools = await detector.scan();
    expect(tools).toHaveProperty('claude');
    expect(tools).toHaveProperty('gemini');
  });

  test('should handle missing CLI tools', async () => {
    const detector = new CLIPathDetector();
    const tools = await detector.scan();
    expect(tools.claude).toBeDefined();
  });

  test('should detect CLI versions', async () => {
    const detector = new CLIPathDetector();
    const version = await detector.getVersion('claude');
    expect(version).toMatch(/\d+\.\d+\.\d+/);
  });
});
```

#### 5.3.2 功能测试套件
```javascript
// 创建文件：tests/e2e/installation.test.js
describe('Installation E2E', () => {
  test('should install stigmergy globally', async () => {
    const result = await exec('npm install -g stigmergy@beta');
    expect(result.code).toBe(0);
  });

  test('should verify installation', async () => {
    const result = await exec('stigmergy --version');
    expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
  });

  test('should run setup command', async () => {
    const result = await exec('stigmergy setup');
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('✓');
  });
});
```

#### 5.3.3 集成测试套件
```javascript
// 创建文件：tests/integration/multi-cli.test.js
describe('Multi-CLI Integration', () => {
  test('should call claude and get response', async () => {
    const result = await exec('stigmergy claude "echo hello"');
    expect(result.stdout).toContain('hello');
  });

  test('should use smart routing', async () => {
    const result = await exec('stigmergy call "write a function"');
    expect(result.code).toBe(0);
  });

  test('should sync skills across CLIs', async () => {
    await exec('stigmergy skill install vercel-labs/agent-skills');
    await exec('stigmergy skill sync');
    // 验证所有CLI目录都有技能
  });
});
```

---

## 🎯 第六阶段：问题修复验证

### 6.1 安装问题修复验证

#### 6.1.1 目录创建问题
```javascript
// 测试目标：
✅ 验证能自动创建不存在的目录
✅ 验证能处理权限问题
✅ 验证能处理路径分隔符差异
✅ 验证能处理特殊字符路径
```

#### 6.1.2 CLI扫描问题
```javascript
// 测试目标：
✅ 验证能扫描所有常见安装路径
✅ 验证能处理PATH环境变量
✅ 验证能处理自定义路径
✅ 验证能生成准确的报告
```

#### 6.1.3 自动安装问题
```javascript
// 测试目标：
✅ 验证能自动安装npm包
✅ 验证能处理安装失败
✅ 验证能提供重试机制
✅ 验证能验证安装成功
```

### 6.2 技能部署问题修复验证

#### 6.2.1 内置技能部署
```javascript
// 测试目标：
✅ 验证能自动部署resumesession技能
✅ 验证能自动部署planning-with-files技能
✅ 验证能验证技能格式
✅ 验证能创建技能索引
```

#### 6.2.2 技能同步问题
```javascript
// 测试目标：
✅ 验证能同步到所有CLI目录
✅ 验证能自动创建不存在的目录
✅ 验证能处理同步冲突
✅ 验证能验证同步完整性
```

---

## 📊 测试执行计划

### 测试环境准备
```bash
# 1. 准备测试环境
- Windows 10/11 (PowerShell, CMD)
- macOS (Terminal)
- Linux (Bash)

# 2. 安装依赖
npm install

# 3. 构建项目
npm run build:orchestration

# 4. 配置测试环境
cp .env.test .env
```

### 测试执行顺序
```bash
# 第一阶段：单元测试
npm run test:unit

# 第二阶段：功能测试
npm run test:functional

# 第三阶段：集成测试
npm run test:integration

# 第四阶段：包发布测试
npm run test:publish

# 第五阶段：自动化测试
npm run test:automated

# 全量测试
npm run test:all
```

### 测试报告生成
```bash
# 生成测试报告
npm run test:report

# 生成覆盖率报告
npm run test:coverage

# 生成详细日志
npm run test:verbose
```

---

## 📝 测试验收标准

### 功能验收标准
- ✅ 所有单元测试通过率 > 95%
- ✅ 所有功能测试通过率 > 90%
- ✅ 所有集成测试通过率 > 85%
- ✅ 包发布测试通过率 = 100%
- ✅ 自动化测试通过率 > 90%

### 性能验收标准
- ✅ 安装时间 < 30秒
- ✅ 扫描时间 < 10秒
- ✅ 技能部署时间 < 15秒
- ✅ 技能同步时间 < 20秒
- ✅ CLI调用响应时间 < 5秒

### 兼容性验收标准
- ✅ Windows 10/11 完全兼容
- ✅ macOS 12+ 完全兼容
- ✅ Linux (Ubuntu/Debian/CentOS) 完全兼容
- ✅ Node.js 16+ 完全兼容
- ✅ npm 8+ 完全兼容

---

## 🔧 测试工具和框架

### 单元测试框架
```json
{
  "jest": "^30.2.0",
  "@types/jest": "^30.0.0"
}
```

### E2E测试框架
```json
{
  "playwright": "^1.40.0"
}
```

### 覆盖率工具
```json
{
  "istanbul": "^3.0.0",
  "nyc": "^15.1.0"
}
```

### 测试辅助工具
```json
{
  "mock-fs": "^5.2.0",
  "sinon": "^17.0.0",
  "chai": "^4.3.10"
}
```

---

## 📈 持续集成

### GitHub Actions配置
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node: [16, 18, 20]

    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node }}
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run build:orchestration
      - name: Run tests
        run: npm test
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 🎓 测试文档

### 测试用例文档
- 每个测试用例都有详细描述
- 包含预期结果和实际结果
- 记录测试数据和测试环境

### 测试报告文档
- 每次测试后生成报告
- 包含测试通过率
- 包含性能指标
- 包含问题列表

### 用户验收测试文档
- 用户场景测试用例
- 用户操作步骤
- 用户反馈记录

---

## 🚀 部署验证

### 部署前检查清单
- [ ] 所有测试通过
- [ ] 代码审查完成
- [ ] 文档更新完成
- [ ] 版本号更新
- [ ] 变更日志更新
- [ ] 安全检查通过

### 部署后验证
- [ ] npm发布成功
- [ ] 安装测试通过
- [ ] 功能测试通过
- [ ] 性能测试通过
- [ ] 用户反馈收集
- [ ] 问题修复计划

---

## 📞 支持和维护

### 测试维护
- 定期更新测试用例
- 修复失败的测试
- 优化测试性能
- 添加新功能测试

### 问题跟踪
- 使用GitHub Issues跟踪问题
- 记录复现步骤
- 记录解决方案
- 更新测试用例

---

**测试计划版本**: 1.0.0
**创建日期**: 2026-01-17
**最后更新**: 2026-01-17
**负责人**: Stigmergy CLI Team