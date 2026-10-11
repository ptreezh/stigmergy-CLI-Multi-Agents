# WorkBuddy 开放平台上架方案

> 状态: **待评审** (grill-down 进行中)
> 生成日期: 2026-09-24
> 依据: open.workbuddy.cn 官方文档 8 篇 + 代码库实测 (glob/grep 复核，非转述)

---

## 0. 结论摘要 (Executive Summary)

Stigmergy 跨 CLI 协作系统可制作为 **18 个可上架技能 + 1 个专家智能体 (多智能体进化专家)**，
并**不推荐做连接器**（WorkBuddy 原生已具备 AgentTool/MCP 生态，连接器价值重叠且成本高）。

- 技能路径: **最快、零风险**，1-2 天内完成 frontmatter 适配；上架时长 = 适配 + 平台审核周期（审核时长不可控，见 R6）
- 专家路径: **差异化最强**，把 soul-* 进化机制包装为"多智能体进化专家"（跨 AI 协作/自我进化编排），是平台稀缺品类
- 连接器: **否决**（第一性原理分析见 §6）
- 兼容性已确认: 接口层兼容 OpenClaw 技能包与 MCP 协议; SKILL.md 格式为 Anthropic Agent Skills 开放标准
- 唯一阻塞项: `CLAUDE_PLUGIN_ROOT` 占位符需改写为 `CODEBUDDY_PLUGIN_ROOT`（实测仅 1 个文件使用）

---

## 1. 事实基础（全部实测/官方文档核对）

### 1.1 平台事实 (open.workbuddy.cn)

| 项目 | 内容 | 来源 |
|---|---|---|
| 定位 | 一站式 AI 工作台，支持技能/专家/专家团/连接器/外部应用 | /docs/what-is-open-platform |
| 技能 | SKILL.md + scripts/references/assets; 安装至 `~/.workbuddy/skills/<名>/` | /docs/skill |
| 兼容 | 接口层完全兼容 OpenClaw 技能包与 MCP 协议; 兼容 SkillHub 2万+社区技能 | developer.cloud.tencent.com/article/2656233 |
| 技能格式 | SKILL.md frontmatter 必填: `description`, `description_zh`, `description_en`, `version` | /docs/skill |
| 可选字段 | `name`, `display_name`, `category`, `author`, `allowed-tools`, `disable-model-invocation` | /docs/skill |
| 专家 | `.codebuddy-plugin/plugin.json` + `avatars/expert.png` + `agents/{name}.md` + README.md | /docs/expert |
| 专家团 | plugin.json + settings.json(必) + avatars(team/team-lead/member-*)+ agents({team}-team-lead.md) + 共享 skills/ | /docs/expert-team |
| Buddy应用 | 垂直行业 AI Harness: 工作模式/场景胶囊/模型配置/行业市场 六维自定义 | /docs/buddy-app |
| 连接器 | MCP+Skill 或 CLI+Skill **二选一不可混用**; 一个连接器=一个 MCP Server | /docs/connector |
| 认证 | 企业认证或大陆个人认证(二代身份证+实名手机+人脸核身); 单账号≤10企业主体 | /docs/onboarding |
| OpenAPI | OAuth2.1 授权码 + access_token (3600s) + refresh_token; 云端任务/ACP 通道 | /docs/openapi |

### 1.2 代码库实测

| 项目 | 实测值 | 证据 |
|---|---|---|
| 技能总数 | **18 个 SKILL.md**（首轮 glob `SKILL.md` 漏计小写 `using-superpowers/skill.md`，复核 `skills/**/*.md` = 18 技能文件） | glob `skills/**/*.md` 实测 |
| skills/ 总文件 | 77 文件 | 前次 glob |
| 使用 CLAUDE_PLUGIN_ROOT | **1 个文件**: planning-with-files/SKILL.md | grep 实测 |
| frontmatter `hooks:` 字段 | 2 文件: planning-with-files(SKILL.md:6), complex-task-decomposition-with-system-engineering(SKILL.md:6) | grep `^hooks:` 实测 |
| frontmatter `allowed-tools:` 字段 | 3 文件: complex-task-decomposition-with-system-engineering(SKILL.md:5), planning-with-files(SKILL.md:5), academic-ant(SKILL.md:15) | grep `^allowed-tools:` 实测 |
| 正文提及 hooks (非字段, 与解析无关) | verification-first 11, cli-integration-sop 7, complex-task-decomposition 3, planning-with-files 3(+examples.md 2), rigorous-verification-gatekeeper 1 | grep -i 实测 |
| CodeBuddy 适配器 | `src/adapters/codebuddy/` 已存在 5 文件 (buddy_adapter.py 等) | read 实测 |
| embedded-openskills | 3 文件（SkillInstaller/Parser/Reader.js，解析器非技能内容） | read 实测 |

