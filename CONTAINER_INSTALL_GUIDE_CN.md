# 容器环境下安装 Stigmergy CLI 指南

## 问题说明

在容器环境（Docker、Podman等）下运行 `stigmergy install` 时失败，提示没有 sudo。

## ✅ 已解决

从 **v1.3.2-beta.0** 开始，Stigmergy CLI 完全支持**无需 sudo 的容器环境安装**。

## 新功能特性

### 1. 智能权限检测
- 自动检测多种权限提升工具：sudo、doas、run0、pkexec
- 容器环境下自动跳过权限要求
- 无需手动配置

### 2. 用户空间安装
- 安装到 `~/.npm-global/` 目录
- 不需要 root 权限
- 不影响系统目录

### 3. 自动 PATH 配置
- 自动添加到 `~/.bashrc`
- 自动添加到 `~/.zshrc`
- 自动添加到 `~/.profile`
- 避免重复添加

### 4. 智能回退
- 如果权限提升失败，自动使用用户空间安装
- 确保安装成功

## 使用方法

### 方法 1: 全局安装（推荐）

```bash
# 在开发机器上
cd D:/stigmergy-CLI-Multi-Agents
npm install -g .

# 然后在容器中使用
stigmergy install claude
```

### 方法 2: 在容器中直接使用

```bash
# 在容器中
cd /path/to/stigmergy-CLI-Multi-Agents
npm link

# 现在可以使用安装命令
stigmergy install claude
stigmergy install gemini
stigmergy install qwen
```

## 安装流程演示

```bash
$ stigmergy install claude

[INFO] 扫描 AI CLI 工具...
[INFO] 检查 Claude CLI...
[INFO] Unix: 检查权限提升方法...
[WARN] 未找到权限提升工具 (sudo, doas, run0, pkexec)
[INFO] 将在用户目录下进行无需特权的安装
[INFO] 正在安装 Claude CLI (claude)...
[INFO] 安装到用户目录: /home/user/.npm-global
[INFO] 命令: npm install -g --prefix "/home/user/.npm-global" @anthropic-ai/claude-code
[SUCCESS] 成功安装 Claude CLI 到用户目录
[INFO] ⚠️  请确保将 bin 目录添加到您的 PATH:
[INFO]    export PATH="/home/user/.npm-global/bin:$PATH"
[INFO] 已添加到 .bashrc
[INFO] 已添加到 .zshrc
[INFO] 已添加到 .profile
[INFO] 安装完成！请运行以下命令重新加载 shell 配置:
[INFO]    source ~/.bashrc
[INFO]    或者重启终端
```

## 安装后配置

### 1. 重新加载 Shell 配置

```bash
# 对于 Bash
source ~/.bashrc

# 对于 Zsh
source ~/.zshrc

# 或者重启终端
```

### 2. 验证安装

```bash
# 检查 PATH
echo $PATH
# 应该包含 /home/user/.npm-global/bin

# 测试 CLI 工具
claude --version
gemini --version
qwen --version
```

## 支持的容器环境

| 容器类型 | 是否支持 | 说明 |
|---------|---------|------|
| Docker | ✅ | 完全支持 |
| Podman | ✅ | 完全支持 |
| LXC/LXD | ✅ | 完全支持 |
| Kubernetes Pod | ✅ | 完全支持 |
| WSL2 | ✅ | 完全支持 |
| Live USB | ✅ | 完全支持 |
| 最小 Linux 发行版 | ✅ | 完全支持 |

## 目录结构

安装后的目录结构：

```
~/.npm-global/
├── bin/
│   ├── claude          -> Claude CLI 可执行文件
│   ├── gemini          -> Gemini CLI 可执行文件
│   ├── qwen            -> Qwen CLI 可执行文件
│   ├── iflow           -> iFlow CLI 可执行文件
│   ├── qodercli        -> Qoder CLI 可执行文件
│   ├── codebuddy       -> CodeBuddy CLI 可执行文件
│   ├── copilot         -> Copilot CLI 可执行文件
│   ├── codex           -> Codex CLI 可执行文件
│   └── kode            -> Kode CLI 可执行文件
├── lib/
│   └── node_modules/
│       ├── @anthropic-ai/claude-code/
│       ├── @google/gemini-cli/
│       └── ...
└── etc/
```

## 手动配置（如果自动配置失败）

### 1. 创建 npm 全局目录

```bash
mkdir -p ~/.npm-global
```

### 2. 配置 npm

```bash
npm config set prefix '~/.npm-global'
```

### 3. 手动添加 PATH

