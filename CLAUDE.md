# CLAUDE.md

Stigmergy Cross-CLI Evolution Incubator — 把任何想法/项目/网站 → 可IM交互的专业技能包

**使命**: 解放用户从专业软件交互学习中，专注专业思维与方法论

---

## Critical Principles

### 🔴 原则0: 用户解放第一 【最高优先级】

所有设计必须回答：这个功能如何解放用户？
- ❌ 不增加软件学习负担 · ❌ 不要求用户记忆操作流程
- ✅ 让用户专注专业思维和方法论 · ✅ IM对话即获得专业能力

### 🔴 原则4: 严苛验证第一 【硬约束】

所有报告、声明和结论在发布前必须经过最严格的完整测试和验证。

**Verification Levels:**
- **Level 0**: 未验证 · **Level 1**: 代码/配置完成
- **Level 2**: 真实安装/部署完成 · **Level 3**: 真实功能测试通过 · **Level 4**: 生产环境验证

**Requirements:** Real Execution（禁止模拟） · Complete Verification（基本+边界+错误路径） · Strict Testing（多轮验证） · Honest Reporting（明确说明局限性）

**Gatekeeper:** `npm run gatekeeper` — 3项检查（完成等级/历史错误对照/局限性完整性）
Location: `.gates/GATEKEEPER.md` 和 `.gates/gatekeeper.js`

### Soul Evolution System

孵化器自主进化：双源记忆(Markdown+SQLite-vec) · 自主反思 · 持续进化 · 知识生产(多Agent辩论)

### 其他原则

CLI优先 · IM统一入口 · 技能可编排 · 自主进化

---

## Key Commands

```bash
# Dev
npm start              # 启动CLI
npm run build:orchestration  # 编译TS编排层
npm run dev            # Watch模式
npm run lint && npm run format

# Test
npm test               # 所有测试
npm run test:unit      # 单元+覆盖
npm run test:integration
npm run test:e2e
npm run test:quick     # 跳过E2E
npm run test:comprehensive

# Setup
stigmergy setup        # 完整安装+部署+初始化
stigger install        # 安装AI CLI工具
stigmergy scan         # 扫描可用CLI
stigmergy status       # 检查状态
```

---

## Architecture

### Entry Point
- `src/index.js` → `src/cli/router-beta.js` → `src/cli/commands/*.js`

### Layers

| Layer | 内容 |
|-------|------|
| **Layer 1** CLI Platform | `src/core/cli_tools.js` 定义10+CLI · `src/core/cli_path_detector.js` · `src/core/cli_adapters.js` |
| **Layer 2** Core Services | SmartRouter · Soul系统(`soul_manager.js`/`soul_knowledge_base.js`/`soul_skill_evolver.js`等) · `src/core/coordination/` |
| **Layer 3** Orchestration(TS) | `src/orchestration/core/CentralOrchestrator.ts` · GitWorktreeManager · EventBus · HookSystem · ResumeSessionIntegration |
| **Layer 4** Gateway | `src/gateway/` — IM统一网关(cc-connect: 飞书/TG/微信/QQ/钉钉/Slack/Discord/LINE) |
| **Layer 5** Skills | OpenSkills集成 · 搜索路径: `~/.stigmergy/skills` · `.agent/skills` · `.claude/skills` |

### Key Abstractions

- **Soul System** — 身份管理/记忆/反思/进化/对齐检查
- **Smart Router** — 意图分析→CLI选择→结果聚合 (`stigmergy call`)
- **CLI Adapters** — 交互模式/一次性模式 flag 标准化
- **Event Bus** — task.created/completed/failed · worktree.created · conflict.detected
- **Verification Gate** — Level 0-4完成验证，拦截虚假声明

### Skill Package Standard (孵化产出规范)

每个专业技能包必须包含: `SKILL.md` · `skill-manifest.json` · `CLI-PROVENANCE.md` · `SKILL-ORCHESTRATION.md` · `curriculum-packages/` · `.soul/`

### Incubation Flow

```
用户: "帮我做PLC教学系统"
→ 孵化器追问: "您有源码还是网站？"
→ CLI-Anything分析源码 → 生成 cli-openplc
→ 编排专业教学技能 plc-edu
→ IM通知: "✅ PLC教学技能已就绪"

用户: "教我PLC电机控制"
→ 路由到 plc-edu → 调用 cli-openplc → IM返回代码+解释+仿真结果
```

---

## Code Style Guidelines

### General
- ES2020+ · UTF-8 · 2 spaces · single quotes · **semicolons required**

### Naming Conventions
- **Files**: kebab-case (`cli-help-analyzer.js`)
- **Classes**: PascalCase (`MemoryManager`)
- **Functions/variables**: camelCase (`getUserConfig`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Private methods**: prefix `_` (`_initInternal`)

### Error Handling
- Always wrap async in try/catch
- Use `ErrorHandler` singleton — never swallow errors silently
- Propagate to main handler for CLI exit

### Function Design
- Target < 50 lines · Max 80-100 lines
- Use destructuring · Document params in JSDoc
- Use `null` instead of `undefined` for "no value"

---

## Important Files

| File | Purpose |
|------|---------|
| **SOUL.md** | 孵化器使命、架构、验证标准 **(READ THIS!)** |
| **CLAUDE.md** | 本文件 |
| **AGENTS.md** | AI coding agent guidelines |
| **README.md** | User-facing documentation |
| **.gates/GATEKEEPER.md** | Verification gate definition |

---

## Integrity Constraints

### Prohibited
- ❌ Falsifying citations, data, or results
- ❌ Intentionally misleading users
- ❌ Concealing important information
- ❌ Ex exaggerating capabilities or results

### Required
- ✅ Admit ignorance when uncertain
- ✅ Explicitly mark uncertain content
- ✅ Provide evidence for claims
- ✅ Immediately correct discovered errors

---

## GSD Workflow

Before editing files, start through a GSD command:
- `/gsd-quick` — small fixes, doc updates, ad-hoc tasks
- `/gsd-debug` — investigation and bug fixing
- `/gsd-execute-phase` — planned phase work

Do not make direct repo edits outside a GSD workflow unless user explicitly asks.
