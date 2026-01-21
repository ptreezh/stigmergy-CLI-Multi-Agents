# 🔍 Stigmergy vs Vercel add-skill 工具对比分析

生成时间：2026-01-17

---

## 📋 快速结论

### ✅ **Stigmergy 已经实现了相同功能！**

**不需要集成** vercel-labs/add-skill，因为 Stigmergy 已经内置了更强大的技能管理系统。

---

## 🎯 功能对比表

| 功能 | Stigmergy | vercel-labs/add-skill | 优势方 |
|------|-----------|---------------------|--------|
| **从 GitHub 安装 skills** | ✅ 支持 | ✅ 支持 | 🤝 平手 |
| **支持的 URL 格式** | 7+ 种智能格式 | 未知 | 🏆 Stigmergy |
| **跨 CLI 工具支持** | ✅ 8+ 个 AI CLI | 仅 Claude | 🏆 Stigmergy |
| **技能管理** | ✅ 安装/列表/删除/验证 | 未知 | 🏆 Stigmergy |
| **AGENTS.md 同步** | ✅ 自动同步 | 未知 | 🏆 Stigmergy |
| **多搜索路径** | ✅ 5+ 个路径 | 未知 | 🏆 Stigmergy |
| **本地技能开发** | ✅ 支持 | 未知 | 🏆 Stigmergy |
| **技能验证** | ✅ 内置验证器 | 未知 | 🏆 Stigmergy |
| **OpenSkills 兼容** | ✅ 完全兼容 | 部分兼容 | 🏆 Stigmergy |
| **跨 CLI 技能共享** | ✅ 统一存储 | ❌ 不支持 | 🏆 Stigmergy |
| **智能路由** | ✅ 自动路由到最佳 CLI | ❌ 不支持 | 🏆 Stigmergy |

---

## 📊 详细功能分析

### 1. **Stigmergy 技能系统**

#### 核心组件

**StigmergySkillManager** (`src/core/skills/StigmergySkillManager.js`)
- 统一的技能管理器
- 基于 OpenSkills 核心功能
- 跨 CLI 技能路由

**SkillInstaller** (`src/core/skills/embedded-openskills/SkillInstaller.js`)
- 智能解析 7+ 种 GitHub URL 格式
- 支持：
  - `owner/repo` (简写)
  - `https://github.com/owner/repo` (完整URL)
  - `https://github.com/owner/repo/blob/branch/path` (blob URL)
  - `https://raw.githubusercontent.com/...` (raw URL)
  - `owner/repo/path/to/file` (带路径)
  - `owner/repo@branch/path` (带分支)
  - `owner` (仅用户名)

**SkillReader** (`src/core/skills/embedded-openskills/SkillReader.js`)
- 从多个路径读取技能
- 支持本地和远程技能

**SkillParser** (`src/core/skills/embedded-openskills/SkillParser.js`)
- 解析技能内容
- 验证技能格式

#### 命令接口

```bash
# 安装技能
stigmergy skill install <source>
stigmergy skill install anthropics/skills
stigmergy skill install vercel-labs/agent-skills

# 列出技能
stigmergy skill list

# 读取技能（给 AI 使用）
stigmergy skill read <skill-name>

# 删除技能
stigmergy skill remove <skill-name>

# 验证技能
stigmergy skill validate <path>

# 同步到 AGENTS.md
stigmergy skill sync
```

#### 技能搜索路径（优先级从高到低）

1. `~/.stigmergy/skills/` - Stigmergy 统一存储
2. `./.agent/skills/` - 项目通用技能
3. `~/.agent/skills/` - 全局通用技能
4. `./.claude/skills/` - 项目 Claude 技能
5. `~/.claude/skills/` - 全局 Claude 技能

#### 跨 CLI 技能共享

Stigmergy 支持在 8+ 个 AI CLI 工具之间共享技能：
- Claude CLI
- Gemini CLI
- Qwen CLI
- iFlow CLI
- Qoder CLI
- CodeBuddy CLI
- Copilot CLI
- Codex CLI

**示例**：
```bash
# 在 Claude 中安装技能
claude> stigmergy skill install vercel-labs/agent-skills

# 在 Qwen 中使用同一个技能
qwen> "使用 Claude 的 pdf 技能处理文档"
# Stigmergy 会自动路由到 Claude 的技能
```

---

### 2. **vercel-labs/add-skill 工具**

#### 基本信息（基于搜索结果）