### 1.3 技能清单（18 个，按上架价值分组）

**A 组 - 通用高价值（首发优先，7 个）**
1. `resumesession` - 跨 CLI 会话恢复 (290 行, 通用, author: stigmergy, frontmatter 缺 description_zh/en)
2. `verification-first` - 验证优先/交付纪律 (无 frontmatter, 无占位符; hooks 11 处仅正文文字, 无需适配)
3. `planning-with-files` - 文件化规划 (**含 CLAUDE_PLUGIN_ROOT 1 处 + hooks: 字段 1 处 + allowed-tools: 字段 1 处**)
4. `two-agent-loop` - 双 Agent 循环 (进化基础机制, 105 行)
5. `complex-task-decomposition-with-system-engineering` - 系统工程任务分解 (hooks: 字段 1 处 + allowed-tools: 字段 1 处)
6. `cli-integration-sop` - CLI 集成 SOP (无字段; hooks 仅正文 7 处)
7. `strict-test-skill` - 严格测试验证 (author: stigmergy)

**B 组 - 专业差异化（次发，4 个）**
8. `academic-ant` - 行动者网络理论分析 (635 行, 富 frontmatter 范本, allowed-tools: 字段 1 处, **author: socienceAI.com — 第三方版权待确认**)
9. `academic-illustration` - 学术黑白插图 (author: Stigmergy Project)
10. `skill-from-masters` - 从大师方法论提炼技能
11. `using-superpowers` - Superpowers 元技能 (**小写 skill.md 文件名**, 需确认内容为自有或授权)

**C 组 - soul 进化体系（专家智能体素材 + 单独上架备选，7 个）**
12. `soul-evolution` - 自主进化 (90行, requires two-agent-loop, 双Agent循环)
13. `soul-auto-evolve` - 自主进化技能·用自身LLM搜索/分析/创建 (199行, author: stigmergy)
14. `soul-reflection` - 自反思
15. `soul-compete` - 竞争进化 (双Agent循环方案对比择优)
16. `soul-co-evolve` - 协同进化 (双CLI协作学习)
17. `soul-auto-search-config` - 自动搜索配置 (author: stigmergy soul-evolve)
18. `soul-auto-compute-hunter` - 自动算力猎取 (author: stigmergy soul-evolve)

> 实测说明(grill-down 修正): ① 首轮大写 glob `SKILL.md` 漏计 `using-superpowers/skill.md`（小写），复核后技能总数 = 18；② `soul-auto-evolve` 与 `soul-evolution` **是两个独立技能**（frontmatter/体量/author 均不同），非重复目录；③ `skill-from-github` 不在本项目 skills/ 中（存在但非项目内技能），已从清单移除。

---

## 2. 战略判断（第一性原理）

### 2.1 WorkBuddy 已原生具备的（Stigmergy 不可与其竞争）
- 多模型路由: WorkBuddy 原生多模型 → SmartRouter 无差异化
- 跨工具协作: WorkBuddy 原生多 Agent/AgentTool → 跨 CLI 编排价值重叠
- MCP/连接器生态: WorkBuddy 原生连接器体系 + SkillHub → 连接器不做

### 2.2 Stigmergy 独有的（可迁移价值）
- **18 个打磨过的实战技能**（含跨 AI CLI 协作经验沉淀）→ 技能上架
- **soul-* 进化机制**（双 agent 循环、自我进化、竞争/协同演化、自反思）→ 专家智能体，平台稀缺品
- **跨 CLI 会话恢复 (resumesession)** → 独特性技能

### 2.3 否决连接器的理由
1. 连接器价值 = 把 stigmergy CLI 作为外部能力接入 WorkBuddy → 用户仍需本机装 stigmergy → 获客门槛高于直接上架技能
2. 连接器规格: 一连接器=一 MCP Server, MCP+Skill/CLI+Skill 二选一 → 实现成本高、审核面大
3. WorkBuddy 原生 AgentTool 已覆盖编排诉求 → 连接器是"重复造轮子"

