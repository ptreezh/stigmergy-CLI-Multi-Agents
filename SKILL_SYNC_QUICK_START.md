# 🚀 Stigmergy 技能同步功能 - 快速开始指南

## 🎯 功能说明

Stigmergy 现在支持将安装的技能**自动同步**到所有支持 skills 的 AI CLI 工具！

### 支持的 CLI 工具

- ✅ **Claude CLI** (`@anthropic-ai/claude-code`)
- ✅ **Qwen CLI** (`@qwen-code/qwen-code`)
- ✅ **iFlow CLI** (`@iflow-ai/iflow-cli`)
- ✅ **Qoder CLI** (`@qoder-ai/qodercli`)
- ✅ **CodeBuddy CLI** (`@tencent-ai/codebuddy-code`)
- ✅ **OpenCode CLI**
- ✅ **Codex CLI** (`@openai/codex`)

---

## 📥 安装和同步（一键搞定）

### 方法 1：安装并自动同步（推荐）

```bash
# 安装技能并自动同步到所有 CLI 工具
stigmergy skill install vercel-labs/agent-skills --sync

# 或安装 Anthropic 官方技能
stigmergy skill install anthropics/skills --sync
```

**输出示例**：
```
[INFO] Installing skills from vercel-labs/agent-skills...

[OK] Successfully installed 15 skill(s)

[SYNC] Syncing skills to all CLI tools...

📦 pdf:
  ✓ claude
  ✓ qwen
  ✓ iflow
  ✓ qodercli
  ✓ codebuddy
  ✗ codex (CLI not installed)

✓ Synced to 5/7 CLI tools
```

### 方法 2：分步操作

```bash
# 1. 安装技能到 Stigmergy
stigmergy skill install vercel-labs/agent-skills

# 2. 同步所有技能到所有 CLI 工具
stigmergy skill sync-all

# 3. 检查同步状态
stigmergy skill sync-status
```

---

## 💡 常用命令

### 安装技能

```bash
# 从 GitHub 安装（简写格式）
stigmergy skill install vercel-labs/agent-skills

# 完整 GitHub URL
stigmergy skill install https://github.com/vercel-labs/agent-skills

# 带 --sync 自动同步
stigmergy skill install anthropics/skills --sync

# 强制覆盖已存在的技能
stigmergy skill install vercel-labs/agent-skills --force --sync
```

### 同步技能

```bash
# 同步所有技能
stigmergy skill sync-all

# 同步特定技能
stigmergy skill sync-to-cli pdf

# 只同步到特定 CLI 工具
stigmergy skill sync-to-cli pdf --clis claude,qwen

# 排除某些 CLI 工具
stigmergy skill sync-to-cli pdf --exclude codex

# 强制覆盖
stigmergy skill sync-to-cli pdf --force

# 预览操作（不实际执行）
stigmergy skill sync-all --dry-run
```

### 检查状态

```bash
# 查看已安装的技能
stigmergy skill list

# 检查同步状态
stigmergy skill sync-status

# 输出示例：
# 📊 Skill Deployment Status
#
# 📦 pdf:
#   ✓ claude: deployed
#   ✓ qwen: deployed
#   ✓ iflow: deployed
#   ✓ qodercli: deployed
#   ✗ codex: CLI not installed
#
# 📦 algorithmic-art:
#   ✓ claude: deployed
#   ✓ qwen: deployed
#   ✗ iflow: not deployed
#   ...
```

---

## 🔧 在各 CLI 工具中使用

### Claude CLI

```bash
# 列出技能
claude> list skills

# 使用技能
claude> use pdf skill to analyze document.pdf

# 或通过 Bash 命令读取
claude> Bash("stigmergy skill read pdf")
```

### Qwen CLI

```bash
# 使用已同步的技能
qwen> 使用 pdf 技能分析 document.pdf

# 或
qwen> Use pdf skill to analyze document.pdf
```

### iFlow CLI

```bash
# 使用技能
iflow> pdf 分析 document.pdf
```

### 其他 CLI 工具

所有支持 skills 的 CLI 工具都可以直接使用已同步的技能！

---

## 📊 技能目录结构

### 安装后的目录布局

```
~/.stigmergy/skills/           ← Stigmergy 统一存储
├── pdf/
│   ├── SKILL.md
│   └── ...
└── algorithmic-art/
    ├── SKILL.md
    └── ...

~/.claude/skills/               ← 同步到 Claude
├── pdf/
│   ├── SKILL.md
│   └── ...
└── algorithmic-art/
    ├── SKILL.md
    └── ...

~/.qwen/skills/                 ← 同步到 Qwen
├── pdf/
│   ├── SKILL.md
│   └── ...
└── ...

~/.iflow/skills/                ← 同步到 iFlow
~/.qodercli/skills/             ← 同步到 Qoder CLI
~/.codebuddy/skills/           ← 同步到 CodeBuddy
```

