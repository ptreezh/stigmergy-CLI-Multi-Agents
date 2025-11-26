# Stigmergy-CLI npx远程部署指南

> 🚀 **支持npx远程获取、Git下载、自动更新的部署系统**

## 🌟 主要功能

### ✅ **完全远程部署**
- 通过npx直接从GitHub获取最新部署脚本
- 无需克隆整个仓库，只下载必要文件
- 自动检测最佳部署方式

### ✅ **多模式支持**
- **npx模式**: 远程获取并执行
- **Git模式**: 克隆完整仓库
- **更新模式**: 更新已有扩展

### ✅ **智能回退**
- 自动尝试多种部署方式
- 失败时自动切换到备用方案

## 🚀 使用方法

### 1. npx远程部署 (推荐)
```bash
# 直接运行npx部署器
node deployment/npx-deployer.js npx

# 或者直接通过npx执行（未来版本）
npx stigmergy-cli-npx-deployer
```

### 2. Git下载部署
```bash
node deployment/npx-deployer.js git
```

### 3. 自动更新扩展
```bash
node deployment/npx-deployer.js update
```

### 4. 智能部署（自动选择最佳方式）
```bash
node deployment/npx-deployer.js
```

## 🔧 工作原理

### npx远程模式
1. 🔍 从GitHub下载 `real-deploy.js`
2. 📦 下载到临时目录
3. 🚀 执行本地部署
4. 🧹 清理临时文件

### Git下载模式
1. 📥 克隆完整仓库到临时目录
2. 🚀 运行仓库中的部署脚本
3. 🧹 清理临时目录

### 更新模式
1. 🌐 获取最新适配器文件
2. ⚙️ 更新配置文件
3. 🔄 热插式更新扩展

## 📁 远程文件结构

### 支持的远程文件
```
stigmergy-CLI-Multi-Agents/
├── deployment/
│   ├── real-deploy.js           # 主部署脚本
│   └── auto-install-cli.js       # 自动安装工具
├── src/adapters/
│   ├── claude/                   # Claude适配器
│   ├── gemini/                   # Gemini适配器
│   ├── qwen/                     # Qwen适配器
│   └── iflow/                    # iFlow适配器
└── deployment/configs/
    ├── claude.json              # Claude默认配置
    ├── gemini.json              # Gemini默认配置
    ├── qwen.json                # Qwen默认配置
    └── iflow.json               # iFlow默认配置
```

## 🎯 使用场景

### 场景1: 新用户快速安装
```bash
# 一键部署，自动选择最佳方式
node deployment/npx-deployer.js
```

### 场景2: 已有用户更新扩展
```bash
# 只更新扩展文件，不重新部署
node deployment/npx-deployer.js update
```

### 场景3: 开发者测试最新版本
```bash
# 获取最新的远程代码并部署
node deployment/npx-deployer.js git
```

### 场景4: CI/CD集成
```bash
# 在CI/CD中自动部署
node deployment/npx-deployer.js npx
```

## ⚙️ 配置说明

### GitHub仓库配置
默认使用: `https://github.com/ptreezh/stigmergy-CLI-Multi-Agents`

如需使用私有仓库，修改 `npx-deployer.js` 中的配置：
```javascript
this.repoUrl = 'https://github.com/your-username/stigmergy-CLI-Multi-Agents';
this.rawUrl = 'https://raw.githubusercontent.com/your-username/stigmergy-CLI-Multi-Agents/main';
```

### 临时目录配置
默认临时目录: `~/.stigmergy-cli-temp`

可通过修改 `tempDir` 属性自定义。

## 🔄 更新流程

### 自动检测更新
```bash
# 系统会自动检测并更新
node deployment/npx-deployer.js update
```

### 手动强制更新
```bash
# 清理临时文件并重新下载
rm -rf ~/.stigmergy-cli-temp
node deployment/npx-deployer.js update
```

### 版本管理
部署器会自动：
- 检测本地版本
- 获取远程最新版本
- 执行增量更新
- 保留用户自定义配置

## 🛠️ 故障排除

### 常见问题

#### 1. 网络连接问题
```bash
# 检查GitHub连接
curl -I https://github.com/ptreezh/stigmergy-CLI-Multi-Agents

# 检查raw文件连接
curl -I https://raw.githubusercontent.com/ptreezh/stigmergy-CLI-Multi-Agents/main/README.md
```

#### 2. 权限问题
```bash
# 确保有写入权限
chmod -w $HOME
```

#### 3. Git克隆失败
```bash
# 检查Git配置
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

#### 4. Node.js版本问题
```bash
# 检查Node.js版本
node --version  # 需要 >= 14.0.0
```

### 调试模式
```bash
# 启用详细日志
DEBUG=* node deployment/npx-deployer.js
```

## 🚀 CI/CD集成

### GitHub Actions示例
```yaml
name: Deploy Stigmergy CLI
on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    - name: Deploy with npx
      run: |
        node deployment/npx-deployer.js npx
```

### Docker示例
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY . .
RUN node deployment/npx-deployer.js npx
```

## 📊 性能对比

### npx模式 vs Git模式

| 特性 | npx模式 | Git模式 |
|------|---------|---------|
| 下载速度 | ⚡ 快 | 🐢 慢 |
| 磀查完整性 | 🔄 部分 | ✅ 完整 |
| 网络要求 | 低 | 高 |
| 存储空间 | 💾 小 | 💾 大 |
| 更新频率 | 🔥 实时 | 📅 手动 |

## 🎉 总结

✅ **完全远程化部署**
✅ **多模式智能切换**
✅ **自动更新支持**
✅ **CI/CD友好**
✅ **故障自动恢复**

现在你可以完全通过npx远程获取和部署Stigmergy-CLI，无需手动下载任何文件！🚀