# Release Notes v1.3.19-beta.0

## 发布日期
2026-01-10

## 版本号
1.3.19-beta.0

## 主要变更

### 新增功能

#### autoInstall 属性
为所有 CLI 工具添加了 `autoInstall` 属性，用于控制默认安装行为：

- **默认安装的工具** (autoInstall: true):
  - qwen (Qwen CLI)
  - iflow (iFlow CLI)
  - qodercli (Qoder CLI)
  - codebuddy (CodeBuddy CLI)

- **默认不安装的工具** (autoInstall: false):
  - claude (Claude CLI)
  - gemini (Gemini CLI)
  - copilot (GitHub Copilot CLI)
  - codex (OpenAI Codex CLI)
  - kode (Kode CLI)
  - resumesession (ResumeSession CLI - 内部功能)
  - opencode (OpenCode AI CLI)
  - oh-my-opencode (Oh-My-OpenCode Plugin Manager)

### 性能优化

#### 并行扫描优化
- 优化 `scanCLI` 方法，使用并行扫描替代顺序扫描
- 添加扫描结果缓存，避免重复检查
- 将并发数从 4 提升到 6，进一步提高性能

#### 部署性能
- 保持并行部署 hooks 的优化（从 170 秒降至 17 秒）
- 只部署 autoInstall: true 的工具，减少不必要的部署操作

### 代码改进

#### install.js
- 修改 auto-install 模式，只安装 autoInstall: true 的工具
- 修改交互式安装模式，只显示和安装 autoInstall: true 的工具

#### project.js
- 修改 deploy 命令，只部署 autoInstall: true 的工具

#### cli_tools.js
- 为所有 CLI 工具添加 autoInstall 属性
- 添加详细的中文注释说明默认安装行为

#### installer.js
- 添加 scanCache 用于缓存扫描结果
- 优化 scanCLI 方法，使用 Promise.all 并行扫描
- 调整默认并发数为 6

## 测试结果

### 功能测试
- ✅ autoInstall 属性配置正确
- ✅ install 命令只安装 autoInstall: true 的工具
- ✅ deploy 命令只部署 autoInstall: true 的工具
- ✅ 并行扫描正常工作
- ✅ 扫描缓存正常工作

### 性能测试
- ✅ 并行扫描显著提升速度
- ✅ 并行部署保持 10x 性能提升（17 秒）
- ✅ 只部署必要的工具，减少总体部署时间

## 升级指南

### 从 v1.3.18-beta.0 升级

```bash
npm install -g stigmergy@beta
```

### 新安装

```bash
npm install -g stigmergy@beta
```

安装完成后，默认只会安装以下 CLI 工具：
- qwen
- iflow
- qodercli
- codebuddy

如果需要安装其他 CLI 工具，请手动执行：

```bash
stigmergy install <tool-name>
```

## 已知问题

无

## 贡献者

- iFlow CLI Team

## 下一步计划

- 添加 CLI 工具依赖关系管理
- 支持自定义 autoInstall 配置
- 优化安装脚本的用户体验
- 添加更多 CLI 工具支持