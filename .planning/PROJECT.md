# Stigmergy Soul 自主进化系统

## What This Is

跨CLI智能孵化器 — 通过IM对话让用户获得专业能力，Soul具备自主反思、学习、进化能力。当前处于cycle_3，聚焦修复Soul进化的系统性障碍。

## Core Value

**用户只需IM对话，专业能力即刻获得。** Soul持续自主进化，让孵化能力不断提升。

## Requirements

### Validated

- ✓ 多AI CLI协调执行 — 已验证
- ✓ 技能包孵化流水线 — 已验证
- ✓ Soul双源记忆 (Markdown + SQLite-vec) — 已验证
- ✓ Gatekeeper Verification Gate — Level 2 已部署

### Active

- [ ] 修复Soul进化的系统性障碍 — 11个空catch块、连续失败100+次
- [ ] 恢复Gatekeeper与CI/进化循环集成
- [ ] 实现Soul进化的错误恢复机制
- [ ] 完成WeChat集成（TODO占位）

### Out of Scope

- 新孵化技能包 — 待Soul进化修复后推进
- 多语言i18n — 优先级低于核心进化
- 移动端界面 — 纯CLI优先

## Context

**Soul进化状态 (memory/):** cycle_3，eb-edu/medusa CLI↔backend已验证。

**关键发现 (CONCERNS.md):**
- 11个空catch块静默吞错误，核心模块无错误恢复
- Soul连续100+次进化失败 (2026-03-07起)
- Gatekeeper未集成CI/进化循环
- 错误恢复机制缺失于scheduler、merger、task planner

**使命 (SOUL.md):**
孵化器三层架构：CLI平台层 → Stigmergy核心孵化包 → 基础/专业技能层

## Constraints

- **Tech**: Node.js >= 16, TypeScript orchestration, ESM/CommonJS混合
- **Evolution**: 反思→学习→技能发现→能力提升，Gatekeeper Level 4硬约束
- **CI**: GitHub Actions驱动Soul进化循环
- **兼容**: 支持Claude/Gemini/Qwen/iFlow/CodeBuddy/Copilot/Codex/Kode

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 双源记忆 (Markdown+SQLite-vec) | 平衡持久性与向量检索 | ✓ Good |
| Gatekeeper Level 0-4验证体系 | 防止虚假完成声明 | ⚠️ 未集成CI |
| Domain CLI → skill包孵化模式 | 用户解放优先 | ✓ Good |

---
*Last updated: 2026-04-12 after initialization*
