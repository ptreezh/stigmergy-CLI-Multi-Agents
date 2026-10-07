# Agentgit 研究与本项目改进

## 研究范围

系统研究了 agentgit 生态中 7 个相关项目：
1. **agit** (agent-git.com) - 商业 SaaS + CLI，session version control
2. **Academic AgentGit** (HKU/HKUST) - LangGraph 状态管理，W=MAC/AAAI 2026
3. **agentgraph/agentgit** - LangGraph 执行追踪 + 回归测试
4. **Tryboy869/AgentGit** - Git-native 多 agent orchestration
5. **btucker/agentgit** - Transcript-to-git，per-line blame
6. **open-gitagent/gitagent** - Git-native agent framework
7. **open-gitagent/opengap** - Git-native agent protocol standard

## 核心借鉴

### P0 - 立即实施

| 设计来源 | 具体做法 | 本项目映射 | 状态 |
|---------|---------|-----------|------|
| agit session-as-branch | 每个 handoff/task = bus 中一个 JSON 文件 | `bus/handoffs/{pending,active,completed}/{id}.json` | ✅ 已实现 |
| agit append-only evidence | pending→active→completed 不可逆 | 目录命名强制状态流转 | ✅ 已实现 |
| Tryboy869 deterministic gate | 完成必须由接收方 agent 确认 | `acceptedBy` + `completedAt` 字段 | ✅ 已实现 |

### P1 - 近期实施

| 设计来源 | 具体做法 | 本项目映射 | 状态 |
|---------|---------|-----------|------|
| agit two-level memory | main branch = shared knowledge, session branch = handoff | `bus/shared/knowledge.md` = main, handoff = session | 🔄 待实现 |
| Academic AgentGit tool reversal | 有副作用的 tool 注册 reverse 函数 | `reverse_tools` 字段在 handoff schema | 🔄 待实现 |
| agentgraph cascade detection | 区分 root-cause 和 cascade failure | handoff 失败时标记 cascade | 🔄 待实现 |

### P2 - 远期优化

| 设计来源 | 具体做法 | 本项目映射 | 状态 |
|---------|---------|-----------|------|
| btucker line-level blame | 每行代码映射回 agent session | per-file line hash index | ❌ 未开始 |
| Academic AgentGit checkpoint/rollback | 从 checkpoint 恢复状态 | handoff checkpoint 字段 | ❌ 未开始 |
| opengap adapter system | 导出到多个 agent 格式 | agent adapter registry | ❌ 未开始 |

## 本项目独特优势

agentgit 系列项目都是**单 agent 或同构 agent** 协作。Stigmergy 的独特价值：

1. **异构 agent 协作**：opencode（IDE）、ZCode（编辑器）、WorkBuddy（CLI）、Doubao（聊天）、Marvis（桌面）
2. **项目级映射**：通过 session 历史反推工作目录，这是 agentgit 没有的
3. **本地优先**：不依赖云端 hub，所有协调通过本地文件系统
4. **注入即用**：skill 复制到 agent 的 skills 目录即可工作，无需修改 agent 源码

## 需要避免的陷阱

| agentgit 的做法 | 为什么不适合 Stigmergy |
|--------------|----------------------|
| 云端 hub（agent-git.com） | 增加外部依赖和 secrets 暴露风险 |
| Append-only 无删除 | Stigmergy 的 handoff 需要 cancelled/rejected 状态 |
| 强制 git 存储 | 不是所有 agent 都有 git（WorkBuddy、Doubao） |
| 单一 agent 格式 | Stigmergy 需要支持异构 agent |

## 下一步行动

1. **Phase 2 完成**: 注入 WorkBuddy、Doubao、Qoder
2. **Phase 3 开始**: orchestrator 自动创建 handoff 基于项目冲突检测
3. **Phase 4 开始**: 验证指标收集（handoff 成功率、平均完成时间）
4. **P1 特性**: 实现 two-level memory（knowledge.md distillation）
