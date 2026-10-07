# 长期自动化持续对齐循环计划 (ALIGNMENT LOOP PLAN)

> 状态: **已落盘 v0.1** (2026-09-25) | grill-down Round 1 已核验: 可信可行
> 定位: **元层运行协议** — 约束本仓库所有智能体工作流的 对齐/落盘/压缩/核验 纪律
> 依据(均实测/已定案): AGENT_DRIVEN_PROVISIONING_PLAN.md v0.2 (501 行) + TOOL_EXPANSION_PLAN.md v0.2 (250 行, C1-C4 已拍板)

---

## §0 凝练项目目标 (项目使命)

**一句话使命**:
> 把 stigmergy 从「CLI 工具管理」升级为「跨 AI 智能体的开放部署与协作平台」——
> 在任何用户的操作系统上，一次 `stigmergy provision` 向导即可完成全部 AI 智能体的
> **探测→判定→勾选→安装+必需插件配置→核验→协同收口**，达成「部署完成即协同就绪」
> (会话切换 / 技能共享 / agentgit 大脑同步)。

**证据锚点**: AGENT_DRIVEN L26 (五步向导流程) / L328 (部署完成即协同就绪=聚合默认最后一步) / TOOL_EXPANSION §0 (三类工具身份矩阵, C1-C4 拍板)。

**4 对齐锚点** (任何任务必须可映射到至少一个锚点, 否则砍/降级):

| # | 锚点 | 含义 | 证据 |
|---|------|------|------|
| A1 | **开放部署** | 面向任意用户 OS; 探测用户侧软硬件; 三元组判定 `installed` / `installable(0..n gates)` / `not-installable(机器可读原因)`; 本机=参考画像样例 | AGENT_DRIVEN L26/L134/红线12 |
| A2 | **插件一等公民** | 安装单元=装+插件配置+核验三件事打包; registry 含 `plugins`/`gates` 字段; 插件写入=合并不覆盖; 目标路径由 registry 确定(代理不发明路径) | AGENT_DRIVEN L254/L311/L388(红线11) |
| A3 | **协同收口** | 聚合=默认最后一步; 会话切换(harvester/parser) + 技能共享(`skill deploy --target`) + agentgit 大脑同步 | AGENT_DRIVEN L328; TOOL_EXPANSION §0/§3 |
| A4 | **证据与上下文纪律** | 每轮落盘; 数字=直接实测+证据行(文件:行号); 上下文余量≤30% 强制压缩; grill-down 钢铁人思辨每轮落盘 | 全局 AGENTS.md; 本计划 §4/§5/§6 |

---

## §1 分层任务分解 (L0-L3)

- **L0 目标层**: §0 使命 + 4 锚点。只读常量; 修改需用户拍板。
- **L1 工作流层**: W0-W7 路线图 (见 §2)。每工作流有主导文档。
- **L2 阶段层**: Phase/Milestone。每 Phase 有明确验收标准 (如 TOOL_EXPANSION §3)。
- **L3 原子任务层**: 每任务含四要素 `[目标/实施/落盘核验/更新进度]`。一次只做一件 (对齐目标同时专注于当下)。

---

## §2 当前工作流路线图 (W)

| ID | 工作流 | 状态 | 主导文档 |
|----|--------|------|---------|
| W0 | 开放部署方案 (探测/判定/插件/聚合) | ✅ v0.2 定案 | AGENT_DRIVEN_PROVISIONING_PLAN.md |
| W1 | 多工具一键安装+会话切换+技能共享 | ✅ v0.2 定案 (C1-C4+二轮核查) | TOOL_EXPANSION_PLAN.md |
| **W2** | **Phase 1 代码: CLI_TOOLS `type` 字段+scan/install/skills 三分支+单测** | 🔲 **下一实施目标** | TOOL_EXPANSION §3 Phase 1 (±1-2 天) |
| W3 | Phase 2 会话切换: workbuddy/qwenwork/kimi/marvis parser 并入 harvester | 🔲 | TOOL_EXPANSION §3 Phase 2 |
| W4 | Phase 3 技能共享: `skill deploy --target <tool>` (dry-run 冲突检测) | 🔲 | TOOL_EXPANSION §3 Phase 3 |
| W5 | Phase 4 agentgit 集成 (C1=btucker/agentgit) | 🔲 | TOOL_EXPANSION §3 Phase 4 |
| W6 | provision 向导 UI + opencode 引导器 | 🔲 | AGENT_DRIVEN §8.2/§8.3 |
| W7 | WORKBUDDY_LAUNCH_PLAN 技能上架评审 | 🔲 | WORKBUDDY_LAUNCH_PLAN.md |