编辑 `~/.bashrc`：

```bash
echo 'export PATH="~/.npm-global/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

## 故障排除

### 问题 1: 命令未找到

**症状**: 安装后运行 `claude` 提示 "command not found"

**解决方案**:
```bash
# 重新加载 shell 配置
source ~/.bashrc

# 或者手动添加 PATH
export PATH="~/.npm-global/bin:$PATH"
```

### 问题 2: 权限错误

**症状**: 安装时提示权限错误

**解决方案**:
```bash
# 确保 home 目录可写
chmod u+w ~

# 创建 .npm-global 目录
mkdir -p ~/.npm-global
chmod u+rwx ~/.npm-global
```

### 问题 3: npm 版本过低

**症状**: `--prefix` 参数不支持

**解决方案**:
```bash
# 更新 npm
npm install -g npm@latest
```

### 问题 4: 重复的 PATH 条目

**症状**: PATH 中有重复的条目

**解决方案**:
```bash
# 清理 .bashrc 中的重复条目
sed -i '/# Stigmergy CLI PATH/d' ~/.bashrc
sed -i '/export PATH=".*\.npm-global.*:$PATH"/d' ~/.bashrc

# 重新运行安装
stigmergy install claude
```

## Docker 示例

### Dockerfile 示例

```dockerfile
FROM node:20-alpine

# 安装 Stigmergy CLI
WORKDIR /app
COPY . /app/
RUN npm install -g .

# 配置 npm 全局目录
RUN mkdir -p ~/.npm-global && \
    npm config set prefix '~/.npm-global'

# 添加 PATH 到环境变量
ENV PATH="$HOME/.npm-global/bin:$PATH"

# 安装 AI CLI 工具（无需 sudo）
RUN stigmergy install claude && \
    stigmergy install gemini && \
    stigmergy install qwen

# 验证安装
RUN claude --version && \
    gemini --version && \
    qwen --version

CMD ["stigmergy", "scan"]
```

### docker-compose.yml 示例

```yaml
version: '3.8'
services:
  stigmergy:
    build: .
    volumes:
      - ./data:/app/data
    environment:
      - PATH=/root/.npm-global/bin:/usr/local/bin:/usr/bin:/bin
    command: stigmergy scan
```

## 性能优化

### 1. 使用 npm 缓存

```bash
# 在容器中配置 npm 缓存
mkdir -p ~/.npm
npm config set cache ~/.npm
```

### 2. 预装常用包

```dockerfile
# 在 Dockerfile 中预装常用 CLI 工具
RUN npm install -g @anthropic-ai/claude-code && \
    npm install -g @google/gemini-cli && \
    npm install -g @qwen/cli
```

### 3. 使用 .npmrc 配置

```bash
# 创建 ~/.npmrc
cat > ~/.npmrc << EOF
prefix=~/.npm-global
cache=~/.npm/cache
progress=false
EOF
```

## 验证安装

运行验证测试：

```bash
# 检查安装逻辑
node /app/test-linux-install-fix.js

# 检查容器安装
node /app/test-container-install.js

# 扫描已安装的工具
stigmergy scan

# 查看详细状态
stigmergy status
```

## 技术细节

### 权限检测流程

```
1. 检查平台 (Windows/Linux/Mac)
2. 尝试检测权限提升工具:
   - sudo -n true (密码less)
   - doas -n true
   - run0 -n true
   - pkexec --help
3. 如果找到工具:
   - 检查是否需要密码
   - 使用该工具进行安装
4. 如果未找到工具:
   - 使用用户空间安装
   - 安装到 ~/.npm-global
   - 自动配置 PATH
```

### 用户空间安装命令

```bash
# 原始命令 (需要 sudo)
sudo npm install -g @anthropic-ai/claude-code

# 用户空间命令 (无需 sudo)
npm install -g --prefix ~/.npm-global @anthropic-ai/claude-code
```

## 相关文档

- `CHANGELOG.md` - 版本更新记录
- `LINUX_INSTALLATION_GUIDE.md` - Linux 安装完整指南
- `test-container-install.js` - 容器安装测试
- `test-linux-install-fix.js` - Linux 安装修复测试

## 获取帮助

如果遇到问题：

1. 运行诊断命令: `stigmergy status`
2. 查看详细日志: `stigmergy --verbose install claude`
3. 运行测试: `node test-container-install.js`
4. 检查配置: `cat ~/.bashrc | grep PATH`

---

**版本**: 1.3.2-beta.0
**更新日期**: 2025-12-24
**状态**: ✅ 完全支持容器环境安装
