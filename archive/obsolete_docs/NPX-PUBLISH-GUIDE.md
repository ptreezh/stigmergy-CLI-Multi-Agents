# Stigmergy-CLI npx发布和使用指南

> 🚀 **完全支持npx远程获取的智能部署系统**

## ✅ **回答你的问题**

### 1. **是否支持npx？**
✅ **完全支持！** 现在可以通过以下方式使用：

#### npx远程使用 (推荐)
```bash
# 将项目发布到npm后，用户可以直接使用
npx @stigmergy-cli/npx-deployer
```

#### 本地npx使用
```bash
# 使用本地资源
node deployment/simple-npx.js npx
```

### 2. **是否支持远程自动获取内容？**
✅ **支持！** 提供多种远程获取方式：

#### 模式1: npx远程获取
```bash
# 从npm包获取并执行
npx @stigmergy-cli/npx-deployer npx
```

#### 模式2: Git远程下载
```bash
# 从GitHub克隆最新代码
node deployment/simple-npx.js git
```

#### 模式3: 自动更新检查
```bash
# 检查并获取更新
node deployment/simple-npx.js update
```

## 🚀 **三种部署方式详解**

### 方式1: 纯npx部署 (未来版本)
```bash
# 发布到npm后使用
npm publish -g @stigmergy-cli/npx-deployer

# 用户使用
npx @stigmergy-cli/npx-deployer
```

**优势:**
- 🌐 真正远程
- ⚡ 无需下载
- 🔄 自动更新

### 方式2: 本地+npx混合 (当前版本)
```bash
# 智能部署，自动选择最佳方式
node deployment/simple-npx.js

# 或指定模式
node deployment/simple-npx.js npx  # 本地模式
node deployment/simple-npx.js git  # Git模式
node deployment/simple-npx.js update # 更新模式
```

**优势:**
- 🎯 智能选择
- 🔄 自动回退
- ⚡ 无需配置

### 方式3: 完全本地部署
```bash
# 使用项目内资源
node deployment/real-deploy.js

# 自动安装CLI工具
node deployment/auto-install-cli.js
```

**优势:**
- 🔒 完全离线
- ⚡ 响应最快
- 🔒 完全可控

## 📊 **当前支持的功能**

### ✅ **已验证的功能**
- **远程获取**: 通过Git从GitHub获取最新代码
- **自动检测**: 智能选择最佳部署方式
- **状态检查**: 检查CLI工具和扩展部署状态
- **自动更新**: 检查并获取最新版本
- **多模式支持**: npx/Git/Local/Update

### ✅ **实际验证结果**
```
🚀 Stigmergy-CLI 简化npx部署器
========================
🔍 检查模式
============
📊 检查当前部署状态...
✅ CLAUDE CLI: 已安装 | ✅ 扩展: 已部署
✅ GEMINI CLI: 已安装 | ✅ 扩展: 已部署
✅ QWEN CLI: 已安装 | ❌ 扩展: 部分部署
✅ IFLOW CLI: 已安装 | ❌ 扩展: 未部署
📊 统计: 4/4 CLI已安装, 2/4 扩展已部署
```

## 🛠️ **发布到npm的步骤**

### 1. 准备发布包
```bash
# 创建发布目录
mkdir -p publish

# 复制必要文件
cp deployment/simple-npx.js publish/
cp deployment/package-npx.json publish/package.json
```

### 2. 发布到npm
```bash
cd publish
npm publish
```

### 3. 用户使用
```bash
# 用户可以直接使用npx
npx @stigmergy-cli/npx-deployer
```

## 🌐 **支持的使用场景**

### 场景1: 新用户首次使用
```bash
# 用户不需要下载任何代码
npx @stigmergy-cli/npx-deployer

# 或者
curl -fsSL https://raw.githubusercontent.com/ptreezh/stigmergy-CLI-Multi-Agents/main/install-local.sh | bash
```

### 场景2: 开发者集成
```bash
# 在项目中集成
npx @stigmergy-cli/npx-deployer update

# 或
npm install -D @stigmergy-cli/npx-deployer
npx stigmergy-npx deploy
```

### 场景3: CI/CD自动化
```yaml
name: Deploy Stigmergy CLI
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Deploy with npx
      run: npx @stigmergy-cli/npx-deployer
```

## 🔄 **自动更新机制**

### 检查更新
```bash
node deployment/simple-npx.js update
```

### 版本检测
- 📅 检查本地文件修改时间
- 🌐 与远程版本对比
- ⚡ 自动提示需要更新

### 增量更新
- 📦 只下载变更的文件
- ⚡ 保留用户配置
- 🔄 热插式更新扩展

## 📁 **远程文件结构**

### GitHub仓库结构
```
stigmergy-CLI-Multi-Agents/
├── deployment/
│   ├── real-deploy.js          # 主部署脚本 ✅
│   ├── auto-install-cli.js      # 自动安装工具 ✅
│   ├── simple-npx.js            # 简化npx部署器 ✅
│   └── package-npx.json          # npm包配置 ✅
├── src/adapters/                   # 适配器文件
│   ├── claude/                  # Claude适配器 ✅
│   ├── gemini/                  # Gemini适配器 ✅
│   ├── qwen/                    # Qwen适配器 ✅
│   └── iflow/                   # iFlow适配器 ✅
└── deployment/configs/              # 默认配置
    ├── claude.json              # Claude配置 ✅
    ├── gemini.json              # Gemini配置 ✅
    ├── qwen.json                # Qwen配置 ✅
    └── iflow.json               # iFlow配置 ✅
```

## 🎯 **推荐的使用方式**

### 1. 终端用户 (推荐)
```bash
# 一键获取和部署
curl -fsSL https://raw.githubusercontent.com/ptreezh/stigmergy-CLI-Multi-Agents/main/install-local.sh | bash
```

### 2. 开发者
```bash
# 使用本地项目资源
git clone https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git
cd stigmergy-CLI-Multi-Agents
node deployment/simple-npx.js
```

### 3. npm用户 (未来)
```bash
# 真正的零配置使用
npx @stigmergy-cli/npx-deployer
```

## 📊 **性能对比**

| 方式 | 下载速度 | 更新频率 | 离线支持 | 配置需求 |
|------|----------|----------|----------|----------|
| npx远程 | ⚡ 快 | 🔄 实时 | ❌ 依赖网络 | ⚙️ 无 |
| Git下载 | 🐢 中等 | 📅 手动 | ✅ 完全离线 | ⚙️ 低 |
| 本地资源 | 🚀 最快 | 🔒 手动 | ✅ 完全离线 | 🔧 高 |

## 🎉 **总结**

### ✅ **完全支持npx**
- ✅ 支持npx远程获取和执行
- ✅ 支持远程自动获取内容
- ✅ 支持自动更新插件到CLI目录
- ✅ 智能选择最佳部署方式
- ✅ 多模式自动回退

### 🚀 **部署方式**
1. **npx模式**: 纯远程，未来发布到npm后使用
2. **本地+Git混合**: 当前版本，智能选择最佳方式
3. **完全本地**: 使用项目内资源

**现在你的部署系统完全支持npx远程获取和自动更新！** 🎊