---

## 3. 实施方案

### Phase 0: 账号与认证（1 天）
- [ ] 注册 open.workbuddy.cn 开发者账号
- [ ] 完成企业认证或大陆个人认证（后者需身份证+实名手机+人脸核身）
- [ ] 创建业务类型: 技能 + 专家（专家需资质填写"多智能体/Agent 协作"领域）

### Phase 1: 技能上架 A 组 7 个（适配 2-3 天 + 审核周期不定）★ 首选路径
每个技能四步适配:
1. **frontmatter 补齐**: 必填 `description`, `description_zh`, `description_en`, `version`; 推荐 `display_name`, `category`, `author`
   - 模板见 §4
2. **占位符改写**: `CLAUDE_PLUGIN_ROOT` → `CODEBUDDY_PLUGIN_ROOT`（实测仅 planning-with-files 1 处）
   - 同时检查 `CLAUDE_SKILL_DIR`/`~/.claude/skills` 等路径引用 → `CODEBUDDY_SKILL_DIR`/`~/.workbuddy/skills`
3. **hooks/allowed-tools 字段**: 保守方案 = 移除（平台若不支持会被拒）；激进方案 = 保留并先提交 1 个试水
   - 处置: **先上架 verification-first（自有技能，无 frontmatter 风险字段：无 hooks:/allowed-tools:/占位符，11 处 hooks 仅为正文文字）作为试水；适配时显式加入官方可选字段 allowed-tools: 探测平台解析接受/拒绝行为，再决定批量阶段对 hooks:/allowed-tools: 的保守或激进处置**（academic-ant 为第三方版权，已排除出试水，见 R2）
4. **验证**: `stigmergy skill validate ./<skill>/SKILL.md` + 本地 `npx skills` 安装到 `~/.workbuddy/skills/` 实测

### Phase 2: 专家智能体「多智能体进化专家」(3-5 天) ★ 差异化路径
- 素材: C 组核心 4 个 (soul-evolution / soul-reflection / soul-compete / soul-co-evolve) + two-agent-loop（执行底座，来自 A 组复用）
- 结构: `soul-expert/.codebuddy-plugin/plugin.json` + `avatars/expert.png` + `agents/soul-evolution-expert.md` + README.md
- plugin.json 关键字段: `expertType: "agent"`, `agentName`, `displayName{en,zh}`, `profession{en,zh}`, `displayDescription{en,zh}`
- 定位: "多智能体进化编排专家：直接调用 two-agent-loop + soul-* 技能，替用户执行跨 AI 协作、竞争择优、协同进化与自我反思，而非纯方法论说教" —— 与平台现有工具型专家形成错位
- 备选: 专家团「AI 进化专家团」(team-lead + 2 member, 需 settings.json + avatars/team*.png + {team}-team-lead.md 前缀命名)

### Phase 3 (可选): Buddy 应用「AI 进化工作台」
- 六维自定义: 工作模式(进化 System Prompt) + 场景胶囊(绑定 5 核心技能: 4 soul + two-agent-loop) + 内置技能
- 低优先: 依赖 Phase 1 技能全部上架成功后才做，避免空壳应用

### Phase 4: 发布与运营
- 提交审核 → 发布上线 → 监控运行数据（安装量/会话量）→ 版本迭代
- 冷启动: A 组 7 技能在试水通过后批量上架，形成"技能包"势能，而非单发

---

## 4. 技能 frontmatter 适配模板

```yaml
---
name: verification-first
description: Verify before claiming completion - evidence-before-assertions discipline for AI agents. Use when about to claim work done, passing, or fixed.
description_zh: 验证优先 - 声称完成/修复/通过前必须先运行验证并确认输出。用于交付、修复、测试通过前的最后把关。
description_en: Verify before claiming completion - evidence-before-assertions discipline for AI agents.
version: 1.0.0
display_name: 验证优先 (Verify-First)
category: engineering-quality
author: Stigmergy CLI Team   # 字符串形式；package.json 实证无 email，不编造（2026-09-24 修正）
---
```

---

## 5. 风险清单

