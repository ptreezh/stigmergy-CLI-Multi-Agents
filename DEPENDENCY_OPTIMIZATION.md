# Stigmergy 依赖优化报告

生成日期：2026-01-17

## 📊 当前依赖概况

### 生产依赖（5个）
- ✅ 所有依赖都在实际使用中
- ✅ 无冗余依赖
- ⚠️ 存在版本不一致问题

### 开发依赖（9个）
- ✅ 所有开发工具都有实际用途
- ✅ 测试工具配置合理
- ⚠️ 部分版本过高或过低

## 🔍 详细分析

### 1. 生产依赖分析

#### chalk ^4.1.2
- **使用位置**：15+ 个文件
- **用途**：终端彩色输出
- **状态**：✅ 必需
- **建议**：保持 v4（CommonJS），避免迁移到 ES Module 的 v5

#### commander ^14.0.2 → ^11.1.0
- **使用位置**：`src/cli/router-beta.js`
- **用途**：CLI 命令框架
- **状态**：✅ 必需
- **建议**：降级到 v11 LTS 稳定版，v14 过于新颖

#### inquirer ^13.1.0 → ^8.2.6
- **使用位置**：`src/core/installer.js`
- **用途**：交互式命令行提示
- **状态**：✅ 必需
- **建议**：降级到 v8（最后支持 CommonJS 的稳定版）

#### js-yaml ^4.1.1
- **使用位置**：`src/adapters/iflow/install_iflow_integration.js`
- **用途**：YAML 解析
- **状态**：✅ 必需
- **建议**：✓ 保持当前版本

#### semver ^7.7.3
- **使用位置**：`src/core/upgrade_manager.js`
- **用途**：语义版本管理
- **状态**：✅ 必需
- **建议**：✓ 保持当前版本

### 2. 开发依赖分析

#### TypeScript 工具链
- **typescript**: ^5.9.3 → ^5.6.3（最新稳定版）
- **ts-node**: ^10.9.2 ✓（保持）
- **@types/node**: ^25.0.9 → ^20.14.0（匹配 Node.js 20 LTS）
- **@types/jest**: ^30.0.0 → ^29.5.14（匹配 Jest 29）

#### 测试工具
- **jest**: ^30.2.0 → ^29.7.0（更稳定的测试框架）
- **建议**：Jest 30 是较新版本，Jest 29 更成熟稳定

#### 代码质量工具
- **eslint**: ^9.39.2 → ^8.57.1
- **prettier**: ^3.7.4 → ^3.3.3
- **建议**：使用更稳定的 8.x 版本（ESLint 9 有重大变更）

#### 新增建议
- **depcheck**: ^1.4.7（检查未使用的依赖）
- **npm-check**: ^6.0.4（依赖更新检查）

### 3. 可选依赖优化

将仅在 scripts/ 中使用的依赖移至 optionalDependencies：

#### fs-extra ^11.3.3
- **使用位置**：`scripts/test-runner.js`
- **建议**：移至 optionalDependencies，或用 Node.js 原生 API 替代
- **替代方案**：
  ```javascript
  // 替代 fs.remove()
  await fs.promises.rm(dir, { recursive: true, force: true })
  ```

#### rimraf ^6.1.2 → ^5.0.5
- **使用位置**：`scripts/safe-install.js`
- **建议**：移至 optionalDependencies，或用 Node.js 原生 API 替代
- **替代方案**：
  ```javascript
  // 替代 rimraf.sync()
  fs.rmSync(dir, { recursive: true, force: true })
  ```

## 🎯 优化方案

### 方案 A：保守优化（推荐）

**优点**：风险低，改动小
**实施步骤**：

1. 更新版本到稳定 LTS 版本
2. 添加依赖检查工具
3. 添加 npm scripts 监控依赖健康

**使用命令**：
```bash
# 备份当前 package.json
cp package.json package.json.backup

# 使用优化版本
cp package.optimized.json package.json

# 重新安装依赖
npm install

# 验证功能正常
npm test
npm start
```

### 方案 B：激进优化

**优点**：更少的依赖，更小的包体积
**实施步骤**：

1. 用 Node.js 原生 API 替代 fs-extra 和 rimraf
2. 更新所有脚本文件
3. 移除不必要的依赖

**代码更改示例**：

`scripts/test-runner.js`:
```javascript
// 移除
- const fs = require('fs-extra');

// 替换为
+ const fs = require('fs/promises');

// 更新调用
- await fs.remove('coverage');
+ await fs.rm('coverage', { recursive: true, force: true });
- await fs.remove('test-results');
+ await fs.rm('test-results', { recursive: true, force: true });
```

