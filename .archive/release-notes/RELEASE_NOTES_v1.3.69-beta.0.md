# 发布 stigmergy@1.3.69-beta.0 说明

## 当前状态
- 版本已更新到 1.3.69-beta.0
- 修复了 opencode 中的 resumesession 功能
- 所有代码更改已提交到本地仓库
- 包已通过本地验证

## 发布步骤

### 1. 登录到 npm
```bash
npm login
```

### 2. 发布 beta 版本
```bash
npm publish --tag beta
```

### 3. 推送到远程仓库
```bash
git push origin main
```

## 验证发布

发布后，可以通过以下方式验证：

```bash
npm view stigmergy@beta version
# 或
npm view stigmergy version
```

## 安装测试

用户可以通过以下方式安装新版本：

```bash
npm install -g stigmergy@beta
# 或
npm install -g stigmergy@1.3.69-beta.0
```

## 主要变更

此版本包括以下重要变更：

### 1. 修复 opencode 的 resumesession 功能
- 修复了 opencode 中 `/resumesession` 命令无法正常工作的问题
- 之前显示 "user interrupted" 消息，现在能正确恢复跨 CLI 会话记忆
- 为 `skills/resumesession/opencode-resume.js` 添加了缺失的主执行函数
- 支持各种命令行参数如 `--cli`、`--detailed`、`--summary`、`--limit`、`--list` 等

### 2. 改进跨 CLI 会话恢复
- 现在可以在 opencode 中使用 `/resumesession` 来恢复所有支持的 CLI 工具的会话
- 支持 claude, gemini, qwen, iflow, codebuddy, codex, qodercli, opencode 等工具的会话恢复
- 提供统一的会话管理和记忆恢复体验

### 3. 增强用户体验
- 修复后的功能使用户能够在 opencode 环境中无缝访问历史会话内容
- 改进了错误处理和反馈机制
- 提供更清晰的命令使用说明

## 测试覆盖

### 功能测试
- ✅ opencode-resume.js 主执行函数正常工作
- ✅ 命令行参数解析正常
- ✅ 不同 CLI 工具的会话恢复正常
- ✅ 各种输出格式（detailed, summary, list）正常

### 集成测试
- ✅ 在 opencode 环境中可以正常使用 `/resumesession` 命令
- ✅ 跨 CLI 会话恢复功能正常工作
- ✅ 会话内容正确显示

## 使用示例

### 1. 安装 beta 版本
```bash
npm install -g stigmergy@beta
```

### 2. 在 opencode 中使用 resumesession
```bash
# 恢复最近的会话上下文
/resumesession

# 恢复特定 CLI 的会话
/resumesession --cli claude

# 查看详细会话信息
/resumesession --detailed

# 列出所有会话
/resumesession --list
```

## 已知问题

无

## 下一步计划

1. 添加更多 CLI 工具的支持
2. 优化会话搜索和过滤功能
3. 增强会话数据的持久化存储
4. 改进用户界面和交互体验

## 贡献者

- iFlow CLI
- Claude
- Qwen
- 其他 AI 系统

## 许可证

MIT