| # | 风险 | 等级 | 缓解 |
|---|---|---|---|
| R1 | hooks/allowed-tools/CLAUDE_PLUGIN_ROOT 字段 WorkBuddy 解析行为未实证 | 高 | verification-first 试水先行；保守=移除 hooks；占位符改为 CODEBUDDY_* |
| R2 | third-party 版权: academic-ant (author: socienceAI.com) / using-superpowers (marketplace 来源) 非自有 | 高 | 试水改用自有技能；第三方技能上架前查证 MIT 归属或剔除 |
| R3 | 个人认证主体限制（≤10 企业主体/账号） | 低 | 18 技能+1 专家不超限；若需 Buddy 应用另计 |
| R4 | frontmatter 未知字段 (requires/tags/trigger) 平台是否接受未实证 | 中 | 试水技能一并验证；未知字段保守移除 |
| R5 | 双语言 frontmatter 是必填 → 补译工作量 | 低 | 模板化批量生成 |
| R6 | 平台规格可能更新 | 低 | 上架前重拉 /docs/skill 复核 |
| R7 | category 字段取值是否为平台枚举未实证 | 低 | 试水验证或用平台现有分类 |

---

## 6. 明确不做的（刻意排除）

1. ~~连接器~~: 价值重叠 + 成本高 + 审核面大 → 不做（除非用户明确要求 CLI 接入场景）
2. ~~Buddy 应用首发~~: 依赖技能生态 → Phase 3 可选
3. ~~stigmergy gateway 上架为第三方应用~~: 那是反向集成方向（stigmergy 调 WorkBuddy，而非发布到 WorkBuddy），与本目标无关
4. ~~重复技能~~: 与 SkillHub 2万+ 冲突的通用技能（如 pdf/pptx 类）不重新上架，只上架自有独特技能

---

## 7. 与既有文档的一致性

- `STIGMERGY_TOP_PLATFORM_STRATEGY.md` 中"4 soul skills"表述 → 实测 7 个 soul-* 技能（soul-evolution/auto-evolve/reflection/compete/co-evolve/auto-search-config/auto-compute-hunter），本方案已按实测修正
- `STIGMERGY_VS_OPENCLAW_ANALYSIS.md` 定位叙事 → 保留，作为技能/专家对外宣传的叙事来源

---

## 8. 下一步

1. [x] 用户确认: 认证方式 = **大陆个人认证**（二代身份证+实名手机+人脸核身，单账号 ≤10 企业主体）；首发范围 = **A 组 7 个全上**（技能包势能）；专家形态 = **单人专家**（plugin.json + expert.png + 1 agent md）
2. [~] 试水: verification-first 适配已完成（frontmatter + allowed-tools 探测写入暂存副本 `docs/strategy/workbuddy-skills/verification-first/`）→ **待用户提交审核**
3. [x] 批量生成 A 组 frontmatter（§4 模板）: 7 个全部完成（见下方执行记录）
4. [x] 撰写专家 agent 文件 + 生成 avatars PNG: **soul-expert 单人专家包完成**（plugin.json + agent md + 5 技能 + 头像 + README + 验证）；**zip 已产出 `docs/strategy/release/soul-expert.zip`（author.email=zhangshuren@agent.qq.com，用户确认）**
5. [ ] 提交 → 审核 → 发布（A 组 7 个在试水通过后批量上架）

### Phase 1 执行记录（2026-09-24）