---

## §3 ALIGN-LOOP 循环机制 (每轮六步)

每轮 (一个 L3 原子任务) 执行:

1. **对齐复核** — 答 §4 五问, 确认任务映射锚点
2. **执行** — 完成当前 L3 原子任务
3. **落盘** — 结果+证据写入主导文档 (append-only 进度表)
4. **循环核验** — grill-down 自审 (§6), 结论写回文档
5. **上下文预算检查** — 余量≤30% → 执行 §5 压缩协议
6. **推进** — 更新进度表, 进入下一原子任务

---

## §4 对齐五问 (每轮必答)

1. **锚点**: 本轮成果服务哪个锚点 (A1-A4)? 无 → 砍/降级。
2. **证据**: 数字是否直接实测+证据行 (文件:行号)? 无 → 补测后写交付物。
3. **落盘**: 是否已写入文档? 无 → 先落盘再报告。
4. **红线**: 是否触碰 §7 红线? 是 → 立即回退并记录。
5. **预算**: 上下文余量估算? ≤30% → 立即 §5。

---

## §5 上下文压缩协议 (30% 触发)

- **触发条件**: 上下文余量估算 ≤30% (无 context API 时以「本会话累计输入+输出 token 估算」近似, 保守执行)。
- **动作顺序**:
  1. **状态外化**: 更新主导文档进度表 + 决策日志 + 当前任务交接块 (**≤40 行**) 写盘
  2. **交接块内容**: `当前任务 / 已完成 / 下一步 / 证据指针 / 红线状态`
  3. **浓缩交接**: 旧会话结束, 新会话冷启动只读 交接块 + 计划文档 → 恢复
- **恢复保证**: 一切可恢复状态在盘上; 会话只持「指针+当前任务」; 盘上可重建全状态。
- **防爆炸**: 单任务预算 ≤20-25% 上下文; 大调研先行落盘再实施 (本计划即产物)。

---

## §6 Grill-down 循环核验记录 (append-only)

### Round 1 (2026-09-25, 初稿自审)

- **G1 可信性**: 使命句是否覆盖用户全部 verbatim?
  「开放给用户部署」「安装过程中测试用户侧软硬件」「哪些可安装/已安装」「配置安装必须的插件」「会话切换/技能共享/agentgit」「部署完成即协同就绪」→ 全部映射进 A1-A3, 无遗漏 ✅
- **G2 可行性**: 30% 压缩协议在本机可执行? (无 ctx API → token 估算近似, 触发=保守执行) ✅
- **G3 歧义**: 「开放部署」= 面向任意用户(非仅本机) — 两依据文档均已按此定案 (AGENT_DRIVEN L26 / TOOL_EXPANSION §0) ✅
- **G4 冲突**: 与 AGENT_DRIVEN/TOOL_EXPANSION 无冲突 — 本计划为元层引用, 不推翻已定案内容; 与 AUTONOMOUS_EVOLUTION_SYSTEM (soul 层进化) 维度不同, 不重复 ✅
- **G5 验证**: 本计划锁定下一步=W2 (Phase 1 代码) — 下一轮执行即验证点; W1 已确认为终稿(版本号补丁见变更记录) ✅
- **结论**: 可信可行 → 进入 W2。**遗留**: 红线 12 精确行号 (AGENT_DRIVEN Round 7 表内), 引用前补查。

---

## §7 红线 (不可违反)