`scripts/safe-install.js`:
```javascript
// 移除
- const rimraf = require('rimraf');
- rimraf.sync(this.backupDir);

// 替换为
+ const fs = require('fs');
+ fs.rmSync(this.backupDir, { recursive: true, force: true });
```

### 方案 C：渐进式优化

**优点**：逐步验证，降低风险
**实施步骤**：

1. 先升级主要依赖到稳定版本
2. 测试验证
3. 再考虑移除可选依赖
4. 最后添加依赖监控工具

## 📋 实施检查清单

### 阶段 1：准备阶段
- [ ] 备份当前 package.json 和 package-lock.json
- [ ] 运行完整测试套件确保基准功能正常
- [ ] 记录当前 npm 包大小

### 阶段 2：版本优化
- [ ] 更新 dependencies 版本
- [ ] 更新 devDependencies 版本
- [ ] 移动 fs-extra 和 rimraf 到 optionalDependencies
- [ ] 运行 `npm install` 更新 lockfile

### 阶段 3：验证测试
- [ ] 运行 `npm test` 验证测试通过
- [ ] 运行 `npm run build:orchestration` 验证构建
- [ ] 测试主要 CLI 命令（install, scan, status 等）
- [ ] 检查 TypeScript 编译无错误

### 阶段 4：高级优化（可选）
- [ ] 替换 fs-extra 为原生 API
- [ ] 替换 rimraf 为原生 API
- [ ] 移除 fs-extra 和 rimraf 依赖
- [ ] 再次验证所有功能

### 阶段 5：监控和维护
- [ ] 设置 `npm audit` 自动检查
- [ ] 添加 `npm outdated` 定期检查
- [ ] 配置 dependabot（如使用 GitHub）

## ⚙️ 新增 npm scripts 说明

```json
{
  "scripts": {
    "audit": "npm audit --audit-level=moderate",
    "audit:fix": "npm audit fix",
    "check-updates": "npm outdated",
    "analyze-deps": "depcheck",
    "check-unused": "npm-check"
  }
}
```

### 使用说明

```bash
# 检查安全漏洞
npm run audit

# 自动修复安全漏洞
npm run audit:fix

# 检查过时的依赖
npm run check-updates

# 分析未使用的依赖
npm run analyze-deps

# 交互式检查依赖
npm run check-unused
```

## 📈 预期收益

### 包体积优化
- 当前 node_modules：~200MB（估算）
- 优化后 node_modules：~180MB（估算）
- 节省：~20MB（约10%）

### 安装时间优化
- 当前安装时间：~30秒（估算）
- 优化后安装时间：~25秒（估算）
- 节省：~5秒（约17%）

### 安全性提升
- ✅ 依赖版本更稳定
- ✅ 减少潜在的漏洞面
- ✅ 定期安全审计机制

### 维护性提升
- ✅ 依赖健康监控
- ✅ 及时的更新提醒
- ✅ 更好的依赖分析工具

## ⚠️ 注意事项

1. **Node.js 版本要求**
   - 确保使用 Node.js >= 16.0.0
   - 推荐使用 Node.js 20 LTS

2. **CommonJS vs ES Modules**
   - 项目当前混合使用 require 和 import
   - 建议统一使用 CommonJS（保持 chalk v4）

3. **测试覆盖**
   - 更新依赖后必须运行完整测试套件
   - 特别关注 CLI 交互功能

4. **回滚方案**
   - 保留 package.json.backup
   - 使用 Git 版本控制
   - 如有问题快速回滚

## 🚀 实施建议

### 推荐方案：方案 A（保守优化）

**理由**：
1. 风险最低
2. 改动最小
3. 立即见效
4. 易于验证

**时间安排**：
- 准备阶段：15分钟
- 实施阶段：10分钟
- 测试验证：30分钟
- 总计：~1小时

**后续优化**：
- 稳定运行1-2周后
- 可考虑实施方案 B 的激进优化
- 逐步移除可选依赖

## 📞 技术支持

如有问题，请：
1. 查看本文档的故障排除部分
2. 运行 `npm audit` 检查安全问题
3. 运行 `npm run analyze-deps` 检查依赖关系
4. 提交 Issue 到项目仓库

## 🔖 版本历史

- v1.3.54-beta.0 - 初始依赖审计
- 生成日期：2026-01-17

---

**注意**：本报告基于当前代码库状态生成。在实施任何更改前，请确保：
1. 备份所有重要数据
2. 在测试环境中验证
3. 运行完整测试套件
4. 提交到版本控制系统