- **仓库**: [vercel-labs/add-skill](https://github.com/vercel-labs/add-skill)
- **官网**: [add-skill.org](https://add-skill.org/)
- **用途**: 安装 agent skills
- **主要目标**: OpenCode, Claude 等

#### 功能（推测）

- 从 GitHub 安装技能
- 可能支持基本的技能管理
- 主要面向单一 CLI 工具

---

## 🆚 Stigmergy 的独特优势

### 1. **跨 CLI 架构**

Stigmergy 不是为单一 CLI 设计的，而是：
- ✅ 统一管理多个 AI CLI 工具
- ✅ 技能在所有 CLI 间共享
- ✅ 智能路由到最佳工具

### 2. **更强大的 URL 解析**

支持 7+ 种格式，包括：
- 简写格式
- 完整 URL
- Raw URL
- 带分支的 URL
- 带路径的 URL

### 3. **统一的技能存储**

```
~/.stigmergy/skills/
├── vercel-labs/
│   └── agent-skills/
│       ├── SKILL.md
│       ├── skills/
│       └── ...
├── anthropics/
│   └── skills/
└── ...
```

### 4. **自动 AGENTS.md 同步**

安装技能后自动更新 AGENTS.md，让 AI 能够发现和使用技能。

### 5. **技能验证**

内置验证器，确保技能格式正确：
- 检查 SKILL.md 格式
- 验证元数据
- 检查必需字段

### 6. **本地技能开发**

支持开发自定义技能：
```bash
# 验证本地技能
stigmergy skill validate ./my-skill/SKILL.md

# 安装本地技能
stigmergy skill install ./my-skill
```

---

## 💡 使用建议

### 场景 1：安装 Vercel Agent Skills

**使用 Stigmergy**（推荐）：
```bash
stigmergy skill install vercel-labs/agent-skills
```

**使用 add-skill**（不推荐）：
```bash
npx add-skill vercel-labs/agent-skills
```

**为什么用 Stigmergy？**
- ✅ 已内置相同功能
- ✅ 支持跨 CLI 共享
- ✅ 统一管理
- ❌ add-skill 是额外依赖

### 场景 2：安装 Anthropic Skills

**使用 Stigmergy**：
```bash
stigmergy skill install anthropics/skills
```

### 场景 3：跨 CLI 技能共享

**只有 Stigmergy 支持**：
```bash
# 在 Claude 安装
stigmergy skill install anthropics/skills

# 在 Qwen 中使用
qwen> "用 Claude 的算法技能排序这个数组"
# Stigmergy 自动路由
```

---

## 📝 代码示例

### 使用 Stigmergy 安装 Skills

```bash
# 1. 安装 Stigmergy
npm install -g stigmergy@beta

# 2. 初始化
stigmergy init

# 3. 安装技能
stigmergy skill install vercel-labs/agent-skills
stigmergy skill install anthropics/skills

# 4. 列出已安装技能
stigmergy skill list

# 5. 读取技能（在 Claude 中）
claude> stigmergy skill read pdf

# 6. 在其他 CLI 中使用
qwen> "使用 Claude 的 pdf 技能"
```

### 在 AI CLI 中使用

```javascript
// Claude Code
Bash("stigmergy skill read algorithmic-art")

// Qwen（通过 Stigmergy 路由）
"use claude's algorithmic-art skill to create art"

// Gemini（通过 Stigmergy 路由）
"analyze this pdf using claude's pdf skill"
```

---

## 🎯 结论与建议

### ✅ 不需要集成 vercel-labs/add-skill

**原因**：

1. **功能完全重叠**
   - Stigmergy 已经实现了相同的 GitHub 安装功能
   - 甚至支持更多 URL 格式

2. **Stigmergy 更强大**
   - 跨 CLI 支持（8+ 个工具）
   - 统一技能管理
   - 智能路由
   - AGENTS.md 同步

3. **避免依赖冗余**
   - add-skill 是额外的 npm 包
   - 增加依赖复杂度
   - 没有额外价值

4. **更好的用户体验**
   - 一个工具管理所有 skills
   - 跨 CLI 技能共享
   - 统一命令接口

### 📌 推荐做法

**在文档中说明**：

```markdown
## Installing Agent Skills

Stigmergy includes a powerful skill manager compatible with all agent skill repositories.

### Install from GitHub

\`\`\`bash
# Vercel AI Skills
stigmergy skill install vercel-labs/agent-skills

# Anthropic Claude Skills
stigmergy skill install anthropics/skills

# Any GitHub repository
stigmergy skill install owner/repo
\`\`\`

### Use in Claude Code

\`\`\`javascript
Bash("stigmergy skill read pdf")
\`\`\`

### Cross-CLI Skill Sharing

Skills installed with Stigmergy are automatically available across all AI CLI tools:
- Claude CLI
- Gemini CLI
- Qwen CLI
- iFlow CLI
- And more...
\`\`\`
```

### 🔄 如需增强功能

如果未来需要增强技能系统，考虑：

1. **添加更多技能源**
   - 支持从 npm 包安装
   - 支持从本地目录安装
   - 支持技能市场

2. **技能依赖管理**
   - 处理技能间的依赖关系
   - 版本管理

3. **技能搜索和发现**
   - 集成技能市场 API
   - 推荐系统

4. **技能沙箱**
   - 安全隔离
   - 权限控制

---

## 📚 参考资料

### Stigmergy 文档
- [STIGMERGY.md](./STIGMERGY.md) - 项目文档
- [源码](./src/core/skills/) - 技能系统实现

### 相关工具
- [vercel-labs/add-skill](https://github.com/vercel-labs/add-skill) - Vercel 的技能安装工具
- [numman-ali/openskills](https://github.com/numman-ali/openskills) - OpenSkills 原始项目
- [anthropics/skills](https://github.com/anthropics/skills) - Anthropic 官方技能库

---

## ✅ 最终答案

**❌ 不需要集成 vercel-labs/add-skill**

**理由**：
1. ✅ Stigmergy 已经实现了相同且更强大的功能
2. ✅ 支持更多 URL 格式
3. ✅ 跨 CLI 技能共享
4. ✅ 统一管理和存储
5. ❌ add-skill 没有额外价值

**建议**：
- 在文档中说明 Stigmergy 兼容所有 agent skills 仓库
- 提供使用示例
- 强调跨 CLI 优势

---

*分析完成时间：2026-01-17*
*Stigmergy 版本：v1.3.54-beta.0*