---

## 🎯 完整工作流示例

### 场景 1：安装并使用 Vercel AI Skills

```bash
# 1. 安装 Stigmergy
npm install -g stigmergy@beta

# 2. 安装技能并同步
stigmergy skill install vercel-labs/agent-skills --sync

# 3. 验证安装
stigmergy skill sync-status

# 4. 在 Claude 中使用
claude> list skills
claude> use react-best-practices skill to review my code

# 5. 在 Qwen 中使用
qwen> 使用 react-best-practices 技能审查代码

# 6. 在 iFlow 中使用
iflow> react-best-practices 审查
```

### 场景 2：安装多个技能源

```bash
# Vercel AI Skills
stigmergy skill install vercel-labs/agent-skills --sync

# Anthropic Skills
stigmergy skill install anthropics/skills --sync

# 自定义技能
stigmergy skill install mycompany/my-skills --sync

# 检查所有技能
stigmergy skill list

# 检查同步状态
stigmergy skill sync-status
```

### 场景 3：更新技能

```bash
# 更新技能（强制覆盖）
stigmergy skill install vercel-labs/agent-skills --force --sync

# 或单独重新同步
stigmergy skill sync-all --force
```

### 场景 4：选择性同步

```bash
# 只同步到 Claude 和 Qwen
stigmergy skill sync-to-cli pdf --clis claude,qwen

# 同步到所有工具，除了 Codex
stigmergy skill sync-to-cli pdf --exclude codex

# 同步所有技能
stigmergy skill sync-all --exclude codex,opencode
```

---

## 🔍 高级功能

### 1. 仅安装不同步

```bash
# 只安装到 Stigmergy，不同步
stigmergy skill install vercel-labs/agent-skills --no-sync

# 后续手动同步
stigmergy skill sync-all
```

### 2. 预览同步操作

```bash
# 预览不会实际执行
stigmergy skill sync-all --dry-run

# 输出：
# [DRY-RUN] Would sync 'pdf' to:
#   - claude
#   - qwen
#   - iflow
#   - qodercli
#   - codebuddy
```

### 3. 详细输出

```bash
# 显示详细日志
stigmergy skill sync-all --verbose
```

### 4. 检查特定技能状态

```bash
# 检查特定技能
stigmergy skill sync-status | grep -A 10 "pdf"
```

---

## 🛠️ 故障排除

### 问题 1：技能未同步到某个 CLI

```bash
# 检查 CLI 是否已安装
stigmergy status

# 手动同步特定技能
stigmergy skill sync-to-cli <skill-name> --force

# 检查目标目录
ls ~/.claude/skills/
ls ~/.qwen/skills/
```

### 问题 2：权限错误

**Windows**：
```powershell
# 以管理员身份运行 PowerShell
Start-Process PowerShell -Verb RunAs

# 然后再执行同步
stigmergy skill sync-all
```

**macOS/Linux**：
```bash
sudo stigmergy skill sync-all
```

### 问题 3：技能文件损坏

```bash
# 删除并重新同步
stigmergy skill remove pdf
stigmergy skill sync-to-cli pdf --force
```

---

## 📚 相关文档

- [完整部署指南](./SKILL_DEPLOYMENT_GUIDE.md)
- [Stigmergy 技能系统](./src/core/skills/)
- [各 CLI 工具文档]

---

## ✅ 最佳实践

### 1. 安装后立即同步

```bash
# 总是使用 --sync 标志
stigmergy skill install <source> --sync
```

### 2. 定期检查状态

```bash
# 定期检查同步状态
stigmergy skill sync-status
```

### 3. 使用有意义的技能名

```bash
# 好的做法
stigmergy skill install mycompany/react-skills --sync

# 避免
stigmergy skill install stuff --sync
```

### 4. 分组管理技能

```bash
# 按功能分组
stigmergy skill install vercel-labs/agent-skills --sync  # Web 开发
stigmergy skill install company/data-skills --sync        # 数据分析
stigmergy skill install company/ml-skills --sync            # 机器学习
```

---

## 🎉 总结

现在你可以：

1. ✅ **一次安装，到处使用**
   - 在 Stigmergy 中安装一次
   - 自动同步到所有 CLI 工具

2. ✅ **统一管理**
   - 一个命令管理所有技能
   - 一致的使用体验

3. ✅ **跨 CLI 共享**
   - Claude、Qwen、iFlow 等都能使用相同的技能
   - 无需在每个 CLI 中重复安装

4. ✅ **简单易用**
   - 一条命令完成安装和同步
   - 清晰的状态检查

**开始使用**：
```bash
npm install -g stigmergy@beta
stigmergy skill install vercel-labs/agent-skills --sync
```

🚀 Happy Coding!
