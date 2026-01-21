# CI环境自动禁用说明

## 🏗️ 什么是CI环境？

### CI = Continuous Integration（持续集成）

CI环境是用于自动化软件开发流程的环境，包括：
- **自动构建**（Automated Builds）
- **自动测试**（Automated Testing）
- **自动部署**（Automated Deployment）
- **代码质量检查**（Code Quality Checks）

### 常见的CI平台和环境变量

| CI平台 | 环境变量 | 检测方式 |
|--------|----------|----------|
| **GitHub Actions** | `CI=true`, `GITHUB_ACTIONS=true` | `process.env.CI` |
| **GitLab CI** | `GITLAB_CI=true`, `CI=true` | `process.env.CI` |
| **Jenkins** | `JENKINS_URL=...`, `CI=true` | `process.env.CI` |
| **Travis CI** | `TRAVIS=true`, `CI=true` | `process.env.CI` |
| **CircleCI** | `CIRCLECI=true`, `CI=true` | `process.env.CI` |
| **Azure DevOps** | `TF_BUILD=true`, `CI=true` | `process.env.CI` |

## 🚫 为什么在CI环境中禁用自动安装？

### 1. **构建时间过长**
```bash
# CI环境中安装所有CLI工具可能需要很长时间
npm install -g @anthropic-ai/claude-code    # ~30秒
npm install -g @google/gemini-cli          # ~20秒
npm install -g @qwen-code/qwen-code         # ~25秒
npm install -g @iflow-ai/iflow-cli          # ~15秒
npm install -g @qoder-ai/qodercli           # ~18秒
npm install -g @tencent-ai/codebuddy-code   # ~22秒
npm install -g @github/copilot              # ~35秒
npm install -g @openai/codex                # ~28秒
# 总计: ~3分钟
```

### 2. **网络和依赖风险**
```bash
# CI环境中的问题：
- 网络连接不稳定
- npm仓库可能有访问限制
- 某些包可能临时不可用
- 企业防火墙阻止某些下载
```

### 3. **构建失败风险**
```bash
# 如果任何一个CLI工具安装失败，整个构建就会失败
npm ERR! code E404 404 Not Found - GET https://registry.npmjs.org/@openai/codex
# → 整个CI构建失败
```

### 4. **权限和安全问题**
```bash
# CI环境中：
- 通常不允许使用sudo权限
- 无法弹出UAC对话框（Windows）
- 无法进行交互式密码输入
- 严格的权限限制
```

### 5. **不必要的依赖**
```bash
# CI/CD流水线通常只需要：
- 代码检查（linting）
- 单元测试
- 构建打包
- 部署

# 不需要：
- AI CLI工具的实际功能
- 模型推理和生成
- 交互式开发工具
```

## 📋 代码逻辑分析

### 检测CI环境
```javascript
// src/cli/router.js:836
if (autoInstallEnabled && !process.env.CI) {
  // 只有在非CI环境中才执行自动安装
  console.log('\n[AUTO-INSTALL] Installing missing CLI tools automatically...');
  // ... 自动安装逻辑
} else {
  console.log('\n[INFO] You can install missing tools with: stigmergy install --auto');
  if (process.env.CI) {
    console.log('[CI] Auto-install disabled in CI environment');
  }
}
```

### CI环境下的行为
```bash
$ npm install -g stigmergy  # 在CI环境中执行

🚀 STIGMERGY CLI AUTO-INSTALL STARTING
============================================================
[STEP] Scanning for CLI tools...
[OK] CLI tools scanned successfully

[SCAN RESULT] Found 0 available AI CLI tools:
[INFO] No AI CLI tools found on your system

[MISSING] 8 tools not found:
  ✗ Claude CLI (claude) - Install with: npm install -g @anthropic-ai/claude-code
  ✗ Gemini CLI (gemini) - Install with: npm install -g @google/gemini-cli
  ...

[INFO] You can install missing tools with: stigmergy install --auto
[CI] Auto-install disabled in CI environment
```

## 🎯 CI环境的正确使用方式

### 1. **开发环境安装**
```bash
# 开发者的机器上
npm install -g stigmergy
# ✅ 自动安装所有CLI工具
```

### 2. **CI环境配置**
```yaml
# GitHub Actions 示例
name: Build and Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install Stigmergy (CI模式)
        run: npm install -g stigmergy
        # ✅ 只安装stigmergy，不安装CLI工具

      - name: Run Tests
        run: npm test

      - name: Build
        run: npm run build
```

### 3. **如果CI中确实需要CLI工具**
```bash
# 方法1：显式启用
export STIGMERGY_AUTO_INSTALL=true
npm install -g stigmergy

# 方法2：手动安装
npm install -g stigmergy --ignore-scripts
stigmergy install --auto

# 方法3：单独安装特定工具
npm install -g @anthropic-ai/claude-code
npm install -g @google/gemini-cli
```

## 🔧 CI环境检测的实现

### 环境变量检测
```javascript
// 检测是否在CI环境中
const isCI = process.env.CI ||
           process.env.GITHUB_ACTIONS ||
           process.env.GITLAB_CI ||
           process.env.JENKINS_URL ||
           process.env.TRAVIS ||
           process.env.CIRCLECI ||
           process.env.TF_BUILD;

// 简化版本（只检查CI=true）
const isCI = process.env.CI;
```

### 可配置的CI行为
```javascript
// 用户可以通过环境变量控制
const autoInstallEnabled = process.env.STIGMERGY_AUTO_INSTALL !== 'false';
const ciOverride = process.env.STIGMERGY_CI_INSTALL === 'true'; // 强制在CI中安装

if (autoInstallEnabled && (ciOverride || !process.env.CI)) {
  // 安装逻辑
}
```

## 🎓 最佳实践

### 1. **默认行为**
```javascript
// ✅ 推荐：默认在CI中禁用
if (autoInstallEnabled && !process.env.CI) {
  // 只在开发环境自动安装
}
```

### 2. **文档说明**
```markdown
## CI环境使用

在CI/CD环境中，stigmergy会自动禁用CLI工具的自动安装，以避免：
- 构建时间过长
- 网络依赖风险
- 权限问题

如果需要在CI中安装CLI工具，请使用：
```bash
export STIGMERGY_CI_INSTALL=true
npm install -g stigmergy
```
```

### 3. **错误处理**
```javascript
if (process.env.CI) {
  console.log('[CI] Auto-install disabled in CI environment');
  console.log('[CI] To enable, set STIGMERGY_CI_INSTALL=true');
}
```

## 🏆 总结

**CI环境自动禁用是一个明智的设计决策：**

### ✅ **好处**
1. **构建速度** - 避免长时间的网络下载
2. **构建可靠性** - 减少因网络问题导致的构建失败
3. **权限兼容** - 避免CI环境中的权限限制问题
4. **资源节约** - 不安装不必要的工具
5. **可预测性** - CI构建行为一致且可控

### 🎯 **适用场景**
- **开发环境**：自动安装所有工具 ✅
- **CI环境**：只安装stigmergy，跳过CLI工具 ✅
- **生产部署**：按需安装特定工具 ✅

这种设计体现了"在合适的环境中做合适的事"的原则！ 🎉