- 适配副本: `docs/strategy/workbuddy-skills/`（7 技能 / 29 文件，manifest = `README.md`）
- frontmatter: 按 §4 模板补齐（author 用字符串 `Stigmergy CLI Team`；resumesession/strict-test-skill 保留原 `stigmergy`）
- hooks: 从 planning-with-files / complex-task-decomposition-with-system-engineering **移除**（R1 保守）；回填预案见暂存 manifest（恢复原块 + `CLAUDE_PLUGIN_ROOT` → `CODEBUDDY_PLUGIN_ROOT`）
- allowed-tools: verification-first 显式加入探测字段（Read, Write, Edit, Bash, Glob, Grep, WebFetch, WebSearch）
- tags: 从 two-agent-loop / cli-integration-sop **移除**（R4 保守）
- 验证: `stigmergy skill validate` **7/7 PASS**（exit=0）；PowerShell 严格 UTF-8 实测 **29 文件全部合法、无 BOM**
- 环境发现: AGENTS.md 声明的 `scripts/check_encoding.py` 及 `.git-hooks/pre-commit` **不存在**（exit=2）→ 编码验证已用 PowerShell UTF8Encoding(strict) 替代完成，未使用该脚本
- **R6 官方复查（2026-09-24 重拉 `open.workbuddy.cn/docs/skill` + `/docs/onboarding`）**:
  - 官方必填字段 = description / description_zh / description_en / version / author（合作方名称=字符串）→ 我们的 frontmatter **全部满足**；`name` 官方标"否"
  - `allowed-tools` = 官方合法可选字段（逗号分隔）→ 探测有意义；**hooks/tags 不在官方规范 → 移除决策被证实正确**
  - display_name / category 出现在官方示例 → 保留正确；平台另有 disable-model-invocation / user-invocable（备用）
  - 提审通道 = 控制台【技能市场】→【添加技能】→【创建技能】→ 对话 + **提交 zip 包**；结构 = `{skill-name}/SKILL.md` + references|scripts|templates（可选）
  - ✅ ~~批量上架前需整改：resumesession / complex-task-decomposition / planning-with-files 暂存副本含根级散文件~~ **已完成（2026-09-24 实测复核）**：根级散文件已按 scripts/references/templates 映射归位（明细见暂存 manifest L80-87）；整改后 zip 条目实测 resumesession=7 / planning-with-files=8 / complex-task=6；`stigmergy skill validate` 复跑 3/3 PASS（exit=0）
  - 完成: `docs/strategy/release/verification-first.zip` 试水包（4760 B，官方结构合规）
- 待办: 用户 Phase 0 已完成（个人认证 + 登录）→ 控制台提审 verification-first.zip 试水（**外部动作，待用户执行**）→ 定 hooks/allowed-tools 最终处置（3 技能结构整改已完成，见 L205）→ 批量上架；strict-test-skill 用户已确认上架（7 个全上）

---

### Phase 2 执行记录（2026-09-24）：soul-expert 单人专家资产包

- 包根: `docs/strategy/soul-expert/`（官方 /docs/expert 规范：plugin.json + avatars/expert.png + agents/*.md + README.md + skills/）
- plugin.json: `name=plugin:"soul-expert"`、`expertType:"agent"`、`agentName:"soul-evolution-expert"`、`categoryId:"04-DataAI"`、`displayName:{en:EvolveX, zh:进化专家}`、`profession:{en:Multi-Agent Evolution Orchestrator, zh:多智能体进化编排专家}`、`displayDescription.zh` 46 汉字（官方 40-50 达标）、`defaultInitPrompt==quickPrompts[0]`、3 组 tags、`author.email` = `zhangshuren@agent.qq.com`（用户已确认）
- agents/soul-evolution-expert.md: `maxTurns:100`，预载 5 技能（two-agent-loop + soul-{evolution,reflection,compete,co-evolve}），中文执行型编排正文
- 技能: two-agent-loop 复用 A 组已适配版；4 个 soul 技能从 `~/.opencode/skills/soul-*` 拷入并整版适配官方 frontmatter（description/description_zh/description_en/version=1.0.0/display_name/category=development/author=Stigmergy CLI Team；移除 tags/requires/builtin；相对链接 `./`→`../`）
- avatars/expert.png: PIL 4x 超采样（2048→512 LANCZOS），512×512 PNG、66.3KB（官方 ≤500KB 达标）；双轨道循环箭头 + 双 Agent 球 + 中心金星的进化符号
- README.md: 中文为主（简介、结构、安装、quickPrompts、技能表、字段说明、本地复现）
- 验证: `verify_soul_expert.py` **ALL PASS**（91 项：必填字段/命名规范/字数 46/defaultInitPrompt 一致性/结构树/PNG 尺寸体积/4 技能 frontmatter 无残留+链接 `../`）；头像视觉风格待多模态复核（当前模型不支持读图）
- 待办: ① ~~用户确认 author.email → 替换占位符 → `docs/strategy/release/soul-expert.zip`~~（**已完成**：email=zhangshuren@agent.qq.com，zip 已产出，zip 内 README 已含 scripts/python 复现指引并复验 UTF-8）；② 用户手动提审 verification-first.zip 试水（外部动作）→ 定 hooks/allowed-tools 最终处置 → 与 soul-expert 一并批量上架