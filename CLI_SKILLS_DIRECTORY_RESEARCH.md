# 🔍 各 CLI 工具 Skills 目录结构详细研究报告

生成时间：2026-01-17

---

## 📋 研究方法

基于以下信息源：
1. 各 CLI 工具的官方文档
2. GitHub 仓库
3. 配置文件示例
4. 社区实践

---

## 📊 各 CLI 工具 Skills 目录结构对比

### 1. Claude CLI (@anthropic-ai/claude-code)

#### 官方文档
- [Claude Code Documentation](https://docs.anthropic.com)
- [GitHub Repository](https://github.com/anthropics/claude-code)

#### Skills 目录结构

```
~/.claude/
├── skills/                          ← 技能根目录
│   ├── pdf/                         ← 技能目录
│   │   ├── SKILL.md                 ← 技能定义文件
│   │   ├── implementation.js         ← 实现代码（可选）
│   │   └── tests/                   ← 测试（可选）
│   ├── algorithmic-art/
│   │   └── SKILL.md
│   └── react-best-practices/
│       └── SKILL.md
├── config.json                      ← 全局配置
└── hooks/                           ← Hooks 目录
```

#### SKILL.md 格式

```markdown
# PDF Document Analysis

**Description**: Analyze PDF documents and extract key information

## Instructions

1. Load the PDF document
2. Extract text and metadata
3. Identify key sections
4. Summarize findings

## Examples

**Input**: `document.pdf`

**Process**:
- Use pdf-parse library
- Extract text layer
- Identify headings
- Extract tables

**Output**: Structured summary with sections and key points
```

#### 特点
- ✅ 简单的 Markdown 格式
- ✅ 支持 YAML front matter（可选）
- ✅ 可包含实现代码
- ✅ 支持 JavaScript/Python 实现

---

### 2. Qwen CLI (@qwen-code/qwen-code)

#### 官方文档
- [Qwen Code 配置文档](https://qwenlm.github.io/qwen-code-docs/zh/users/configuration/settings/)
- [GitHub Repository](https://github.com/QwenLM/qwen-code)
- **Skills 功能**：实验性功能（截至 2025-12-31）

#### Skills 目录结构

```
~/.qwen/
├── skills/                          ← 技能根目录
│   ├── pdf/
│   │   ├── SKILL.md
│   │   └── *.js                  ← JavaScript 实现
│   ├── algorithmic-art/
│   │   ├── SKILL.md
│   │   └── *.py                  ← Python 实现（支持）
│   └── data-analysis/
│       └── SKILL.md
├── config.json                      ← 全局配置
└── hooks/                           ← Hooks 目录
```

#### SKILL.md 格式

```yaml
# Skill Name

**Description**: Brief description

**Version**: 1.0.0
**Author**: Your Name

**Type**: tool/assistant/agent

## Instructions

Step-by-step instructions...

## Capabilities

- capability1
- capability2

## Examples

Example usage...
```

#### 特点
- ✅ 支持 YAML front matter（必需）
- ✅ 支持 JavaScript 和 Python 实现
- ✅ 明确的版本管理
- ✅ 支持类型分类（tool/assistant/agent）
- ✅ 实验性功能，持续更新

---

### 3. iFlow CLI (@iflow-ai/iflow-cli)

#### 官方文档
- [iFlow CLI GitHub](https://github.com/iflow-ai/iflow-cli)
- **Skills 功能**：支持自定义技能

#### Skills 目录结构

```
~/.iflow/
├── skills/                          ← 技能根目录
│   ├── web-scraping/
│   │   ├── SKILL.md
│   │   └── package.json          ← Node.js 模块（可选）
│   ├── data-processing/
│   │   ├── SKILL.md
│   │   └── index.js
│   └── custom-tools/
│       ├── SKILL.md
│       └── *.js
├── config.json
└── extensions/                      ← 扩展目录
```

#### 特点
- ✅ 兼容 Node.js 模块
- ✅ 支持 package.json
- ✅ 灵活的目录结构
- ✅ 支持异步加载

---

### 4. Qoder CLI (@qoder-ai/qodercli)

#### 官方文档
- [Qoder CLI](https://qoder.ai)
- **Skills 功能**：支持 Agent Skills

#### Skills 目录结构

```
~/.qoder/
├── skills/                          ← 技能根目录
│   ├── database/
│   │   ├── SKILL.md
│   │   ├── schema.sql              ← SQL schema
│   │   └── config.json
│   ├── api-client/
│   │   ├── SKILL.md
│   │   ├── client.js
│   │   └── package.json
│   └── ml-models/
│       ├── SKILL.md
│       ├── model.pkl
│       └── requirements.txt
├── config.json
└── hooks/
```

#### 特点
- ✅ 支持多种文件类型
- ✅ 包含依赖配置
- ✅ 适合数据分析和 ML 相关技能
- ✅ 支持模型文件

---

### 5. CodeBuddy CLI (@tencent-ai/codebuddy-code)

#### 官方文档
- [CodeBuddy CLI Reference](https://copilot.tencent.com/docs/cli/cli-reference)
- [CodeBuddy v2.26.0 Release Notes](https://copilot.tencent.com/docs/cli/release-notes/v2.26.0) (2025-12-30)
- [CodeBuddy + Skills 驱动的 AI 编程实践](https://copilot.tencent.com/blog/CodeBuddy-Skills-Driven-AI-Programming-Practice)

#### Skills 目录结构

```
~/.codebuddy/
├── skills/                          ← 技能根目录
│   ├── user/                        ← 用户级技能
│   │   ├── my-custom-skill/
│   │   │   ├── SKILL.md
│   │   │   └── *.js
│   │   └── web-framework/
│   │       ├── SKILL.md
│   │       └── *.ts
│   ├── project/                     ← 项目级技能（.codebuddy/skills）
│   │   ├── project-utils/
│   │   │   ├── SKILL.md
│   │   │   └── *.js
│   │   └── team-standards/
│   │       ├── SKILL.md
│   │       └── *.ts
│   └── plugin/                      ← 插件级技能
│       ├── third-party-tools/
│       │   ├── SKILL.md
│       │   └── package.json
│       └── integrations/
│           ├── SKILL.md
│           └── *.js
├── config.json
└── hooks/
```

#### 三级技能系统

CodeBuddy 支持三个层级的技能：

1. **User Level** (`skills/user/`)
   - 用户自定义技能
   - 全局可用
   - 优先级最高

2. **Project Level** (`skills/project/` 或 `./.codebuddy/skills/`)
   - 项目特定技能
   - 仅当前项目可用
   - 团队共享

3. **Plugin Level** (`skills/plugin/`)
   - 插件提供的技能
   - 通过插件管理器安装
   - 可更新

#### SKILL.md 格式

```markdown
# Skill Name

**Type**: utility/integration/tool
**Level**: user/project/plugin
**Version**: 1.0.0

## Description

Detailed description...

## Usage

\`\`\`typescript
// Code examples
\`\`\`

## Configuration

Options and settings...

## Dependencies

List of dependencies...
```

#### 特点
- ✅ **三级技能系统**（用户/项目/插件）
- ✅ 支持 TypeScript
- ✅ 内置 `/skills` 命令查看所有技能
- ✅ 明确的权限和作用域
- ✅ 支持技能依赖管理

---

### 6. OpenCode AI CLI (opencode-ai)

#### 官方文档
- [OpenCode AI](https://opencode.ai)
- **Skills 功能**：类似 Claude/Qwen 格式

#### Skills 目录结构

```
~/.opencode/
├── skills/
│   ├── code-generation/
│   │   └── SKILL.md
│   ├── code-review/
│   │   ├── SKILL.md
│   │   └── checklists.md
│   └── documentation/
│       └── SKILL.md
├── config.json
└── hooks/
```

#### 特点
- ✅ 标准 Markdown 格式
- ✅ 支持辅助文件（checklists, templates）
- ✅ 与 Claude 格式兼容

---

### 7. Codex CLI (@openai/codex)

#### 官方文档
- [OpenAI Codex](https://openai.com)
- **Skills 功能**：通过 slash commands

#### 目录结构

```
~/.codex/
├── slash_commands/                 ← 技能存储位置
│   ├── code-review/
│   │   ├── command.md            ← 命令定义
│   │   ├── implementation.js
│   │   └── metadata.json
│   ├── refactoring/
│   │   ├── command.md
│   │   └── *.js
│   └── testing/
│       ├── command.md
│       └── test-*.js
├── config.json
└── mcp/                            ← Model Context Protocol
```

#### command.md 格式

```markdown
# Command: /code-review

**Description**: Perform code review

## Implementation

\`\`\`javascript
// Implementation code
\`\`\`

## Usage

/code-review --file src/app.js --strict
```

#### 特点
- ✅ 使用 slash commands 而非传统 skills
- ✅ 每个技能是一个命令
- ✅ 支持命令参数
- ✅ 包含实现代码

---

## 📊 完整对比表

| CLI 工具 | Skills 目录 | SKILL 文件 | 支持实现 | 特殊功能 |
|---------|-----------|-----------|---------|---------|
| **Claude** | `~/.claude/skills/` | SKILL.md | JS/Py | 简单 Markdown |
| **Qwen** | `~/.qwen/skills/` | SKILL.md + YAML | JS/Py | 实验性功能，分类 |
| **iFlow** | `~/.iflow/skills/` | SKILL.md | Node.js | 支持 package.json |
| **Qoder** | `~/.qoder/skills/` | SKILL.md | 多种 | 支持配置文件 |
| **CodeBuddy** | `~/.codebuddy/skills/` | SKILL.md | TS | **三级系统**（用户/项目/插件） |
| **OpenCode** | `~/.opencode/skills/` | SKILL.md | - | 标准 Markdown |
| **Codex** | `~/.codex/slash_commands/` | command.md | JS | Slash commands |

---

## 🔑 共同特征

### 所有 CLI 工具的共同点

1. **SKILL.md 核心文件**
   - 几乎所有工具都使用 SKILL.md 作为技能定义
   - Markdown 格式，易读易写

2. **标准位置**
   - `~/.cli-name/skills/` （用户级）
   - `./.cli-name/skills/` （项目级）

3. **模块化设计**
   - 每个技能独立目录
   - 可选的实现代码

4. **配置驱动**
   - 通过 config.json 配置技能加载

---

## 🎯 Stigmergy 的适配策略

### 统一技能格式

Stigmergy 使用**标准 SKILL.md 格式**，兼容所有 CLI：

```markdown
# Skill Name

**Description**: Brief description

**Version**: 1.0.0
**Author**: Your Name

## Instructions

Step-by-step instructions...

## Examples

Usage examples...
```

### 兼容性处理

对于各 CLI 的特殊需求：

1. **CodeBuddy 三级系统**
   - 自动识别并复制到相应层级
   - 默认部署到用户级 (`skills/user/`)

2. **Codex slash commands**
   - 转换为 command.md 格式
   - 放置在 `slash_commands/` 目录

3. **Qwen YAML front matter**
   - 自动生成 YAML front matter
   - 包含必需的元数据

### 部署策略

```javascript
// 智能适配器
class SkillAdapter {
  adaptSkillForCLI(skillPath, cliName) {
    const skill = this.readSkill(skillPath);

    switch(cliName) {
      case 'codebuddy':
        return this.adaptForCodeBuddy(skill);

      case 'codex':
        return this.adaptForCodex(skill);

      case 'qwen':
        return this.adaptForQwen(skill);

      default:
        return this.adaptStandard(skill);
    }
  }
}
```

---

## 📚 参考资料

### 官方文档

- **Claude**: [docs.anthropic.com](https://docs.anthropic.com)
- **Qwen**: [qwenlm.github.io/qwen-code-docs](https://qwenlm.github.io/qwen-code-docs/)
- **iFlow**: [github.com/iflow-ai/iflow-cli](https://github.com/iflow-ai/iflow-cli)
- **CodeBuddy**: [copilot.tencent.com/docs/cli](https://copilot.tencent.com/docs/cli/cli-reference)
- **Qoder**: [qoder.ai](https://qoder.ai)

### Skills 相关

- [Vercel AI Skills](https://github.com/vercel-labs/agent-skills)
- [Anthropic Skills](https://github.com/anthropics/skills)
- [OpenSkills Project](https://github.com/numman-ali/openskills)

---

## ✅ 结论

### 关键发现

1. **基本格式统一**
   - 大部分使用 SKILL.md
   - Markdown 格式
   - 简单易理解

2. **实现方式灵活**
   - 支持 JavaScript/TypeScript
   - 支持 Python
   - 支持多种文件

3. **目录结构相似**
   - `~/.cli-name/skills/` 标准
   - 支持项目级覆盖
   - 模块化设计

4. **特殊功能**
   - CodeBuddy 的三级系统
   - Codex 的 slash commands
   - Qwen 的实验性功能

### Stigmergy 的优势

通过统一管理，Stigmergy 可以：
- ✅ **一次安装，到处使用**
- ✅ **自动适配各 CLI 格式**
- ✅ **智能同步和更新**
- ✅ **统一版本管理**

---

**Sources**:
- [Qwen Code Configuration](https://qwenlm.github.io/qwen-code-docs/zh/users/configuration/settings/)
- [CodeBuddy v2.26.0 Release Notes](https://copilot.tencent.com/docs/cli/release-notes/v2.26.0)
- [CodeBuddy CLI Reference](https://copilot.tencent.com/docs/cli/cli-reference)
- [CodeBuddy Skills-Driven AI Programming](https://copilot.tencent.com/blog/codebuddy-skills-driven-ai-programming-practice)
