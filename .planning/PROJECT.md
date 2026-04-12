# Soul 自主决策最佳实践方案

## What This Is

让 Stigmergy Soul Agent 具备可靠的自主决策能力——在不确定性下做出合理选择，记录决策过程，并在越界时主动寻求确认。

## Core Value

**Soul 在边界内自主行动，在边界外主动确认。**

## Requirements

### Validated

- ✓ Soul 身份系统 (soul_manager.js) — 生命周期管理、初始化
- ✓ Soul 知识库 (soul_knowledge_base.js) — Markdown + SQLite-vec 双源记忆
- ✓ Soul 技能进化 (soul_skill_evolver.js) — 技能发现与创建
- ✓ 使命对齐检查 (soul_alignment_checker.js) — 输出验证、虚假声明拦截
- ✓ 自我反思 (soul_reflector.js) — 错误分析、模式提取
- ✓ 进化调度 (soul_scheduler.js) — 进化时机与批量操作
- ✓ 多AI CLI协调执行 — 已验证
- ✓ 技能包孵化流水线 — 已验证
- ✓ Gatekeeper Verification Gate — Level 2 已部署

### Active

- [ ] **DECI-01**: 决策框架 — 定义"何时自主决策、何时寻求确认"的判断逻辑
- [ ] **DECI-02**: 置信度阈值 — 决策置信度低于阈值时自动降级为询问
- [ ] **DECI-03**: 决策边界配置 — 用户可定义 Soul 可自主决策的范围
- [ ] **DECI-04**: 决策审计日志 — 每次决策记录：输入、选项、选择、理由、时间戳
- [ ] **DECI-05**: 决策自检 — 决策后验证结果与预期一致性
- [ ] **DECI-06**: 紧急回退机制 — 连续失败时自动回退并通知

### Out of Scope

- Multi-agent 投票决策（多个 Soul 实例共识）— 未来版本
- 决策树自动学习/更新 — 需要大量历史数据，当前版本手动配置边界
- 决策结果 LLM 重述 — 过早优化

## Context

**Soul进化状态** (cycle_3, 2026-04-12):
- eb-edu/medusa CLI↔backend 链路已验证
- Soul Evolution 系统可自主触发（模式分析→知识提取→技能创建→验证测试）
- 进化计数器 (evolution_count) 与反思计数器 (reflection_count) 已实现
- `.stigmergy/soul-state/` 本地状态目录

**核心问题**: 当前 Soul 只能执行预定义流程（evolve/reflect），在遇到未定义场景时缺乏决策能力——要么盲目选择，要么卡死等待用户输入。

**已知技术债务** (CONCERNS.md):
- 11个空catch块静默吞错误
- Soul连续100+次进化失败 (2026-03-07起)
- Gatekeeper未集成CI/进化循环

## Constraints

- **向后兼容**: 现有 evolution/reflection 流程不变，新决策层叠加其上
- **无外部依赖**: 决策逻辑在 `src/core/soul/` 内自包含，不引入新 npm 包
- **确定性优先**: 相同上下文 → 相同决策结果（不使用随机）
- **Tech**: Node.js >= 16, TypeScript, ESM/CommonJS混合

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 决策框架采用"边界 + 置信度"模式 | 避免复杂规则引擎，保持可解释性 | — Pending |
| 决策日志存储于 `.stigmergy/soul-state/decisions/` | 与现有状态目录一致，便于审查 | — Pending |
| 边界配置使用 JSON schema | 用户友好、可版本控制、可验证 | — Pending |
| 双源记忆 (Markdown+SQLite-vec) | 平衡持久性与向量检索 | ✓ Good |
| Gatekeeper Level 0-4验证体系 | 防止虚假完成声明 | ⚠️ 未集成CI |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-12 after Soul自主决策 initialization*
