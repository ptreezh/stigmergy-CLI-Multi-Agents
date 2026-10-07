# 场景教程 1：三个 AI Agent 协作完成同一个项目

> 难度：入门  
> 预计时间：10 分钟  
> 适用：同时使用 Claude、Qwen、Gemini 的开发者

## 问题

你在做一个中英双语文档项目：

- Claude Code 擅长架构设计和英文技术写作
- Qwen CLI 擅长中文润色和本地化
- Gemini CLI 擅长代码审查和多模态检查

传统做法：你分别调用三个工具，手动复制上下文，拼装结果。

## Stigmergy 方案

```bash
# 1. 进入项目目录
cd D:/my-project

# 2. 一条命令，三个 agent 协作
stigmergy call "review the architecture, translate README to Chinese, and validate all code examples"
```

Stigmergy 会：

1. 将任务拆解为适合三个 agent 的子任务
2. 自动注入项目上下文（`.stigmergy/` 中的状态）
3. 并行或顺序执行
4. 汇总结果

## 实际效果

```bash
$ stigmergy call "review architecture, translate README to Chinese, validate code examples"
🎯 Routing to Claude (architecture) → Qwen (translation) → Gemini (validation)

[Claude]   Reviewed 12 modules, suggested 3 refactors
[Qwen]     Translated README.md → README.zh.md (2,340 chars)
[Gemini]   Validated 18 code examples: 17 passed, 1 fix applied

✅ All done. One command, three agents, zero manual handoffs.
```

## 关键配置

项目级 `.stigmergy/config.json`：

```json
{
  "agents": {
    "claude": { "role": "architect", "priority": 1 },
    "qwen": { "role": "localization", "priority": 2 },
    "gemini": { "role": "reviewer", "priority": 3 }
  },
  "skills": ["pdf", "markdown-lint", "translation"]
}
```

## 进阶：持久化团队配置

将 `config.json` 提交到 Git，团队成员共享同一套 agent 分工和技能列表。

---

# 场景教程 2：团队共享 AI 技能库

> 难度：入门  
> 预计时间：5 分钟  
> 适用：团队 multiple AI CLI users

## 问题

团队里有人用 Claude，有人用 Qwen，有人用 Cursor。同一个 skill（比如 `pdf`、`react-best-practices`）被重复安装在不同目录：

```
~/.claude/skills/pdf/
~/.qwen/skills/pdf/
~/.cursor/skills/pdf/
```

版本不一致、维护困难、新人上手成本高。

## Stigmergy 方案

```bash
# 1. 将技能安装到中央目录
stigmergy skill install owner/pdf-skills

# 2. 自动同步到所有 agent
stigmergy skill sync

# 3. 验证
stigmergy skill list
```

**安装一次，所有 agent 自动生效。**

## 实际效果

```bash
$ stigmergy skill install vercel-labs/agent-skills
📦 Installing skill: vercel-labs/agent-skills
✅ Installed to ~/.stigmergy/skills/agent-skills/

$ stigmergy skill sync
🔄 Syncing to 10 CLI tools...
  ✓ claude     → ~/.claude/skills/agent-skills/
  ✓ qwen       → ~/.qwen/skills/agent-skills/
  ✓ gemini     → ~/.gemini/skills/agent-skills/
  ✓ codex      → ~/.codex/skills/agent-skills/
  ✓ copilot    → ~/.copilot/skills/agent-skills/
  ✓ cursor     → ~/.cursor/skills/agent-skills/
  ✓ opencode   → ~/.opencode/skills/agent-skills/
  ✓ workbuddy  → ~/.workbuddy/skills/agent-skills/
  ✓ marvis     → ~/.marvis/skills/agent-skills/
  ✓ doubao     → ~/.doubao/skills/agent-skills/

✅ Synced to 10/10 tools
```

## 关键配置

中央技能目录：`~/.stigmergy/skills/`

每个 agent 的本地目录自动同步。更新中央技能，所有 agent 自动获得最新版本。

---

# 场景教程 3：远程控制 AI 团队

> 难度：中级  
> 预计时间：15 分钟  
> 适用：需要移动办公或远程管理的团队

## 问题

你在通勤路上突然想到一个任务，需要 Claude 执行。但 Claude 跑在你的台式机上。

传统方案：VPN + SSH + 手动执行。复杂且不安全。

## Stigmergy 方案

```bash
# 1. 在台式机上启动 Gateway
stigmergy gateway --feishu --port 3000

# 2. 在手机上飞书发送消息
@AI-Stigmergy 分析 D:/powerSale 的销售数据，生成周报

# 3. 本机 Claude 自动执行，结果推送到飞书
```

## 实际效果

```
You: @AI-Stigmergy 分析 D:/powerSale 的销售数据，生成周报

Stigmergy Bot: 🎯 Routing to Claude on desktop...
[Claude]   Analyzed 1,247 orders from last 7 days
[Claude]   Generated: weekly-report-2026-10-07.md
[Stigmergy] ✅ Report delivered to this chat
```

## 安全配置

- Token 验证：所有 webhook 必须携带有效 token
- 命令白名单：可限制允许执行的命令范围
- 审计日志：所有远程执行记录在案
- 速率限制：防止滥用

## 进阶：多平台同时接入

```bash
stigmergy gateway \
  --feishu \
  --telegram \
  --slack \
  --discord \
  --port 3000
```

一个 Gateway，四个平台同时可用。