| # | 红线 | 来源 |
|---|------|------|
| 1 | 桌面 App 不静默安装 (仅检测+官网引导) | TOOL_EXPANSION R1/§4-1 |
| 2 | `workbuddy.db` 只读反解, 任何写入不做 | C4 (Phase 0) |
| 3 | coze `patToken` 不复述/不落盘 (config.json 令牌只写入口不读内容) | AGENT_DRIVEN L317 |
| 4 | 插件写入=合并不覆盖; 目标路径由 registry 确定 | 红线11 (L388) |
| 5 | 不可安装项必须附机器可读原因, 禁止静默跳过 | 红线12 (Round 7) |
| 6 | 禁 `task()` 子代理 (挂死); 子代理仅 `opencode run` + `opencode/*-free`; 裸消息在 `-f` 前 | 全局 AGENTS.md |
| 7 | `rg --type py` 失效 → 必用 `-g "*.py"`; PowerShell Count 先赋变量 | 全局 AGENTS.md |
| 8 | 数字必须直接实测复核后写交付物 (子代理报告不转述) | 全局 AGENTS.md |
| 9 | 修改 opencode 配置前先备份 `.backup-<时间戳>` | 全局 AGENTS.md |
| 10 | 所有文本文件 UTF-8 无 BOM; 读写显式指定编码; 违规用 `scripts/convert_to_utf8.py` | 全局 AGENTS.md |

---

## §8 进度表 (append-only)

| 日期 | 任务 | 结果 | 证据 |
|------|------|------|------|
| 2026-09-25 | 本计划 v0.1 落盘 (目标凝练+4锚点+L0-L3+ALIGN-LOOP+30%压缩+grill-down R1+红线) | ✅ | 本文件 |
| 2026-09-25 | W1 状态确认: TOOL_EXPANSION 已是 v0.2 终稿 → 仅补版本号头 | ✅ | TOOL_EXPANSION L3 补丁 |
| 2026-09-25 | §5 压缩协议触发 (上下文余量逼近 30%) → 外化状态+写交接块 (§10) | ✅ | §10 交接块 |

---

## §9 变更记录

- **v0.1** (2026-09-25): 初版落盘 — 凝练使命 + 4 对齐锚点 + L0-L3 分层 + W0-W7 路线图 + ALIGN-LOOP 六步 + 对齐五问 + 30% 压缩协议 + grill-down Round 1 + 十条红线 + 进度表。

---

## §10 会话交接块 (上下文压缩产物, append-only)

> 触发: 2026-09-25 主会话上下文余量逼近 30% → 按 §5 外化。新会话冷启动 = 读本块 + §2/§6/§8 即可全恢复。

- **当前任务**: W2 = Phase 1 代码实施 (TOOL_EXPANSION §3 Phase 1: `cli_tools.js` 9 条目补 `type` 字段 + `scan/install/skills` 三分支 + 单测 + lint + 91 项不回归)。**未开始。**
- **已完成**: ALIGNMENT_LOOP_PLAN v0.1 落盘+校验绿; TOOL_EXPANSION 确认 v0.2 终稿 (C1-C4+二轮核查) + 版本号头补丁; grill-down R1 结论=可信可行。
- **下一步**: 读 `src/core/cli_tools.js` + `enhanced_cli_installer.js` + `src/cli/commands/{scan,status,skills}.js` + `cli_path_detector.js` + `tests/unit/hooks/verification-gate.test.js` + `package.json` → 实证后实施 (数字直接实测, 证据行)。
- **证据指针**: `docs/strategy/TOOL_EXPANSION_PLAN.md` L130-163 (Phase 1 契约); `AGENT_DRIVEN_PROVISIONING_PLAN.md` L388 (红线11=合并不覆盖/registry 定路径), L376-391 (红线12 精确行号**引用前补查**)。
- **已知实证**: 本机已装 9 工具 (opencode 1.18.32/coze 0.2.0/qwen/qoder 0.1.20/claude/codex 0.77.0/doubao/qwenwork~/.qwenworkcn/kimiwork/marvis); traework/qoderwork 未装 (Win 版 Q2 2026); agentgit=btucker/agentgit (Go CLI, JSON 版本控制)。
- **红线状态**: 无触碰。⚠ coze patToken 不复述; workbuddy.db 只读; 禁 task() 子代理 (用 `opencode run` + 仅 opencode/*-free); rg 用 `-g "*.py"`。