# Stigmergy-CLI 自动安装指南

> 🚀 **指定CLI工具的自动下载、安装和部署**

## 🎯 支持的工具

目前工具配置了以下4个主流AI CLI工具：

| 工具 | 命令 | npm包名 | 状态 |
|------|------|----------|------|
| **Claude Code** | `claude --version` | `@anthropic-ai/claude-code` | ✅ 已验证 |
| **Google Gemini CLI** | `gemini --version` | `@google/gemini-cli` | ✅ 已验证 |
| **通义千问 CLI** | `qwen --version` | `@qwen-code/qwen-code` | ✅ 已验证 |
| **iFlow CLI** | `iflow --version` | `@iflow-ai/iflow-cli@latest` | ✅ 已验证 |

## 🚀 使用方法

### 1. 检查工具状态
```bash
cd deployment
node auto-install-cli.js check
```

### 2. 自动安装缺失的工具
```bash
node auto-install-cli.js auto-install
```

### 3. 手动安装控制
```bash
node auto-install-cli.js install
```

## 📋 功能详解

### 🔍 检查功能 (`check`)
- 检测指定的4个CLI工具是否已安装
- 显示每个工具的安装状态
- 提供安装建议

### 🤖 自动安装 (`auto-install`)
- 自动检测缺失的工具
- 使用npm全局安装缺失的CLI工具
- 验证安装结果
- 自动部署原生扩展

### 🔧 手动安装 (`install`)
- 显示未安装的工具列表
- 支持选择性安装
- 交互式选择要安装的工具

## ⚙️ 自定义配置

如果你想指定不同的CLI工具，可以修改 `auto-install-cli.js` 文件中的 `targetCLIs` 数组：

```javascript
this.targetCLIs = [
    {
        key: 'claude',
        name: 'Claude Code',
        npmPackage: '@anthropic-ai/claude-code',
        testCmd: 'claude --version',
        website: 'https://claude.ai/code',
        description: 'Anthropic Claude CLI工具'
    },
    // 在这里添加或修改CLI工具
    {
        key: 'your-cli',
        name: 'Your CLI Tool',
        npmPackage: '@your/package',
        testCmd: 'your-cli --version',
        website: 'https://your-website.com',
        description: '你的CLI工具描述'
    }
];
```

## 🔄 工作流程

1. **检测阶段**: 检查指定的CLI工具是否已安装
2. **安装阶段**: 使用npm全局安装缺失的工具
3. **验证阶段**: 验证安装是否成功
4. **部署阶段**: 自动部署原生CLI扩展

## 💡 使用示例

### 示例1: 全自动安装
```bash
# 检查当前状态
node auto-install-cli.js check

# 如果有缺失工具，自动安装
node auto-install-cli.js auto-install
```

### 示例2: 选择性安装
```bash
# 进入交互式安装模式
node auto-install-cli.js install

# 选择要安装的工具编号（例如: 1 3）
# 系统会自动安装选定的工具
```

### 示例3: 批量部署
```bash
# 在新机器上一键安装所有指定工具并部署
node auto-install-cli.js auto-install
```

## 🛠️ 故障排除

### 常见问题

#### 1. npm权限问题
```bash
# Linux/macOS
sudo npm install -g @anthropic-ai/claude-code

# Windows (以管理员身份运行PowerShell)
npm install -g @anthropic-ai/claude-code
```

#### 2. 网络连接问题
```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com/

# 临时使用镜像
npm install -g @anthropic-ai/claude-code --registry https://registry.npmmirror.com/
```

#### 3. 安装超时
- 检查网络连接
- 尝试单独安装每个包
- 清理npm缓存: `npm cache clean --force`

#### 4. 安装后检测失败
- 检查PATH环境变量
- 重启终端
- 验证npm全局安装目录

## 🔧 高级功能

### 批量部署到多台机器
1. 将项目代码复制到目标机器
2. 运行 `node auto-install-cli.js auto-install`
3. 验证安装结果

### CI/CD集成
```yaml
# .github/workflows/install-cli.yml
name: Install AI CLI Tools
on: [push]
jobs:
  install:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    - name: Install CLI Tools
      run: |
        cd deployment
        node auto-install-cli.js auto-install
```

## 📊 成功案例

### 实际运行结果
```
🚀 Stigmergy-CLI 指定工具自动安装器
==================================

🎯 目标工具:
   1. Claude Code (claude)
   2. Google Gemini CLI (gemini)
   3. 通义千问 CLI (qwen)
   4. iFlow CLI (iflow)

🔍 检查指定CLI工具的安装状态...

检查 Claude Code... ✅ 已安装
检查 Google Gemini CLI... ✅ 已安装
检查 通义千问 CLI... ✅ 已安装
检查 iFlow CLI... ✅ 已安装

📊 检查结果: 4/4 个工具已安装
```

---

## 🎉 总结

✅ **支持指定4个主流AI CLI工具**
✅ **自动检测和安装缺失工具**
✅ **自动部署原生扩展**
✅ **交互式选择安装**
✅ **完全自动化流程**

现在你可以一键安装指定的CLI工具并部署完整的跨CLI协作功能！ 🚀