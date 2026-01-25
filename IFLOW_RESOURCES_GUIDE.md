# iflow 资源打包和部署指南

## 🎯 目标

把 iflow 全局配置的 agents 和 skills 打包进 stigmergy npm 包，在安装时自动部署到各 CLI。

---

## 📦 打包流程

### 步骤1: 打包 iflow 资源

在**开发机器**上（需要有 iflow 配置）运行：

```bash
node scripts/bundle-iflow-resources.js
```

**做什么**:
- 读取 `~/.iflow/agents/` 中所有 `.md` 文件
- 读取 `~/.iflow/skills/` 中所有 skills
- 生成 `config/bundle/iflow-bundle/config-bundle.json`
- 生成 `config/bundle/iflow-bundle/deployment-manifest.json`

**输出示例**:
```
📦 开始打包 iflow 资源...

📂 读取 agents...
  ✓ ant-expert.md
  ✓ agent-creator.md
  ✓ api-checker.md
  ...

📂 读取 skills...
  ✓ ant
  ✓ brainstorming
  ✓ conflict-resolution
  ...

📝 创建 config-bundle.json...
📝 创建 deployment-manifest.json...

✅ 打包完成！
📊 统计: 35 agents, 20 skills
```

**重要**: 打包后的文件会包含在 npm 包中（通过 `package.json` 的 `files` 字段）。

---

## 🚀 安装和部署流程

### 用户安装 stigmergy

用户运行：

```bash
npm install -g stigmergy
```

### 自动执行 postinstall

npm 安装完成后，自动运行 `scripts/postinstall-deploy.js`：

**步骤 1/2**: 自动安装 CLI tools
```bash
node src/index.js auto-install
```

**步骤 2/2**: 部署 iflow 资源到各 CLI
- 读取打包的 `config-bundle.json`
- 使用 ConfigDeployer 部署到:
  - qwen
  - codebuddy
  - claude
  - qodercli
  - gemini
  - copilot
  - codex

**部署内容**:
- ✅ 文件部署: `~/.cli/skills/*` 和 `~/.cli/agents/*`
- ✅ .md 注册: qwen.md, codebuddy.md, iflow.md (仅支持的CLI)

**输出示例**:
```
🚀 Stigmergy 安装后配置...
============================================================

📦 步骤 1/2: 自动安装 CLI tools...

📦 步骤 2/2: 部署 iflow 的 agents 和 skills...

📦 Deploying iflow config to qwen...
  ✓ Updated qwen.md (20 skills registered)

📦 Deploying iflow config to codebuddy...
  ✓ Updated codebuddy.md (20 skills registered)

============================================================
✅ 部署完成！
📊 统计: 140 项成功, 0 项跳过
============================================================
✅ Stigmergy 安装完成！
💡 运行: stigmergy status
```

---

## 🛠️ 开发工作流

### 首次设置

1. **确保 iflow 已安装**
   ```bash
   npm install -g @iflow-ai/iflow-cli
   ```

2. **打包 iflow 资源**
   ```bash
   npm run bundle:iflow
   ```

3. **验证 bundle**
   ```bash
   ls config/bundle/iflow-bundle/
   # 应该看到:
   # - config-bundle.json
   # - deployment-manifest.json
   ```

4. **发布到 npm**
   ```bash
   npm publish
   ```

### 更新资源

当 iflow 的 agents 或 skills 更新时：

1. **重新打包**
   ```bash
   npm run bundle:iflow
   ```

2. **查看变更**
   ```bash
   git diff config/bundle/iflow-bundle/config-bundle.json
   ```

3. **提交并发布**
   ```bash
   git add config/bundle/iflow-bundle/
   git commit -m "chore: update iflow resources bundle"
   npm version patch
   npm publish
   ```

---

## 📋 package.json 变更

### 添加的 scripts

```json
{
  "scripts": {
    "bundle:iflow": "node scripts/bundle-iflow-resources.js"
  }
}
```

### 修改的 scripts

```json
{
  "scripts": {
    "postinstall": "node scripts/postinstall-deploy.js"
  }
}
```

### files 字段（确保包含）

```json
{
  "files": [
    "bin/**",
    "src/**",
    "config/**",           // ← 包含 config/bundle
    "config/bundle/**",    // ← 明确包含 iflow-bundle
    ...
  ]
}
```

---

## ✅ 验证部署

### 测试打包

```bash
# 1. 清理旧的 bundle
rm -rf config/bundle/iflow-bundle

# 2. 重新打包
npm run bundle:iflow

# 3. 检查内容
cat config/bundle/iflow-bundle/config-bundle.json | grep summary
```

### 测试安装（本地）

```bash
# 1. 卸载旧版本
npm uninstall -g stigmergy

# 2. 安装新版本
npm install -g .

# 3. 检查输出（应该看到自动部署）
npm install -g . 2>&1 | grep "Stigmergy 安装后配置"

# 4. 验证部署
ls ~/.qwen/skills/
ls ~/.codebuddy/skills/
```

---

## 🎯 用户体验

### 安装前

用户各 CLI 没有统一的 agents 和 skills

### 安装后

用户各 CLI 自动获得：
- ✅ 35+ iflow 的 agents
- ✅ 20+ iflow 的 skills
- ✅ 无需手动配置
- ✅ 开箱即用

### 使用

用户可以直接使用：
```bash
qwen "使用ant技能分析这个网络"
codebuddy "用brainstorming技能生成创意"
claude "使用field-analysis分析这个场域"
```

---

## 📊 技术细节

### ConfigDeployer 部署逻辑

1. **文件部署**
   ```
   config-bundle.json → ~/.cli/skills/ant/skill.md
   config-bundle.json → ~/.cli/agents/ant-expert.md
   ```

2. **.md 注册** (仅 qwen, codebuddy, qwen)
   ```xml
   <skill>
   <name>ant</name>
   <description>Skill deployed from Stigmergy CLI coordination layer</description>
   <location>stigmergy</location>
   </skill>
   ```

3. **自动清理**
   - 重复的 skills 自动跳过
   - 失败的部署不影响安装

---

## 🔧 故障排查

### 问题1: bundle 不存在

**症状**: `⚠️ 未找到 iflow 资源包`

**解决**:
```bash
npm run bundle:iflow
```

### 问题2: iflow 配置不存在

**症状**: `❌ iflow 配置目录不存在`

**解决**:
```bash
npm install -g @iflow-ai/iflow-cli
iflow --help  # 初始化配置
```

### 问题3: 部署失败

**症状**: 部署过程中出错

**解决**:
```bash
# 手动运行部署
stigmergy deploy --verbose
```

---

## 📝 下一步

### 短期
- ✅ 打包脚本
- ✅ postinstall 集成
- 🔄 测试完整流程

### 中期
- 🔄 支持更多 CLI
- 🔄 增量更新机制
- 🔄 版本管理

### 长期
- 🔄 动态资源加载
- 🔄 用户自定义资源
- 🔄 资源市场

---

**创建日期**: 2025-01-25
**版本**: 1.0.0
**状态**: ✅ 实现完成
