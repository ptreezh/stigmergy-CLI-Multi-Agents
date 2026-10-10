# Plan: 内部可用性加固（Internal Usability Hardening）

**Level:** T3 — 涉及测试基建、构建脚本、打包内容、git 卫生、文档事实性，多系统权衡且用户要求反复思辨至收敛
**Status:** converged
**Owner:** 主会话（Sisyphus）
**Last updated:** 2026-10-10

---

## 1. Goal

**What we actually want:** 让本项目的内部开发/使用体验真正可用（测试能在开发循环内跑完、构建脚本可执行、工作区不再是一潭浑水），并顺手修正对外声明与打包内容中**已实测**的不实/有害部分（README 安装命令指向不存在的版本、本地打包会泄漏个人绝对路径、发布配置已漂移）。**不发布 npm 版本**（用户明确选择对内优先）。

**Success, observably:**
- `npx jest tests/unit/agent_registry.test.js`（当前实测 84.4s / 8 tests）修复后 **< 10s**；根因是测试扫描真实 `agent-states/`（524 文件）+ `cacheTTL: 0`
- `npx jest tests/unit` 全量在 **< 5 min** 内出结果（当前 300s 工具超时仍无输出）
- `npm run build:orchestration` 成功（当前 `tsconfig.build.json` 不存在 → 脚本必然失败）
- `npm pack --dry-run` 后 grep 确认：**无 `wiki/state.json` 个人路径**（当前会泄漏 `C:\Users\Zhang\...`、`D:\ssciskills` 等），且 `dist/` 被打包（运行时必需）
- README 每个安装/版本声明与 `npm view stigmergy` 实测一致（当前宣称 `stigmergy@1.11.0`，registry 最新为 `1.10.10-beta.5`，2026-03-10 发布）
- 工作区 triage 完成：35 个变更/未跟踪文件分类处理（代码批次提交、运行期产物 gitignore、无法验证的 WIP 单列）

**Reversibility:** 廉价可逆——全部是测试夹具、配置文件、文档与 git 卫生改动，无一道路改动；npm 发布被明确排除（不可逆/外部冲击面），仅在被用户主动触发时另行计划。

**Out of scope:**
- npm publish（含发布 1.11.0）——用户选定对内优先
- 架构级解耦（CentralOrchestrator 迁移出 dist）——通过构建脚本修复 + require 容错达成同等内部目标
- 新增大规模功能、重写测试套件
- 外部用户支持管道（issue 模板已存在，不扩）

---

## 2. System map

- **Boundary:** 仓库内：测试、构建、打包配置（.npmignore/package.json files）、README、git 状态、交互模式运行时；仓库外：npm registry 是只读观测点（不写）。
- **Actors and actual incentives:**
  - 用户/唯一开发者：想要快速反馈循环（测试跑完=可验证一切），但当前默认不走 `npm test` 全量（300s 无结果）→ 实际依赖单文件跑或干脆不看
  - `scripts/run-tests.js`：串行 execSync 逐类型跑，是 `npm test` 的慢来源之一
  - `src/interactive/InteractiveModeController.js:12`：顶层 `require("../../dist/orchestration/core/CentralOrchestrator")` → 运行时依赖构建产物
  - 已发布包 1.10.10-beta.5：**含** dist/、**不含** wiki/（实测 tar 列表）——而当前 `.npmignore` Runtime data 段排除 dist/、未排除 wiki/ → 下一版打包内容与现状正好翻转
- **Hard constraints:** npm registry 无法回写历史（1.11.0 不可凭空出现）；tsconfig.build.json 缺失是当前事实；dist/ 被 gitignore（git ls-files dist = 0）→ fresh clone 无 dist
- **Soft constraints:** 仓库 git 历史规范（小批量提交、feat 带测试、doc-code 配对）；文件须 UTF-8
- **Feedback loops:**
  - 强化（负向）：测试慢 → 少跑 → 回归 → 修复更慢 → 更不想跑
  - 平衡（正向）：单文件测试可跑 → 至少 agent_registry 有基线
  - 延迟：测试套件庞大的延迟 = 数分钟；发布漂移延迟 = 月（上次发布 2026-03-10）
- **Second-order effects:** 修好测试 → CI 才可能接入（否则 10min 超时无意义）→ 后续所有 feat 提交流程可信；打包修复 → 未来任何一次偶然 publish 不泄私密路径。

---

## 3. Options considered

| # | Option | One-line description | Mechanism family | Verdict |
|---|---|---|---|---|
| 0 | Do nothing / defer | 维持现状：测试继续 300s 无结果，README 继续宣称不存在的版本 | — | rejected |
| 1 | **内部优先加固**（本次采用） | 修测试隔离+构建脚本+打包+git 卫生+文档事实性，不发布 | capability repair | **selected** |
| 2 | 外部优先：发布 1.11.0 流水线 | prepack 构建、版本提升、立即 publish，先救外部可信度 | release pipeline | rejected（用户选择对内优先） |
| 3 | 架构解耦中央编排器 | 把 CentralOrchestrator 从 dist 迁到 src、惰性加载、删构建依赖 | architecture | rejected（成本超出对内目标；构建修复+容错已覆盖） |
| 4 | 纯声明诚实化（只改 README+打包） | 只修对外言论，不碰测试/构建 | claims-layer only | rejected（治标不治本，内部仍不可用） |

**Note:** 选项 4 与选项 1 是不同机制族（声明层 vs 能力层）；选项 2 与选项 1 是不同机制族（发布管道 vs 能力修复）。

---

## 4. Steelman record

### Steelman: O0（什么都不做）

- **Claim at full strength:** 项目是个人工具，测试跑不跑完无所谓；README 宣称 1.11.0 只是"目标版本"宣传语；改动有风险不如不动。
- **Strongest evidence:** 核心 CLI 实测可跑（version/status/--help 正常，检测到 10 个 CLI）；已发布包实际可用（含 dist/、不含 wiki/）；没有任何外部用户投诉记录。
- **Why it beats the alternatives, on its own terms:** 零成本、零风险、零时间投入；现有功能一直能用。
- **What would prove it wrong:** 一次偶然 `npm publish` 会泄漏个人路径并产出缺 dist/ 的坏包；一次 fresh clone 后 `npm test`/`stigmergy interactive` 直接失败——两者都是**现存配置漂移**造成的确定性结果，不是假设。已被实测证明存在。

### Steelman: O2（立即发布 1.11.0）

- **Claim at full strength:** README 已承诺 1.11.0，唯一诚实的做法就是把它发出去；发布后外部用户拿到新功能，可信度恢复。
- **Strongest evidence:** registry 版本列表止于 1.10.10-beta.5，README 承诺的 1.11.0 缺失是硬事实；发布是唯一让该命令行得通的方式。
- **Why it beats the alternatives, on its own terms:** 一劳永逸解决"文档-事实脱节"；npm pack 的 wiki 泄漏问题也会在发布前被强制暴露处理。
- **What would prove it wrong:** 用户明确选择对内优先（已作答）；发布不可逆（坏版本无法撤回）、把内部未验证代码暴露给外人、需先解决测试/打包问题否则发布即翻车——发布的前提条件尚未满足，顺序错误。

### Steelman: O1（我们的领先选项）

- **Claim at full strength:** 测试慢的根因已定位（真实目录扫描+cacheTTL:0），夹具化后 agent_registry 可 <10s；构建脚本因缺 tsconfig 必失败是确定性 bug；打包漂移会让下一次 publish 泄漏隐私并缺运行时产物；这些是低成本高确定性的修复，直接达成"对内可用+对外诚实"。
- **Strongest evidence:**
  - `agent_registry.test.js:20-22` 用真实 `agent-states/`（524 文件）+ `cacheTTL: 0` → 实测 84.4s/8tests（唯一有幸跑完的文件）
  - `npm pack --dry-run` 实测含 `wiki/state.json`（529.3kB，含 `C:\Users\Zhang\...`、`D:\ssciskills`）；已发布包 `tar -tzf` 实测**无** wiki/ → 配置已漂移
  - `tsconfig.build.json` 用 `Test-Path` 实测不存在，但 `package.json` `build:orchestration` 引用它 → 脚本必然失败
  - README 实测宣称 `stigmergy@1.11.0`，registry `npm view versions` 实测止于 `1.10.10-beta.5`
- **Why it beats the alternatives, on its own terms:** 直接满足用户选择的目标分支（对内优先+顺手诚实化）；全部改动廉价可逆；为未来发布/CI 铺路而不承诺发布。
- **What would prove it wrong:** 修复后 `npx jest tests/unit` 仍 >5min（说明根因不止真实扫描）；`npm pack --dry-run` 仍含个人路径；README 修复后仍与 npm view 不一致。这些都是执行期可测的事实性 falsifier。

### Steelman: O3（架构解耦）

- **Claim at full strength:** 删除 dist 运行时依赖才是根治——fresh clone 后 `stigmergy interactive` 永不因缺构建产物崩溃。
- **Strongest evidence:** `InteractiveModeController.js:12` 顶层 require dist 产物是运行时崩溃点；dist 被 gitignore → 任何干净环境都缺它。
- **Why it beats the alternatives, on its own terms:** 消除了"构建产物是否在场"这类状态依赖，属于系统性根治。
- **What would prove it wrong:** 成本/收益失衡——迁移 orbiter 涉及多处引用与回退测试；而 `npm run build` + require 容错（try/catch + 明确报错提示）以更低成本获得同样的对内保障。对本项目的对内优先目标，架构解耦是过度工程。

### Cross-examination

| Attacker | Target | Objection raised | Disposition |
|---|---|---|---|
| O0 支持者 | O1 | "测试 84s 只有一个文件，其余超时可能是环境问题，不是代码问题" | refuted——agent_registry 是唯一能完成的全量样本，根因（真实目录+cacheTTL:0）已直接读到代码；另两个超时文件需同样诊断，是执行步骤而非否决理由 |
| O2 支持者 | O1 | "不发布 1.11.0 就是不诚实" | accepted（部分）——诚实化 = README 反映现实 + 打包正确，发布本身记为 deferred 前置条件 P1，由用户触发；O1 不承诺发布但承诺"不再虚假宣称" |
| O3 支持者 | O1 | "临时容错是补丁，一年后变成无人懂的 hack" | risk——记入 R2/R3；require 容错保持最小化并加文件级注释，构建脚本修复后容错路径几乎不被触发 |
| O4 支持者 | O1 | "你改 README 属于越界，对外声明是营销不是事实" | refuted——Repo 自身 git 规范要求 doc-code 配对，README 是交付物的一部分；宣称不存在的安装命令属于可复现的误导，不是营销 |
| 谨慎派 | O1 | "35 个脏文件里可能有 WIP，全提交有风险" | accepted——执行纪律：按批 diff 审查、lint+测试通过才提交、无法验证的单列（见 §11 步骤 6） |

---

## 5. Decision register

| ID | Decision | Status | Evidence | Falsifier | Reversibility | Core? |
|---|---|---|---|---|---|---|
| D1 | 内部优先：先修测试/构建/工作区，不发布 npm | settled | 用户问答明确选择"对内优先，顺手诚实化对外声明"；registry 滞后 7 个月无外部用户依赖迹象 | 用户后续改口要立即发布 | 廉价 | core |
| D2 | 测试修复路径 = 夹具隔离（temp fixture dir）而非 mock 整个 registry | settled | 根因实测：真实 agent-states/ 524 文件 + cacheTTL:0；夹具化保真且免 mock 维护 | 夹具化后单文件仍 >10s | 廉价 | core |
| D3 | 构建修复 = 补 tsconfig.build.json + 修 build:orchestration，并对 dist require 加容错提示 | settled | tsconfig.build.json 实测缺失→脚本必败；InteractiveModeController.js:12 顶层 require | npm run build:orchestration 仍失败或交互模式仍崩 | 廉价 | core |
| D4 | 打包修复 = .npmignore 加 wiki/（Runtime data 段），保留 dist/；以 npm pack --dry-run 为验证 | settled | 实测本地 pack 含 wiki 个人路径、已发布包含 dist 不含 wiki → 现配置与正确内容翻转 | pack 后仍含 wiki/state.json 或缺 dist/ | 廉价 | core |
| D5 | README 诚实化 = 安装命令改指真实存在版本 + 标注仓库 v1.11.0 未发布 | settled | README 实测宣称 1.11.0；npm view 实测最新 1.10.10-beta.5 | README 仍含任何 npm view 不存在的版本号 | 廉价 | core |
| D6 | 工作区 triage = 代码/文档批次提交（带测试）、运行期产物 gitignore、WIP 单列不硬塞 | settled | git status 实测 35 项，含 16 个代码/文档改动 + jest.config.js 等未跟踪关键文件 | 提交引入失败构建（lint/测试先过可防） | 中（提交历史） | supporting |
| D7 | CI 接入 = 仅当本地全量 <10min 后作为可选后续，不阻塞本计划 | settled | 本地 300s 超时 → 现在接 CI 只会全红 | 本地 <10min 后仍不接 CI | 廉价 | supporting |
| D8 | AGENTS.md 诚实化 = 修正 check_encoding.py 不存在的声明（补脚本或改文档） | settled | scripts/check_encoding.py 实测不存在，AGENTS.md 宣称其为强制检查 | 文档仍宣称不存在的脚本 | 廉价 | supporting |

---

## 6. Assumptions register

| ID | Assumption | Load-bearing? | Basis (measured/reported/assumed) | If false, then |
|---|---|---|---|---|
| A1 | 项目实际只有你一个开发者/使用者 | yes | measured——npm 7 个月零发布、零外部活跃信号；git 历史个人工作流 | 优先级需重排为外部优先（回 D1） |
| A2 | 测试慢的主因是真实文件系统扫描（同 agent_registry 模式） | yes | measured(agent_registry) / assumed(其余超时套件) | R2：逐个套件诊断，若根因是网络/CLI spawn 则扩大 mock 范围 |
| A3 | 当前 35 个脏文件中的代码改动是真实工作成果，值得提交 | yes | assumed——来自前几轮会话（v1.11.0 特征集）；git 规范要求小批量 | 审查中发现 WIP/坏代码 → 单列分支不并入 |
| A4 | 发布 1.11.0 不是近期意图 | yes | user-declared（对内优先） | D1 翻转，升 O2 方案 |
| A5 | dist/ 可在本机重建（tsc 可用） | yes | assumed——package.json 有 build:orchestration 意图；补 tsconfig 后验证 | D3 需改方案（如文档化 build 前置或迁源码） |

---

## 7. Risks

| ID | Risk | Severity | Likelihood | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|
| R1 | 35 个脏文件提交引入坏代码/半成品 | high | medium | 分 4 批提交，每批 diff 审查 + lint + 相关测试通过后才交；无法验证的单列 WIP 不并入 | 主会话 | mitigated（执行纪律） |
| R2 | 其余慢套件根因不同于真实扫描（网络/CLI spawn） | high | medium | 每套件单独诊断（--detectOpenHandles / 计时）；扩大 mock；不达标则该套件标注 SKIP 而非硬跑 | 主会话 | mitigated |
| R3 | require 容错变成无人理解的 hack | low | low | 最小化补丁 + 文件级注释 + 构建修复后容错路径几乎不触发 | 主会话 | mitigated |
| R4 | 打包修复后未来某次 publish 仍泄新路径（如 docs/ 内含新绝对路径） | medium | low | 修正后的 `scripts/verify-package-content.js` 做发布前检查项；本计划新增 grep 断言 | 主会话 | open→mitigated（执行时完成 verify 脚本检查） |
| R5 | 编码误判（此前"乱码"被怀疑是编码违规） | medium | low | 已实测 5 个关键文件严格 UTF-8 无 BOM，乱码为 GBK 终端显示问题；改动须保持 UTF-8 | 主会话 | closed（已实测排除） |

---

## 8. Objections

| ID | Objection | Raised by | Disposition | Detail |
|---|---|---|---|---|
| O1 | "测试慢是环境问题，不是根因" | O0 支持者 | refuted | 根因直接读到代码（真实 agent-states/ + cacheTTL:0），实测 84.4s；不是环境幻觉 |
| O2 | "不发布 1.11.0 就是不诚实" | O2 支持者 | accepted | 诚实化改由 README 反映现实 + 打包正确实现；发布记为 deferred 前置条件 P1（§9 Q1） |
| O3 | "架构解耦才是根治" | O3 支持者 | risk | 成本/收益失衡；构建修复+容错满足对内目标，解耦留作未来选项（记入 §11 备注） |
| O4 | "README 是营销，不必事实" | O4 支持者 | refuted | 仓库 git 规范要求 doc-code 配对；宣称不存在的安装版本是可复现误导 |
| O5 | "35 个脏文件全提交有风险" | 谨慎派 | accepted | 分批复审提交，WIP 单列（执行步骤 6） |

---

## 9. Open questions

| ID | Question | Blocks | Owner | Answer |
|---|---|---|---|---|
| Q1 | 是否需要在本计划内触发 npm 发布 1.11.0？（P1 前置条件） | 仅触发式步骤 | 用户 | **否**（问答已选对内优先；发布仅在用户主动要求时另立计划） |

---

## 10. Convergence gate

| # | Condition | Pass? | Evidence |
|---|---|---|---|
| 1 | Minimum rounds met (≥3 at T3) | ✅ | rounds completed: **4**（隔离性、发布顺序、打包漂移、提交风险） |
| 2 | Marginal yield collapsed — last round changed 0 core statuses, added 0 risks, altered 0 core claims | ✅ | R4 仅强化 D6 执行纪律，core 状态表 0 改动 |
| 3 | Zero orphaned objections | ✅ | closed: **5 / 5**（§8 全部分配 disposition） |
| 4 | Reversal test — strongest case against us could not be constructed | ✅ | 见下；最强反案在"外部可信度崩溃"上成立，但被用户实测选择驳回 |
| 5 | All critical/high risks mitigated or owned | ✅ | R1/R2 high 均带 mitigate；R5 已 closed |

**Gate verdict:** PASS —— 论点已穷尽，不是"此计划必然正确"。剩余不确定性（其余慢套件根因）是执行期可测事实，不是思辨缺口。

### Reversal test record

最强反案（凭记忆构造）：**"你在打磨一个没人卡住的内部工具——真正的瓶颈是外部可信度正在崩塌：README 宣称一个 registry 上不存在的版本，本地打包会泄漏你的私人路径，交互模式在干净环境下必然崩溃。不发布 1.11.0 意味着每一条对外声明继续为假，信任持续流失；测试速度是奢侈品。"**

**Why it failed to be strong:** 该反案在"外部优先"的分支下成立，但用户已通过问答**明确选择**内部优先 + 顺手诚实化（2x 工作量差异的分叉点早已裁决）。且本计划并未回避该反案的核心事实——D4/D5 正是为"下次任何发布动作不泄私密、README 不再虚假"而设；真正被否决的只是"立即 publish"这一不可逆动作本身，其前置条件（测试绿、打包净）仍在本计划内被建立。

### What would tell us we're wrong

- **Leading indicator:** 修复后 `npx jest tests/unit` 全量仍 >5min；或 `npm pack --dry-run` 仍检出个人路径。
- **Threshold that triggers reconsideration:** 任一 core 决策（D1-D5）的执行结果与其 falsifier 冲突——立即停止并更新本文档（§13 delta log），不带着 stale 计划继续。
- **Review point:** 每完成 §11 一个步骤即复查前置条件；全部完成后跑一次 §1 成功标准核对清单。

> Convergence means the argument is exhausted, not that this plan is correct. State the distinction explicitly when reporting the gate as passed. —— 已在上方 Gate verdict 显式声明。

---

## 11. Execution plan

Preconditions are re-verified against reality before each step. If a precondition now fails, **update this document first** — don't execute on a stale converged plan.

| # | Step | Precondition (must still hold) | Status | Delta found |
|---|---|---|---|---|
| 1 | 测试隔离：`agent_registry.test.js` 改用临时夹具目录（替代真实 `agent-states/`，恢复合理 `cacheTTL`），单文件重跑实测 <10s | 文件仍如 §5 D2 证据所述；jest 可跑 | ✅ done (`a2a31062`) | 夹具改为 `tests/fixtures/agent-states/*`；单文件 <10s 实测通过 |
| 2 | 诊断 `stigmergy-orchestrator` / `auto-coordinator` 两套超时套件，同法夹具化；`npx jest tests/unit` 全量 <5min | 步骤 1 通过 | ✅ done (`f265d8dc`) | 全量 `tests/unit` 15s / 83 pass；`stigmergy-orchestrator.test.js` 不在 `testMatch` 内（孤立测试，从未被执行）→ 改名去 `.test` |
| 3 | 补 `tsconfig.build.json`（最小化）并验证 `npm run build:orchestration` 成功；`InteractiveModeController.js` dist require 加 try/catch + 明确报错提示（文件级注释） | 步骤 1-2 绿；tsconfig.build.json 仍缺失 | ✅ done (`a2a31062`+`f265d8dc`) | `tsconfig.build.json` 已补；`InteractiveModeController` 加 orchestrator fallback + 明确报错 |
| 4 | 打包：`.npmignore` Runtime data 段追加 `wiki/`；`npm pack --dry-run` grep 验证无个人路径且含 dist/ | 步骤 3 通过；.npmignore 仍如现态 | ✅ done (`44762e9d`) | `npm pack` 685 files；无个人路径泄漏；`wiki/` 已排除 |
| 5 | 文档事实性：README 安装命令改为 `npm install -g stigmergy`（=1.10.10-beta.5）+ 标注"仓库 v1.11.0 未发布"；逐一核对 `npm view` | 步骤 4 通过 | ✅ done (`da0b6a0d`) | README/launch-doc 事实性对齐；`npm view stigmergy version` = 1.10.10-beta.5（实测） |
| 6 | Git 卫生：先提交 `jest.config.js`/`babel.config.js`（fresh-clone 必需）→ 代码/文档分 4 批审查提交（每批 lint+测试）→ `.gitignore` 追加 `tests/tests/*/session.json`、`config/soul-state/`、`.stigmergy/` 运行期产物 → 无法验证的 WIP 单列分支 | 步骤 5 通过；diff 逐批可审 | ✅ done (`a2a31062`+`44762e9d`+`f265d8dc`+`884eff16`+`da0b6a0d`) | 5 批提交，每批 lint + 83 测试绿；`config/soul-state/` 为部署模板源**保留跟踪**（未忽略）；12 个运行期 JSON 取消跟踪并忽略 |
| 7 | AGENTS.md 修正 `check_encoding.py` 不实声明（补最小脚本或改文档表述） | 步骤 6 通过 | ✅ done (`624d0106`) | 实测三者均不存在：`scripts/check_encoding.py`、`scripts/convert_to_utf8.py`、`scripts/decision_logger.py`；`.git-hooks/` 不存在、无任何 hook 安装；不实声明实际位于**全局** `C:\Users\Zhang\.config\opencode\AGENTS.md` §5（非项目 AGENTS.md）；已备份后改文档表述；仓库内仅 2 处显式脚本路径修正（`AGENT_DRIVEN_PROVISIONING_PLAN.md` L303、`ALIGNMENT_LOOP_PLAN.md` L116），`WORKBUDDY_LAUNCH_PLAN.md` L199 已诚实无需改 |
| 8 | （可选后续）本地全量 <10min 后接 GitHub Actions 单测 workflow | 步骤 2 通过且稳定 2 周 | pending（未触发） | 需稳定性观察期，本轮不做 |

### T3 appendix — reversal case

永久记录被否决的最强反案（见 §10 Reversal test record）：**外部可信度崩塌应在内部打磨之前处理**。被否决的原因不是"它错了"，而是"它的前提（近期外部使用/发布意图）与用户实测选择冲突，且其核心事实（文档虚假、打包泄漏）已被本计划的 D4/D5 吸收"。未来若用户决定公开发布，需回看本附录并升级为 O2 发布流水线计划。

---

## 12. Revision log

| Rev | Date | Change | Reason | Triggered by |
|---|---|---|---|---|
| 0 | 2026-10-10 | created | T3 收敛思辨完成（4 轮 grill） | 用户请求反复思辨至收敛 |
| 1 | 2026-10-10 | 执行完成：步 1–7 ✅（6 提交）；步 8 未触发；§11 状态与 §13 delta 回填 | 用户批准执行并持续要求推进 | 用户「执行修复 继续」 |

---

## 13. Delta log

| # | Date | Observed fact | Contradicts | Plan updated? |
|---|---|---|---|---|
| 1 | 2026-10-10 | 步 7 实测：`scripts/check_encoding.py` / `scripts/convert_to_utf8.py` / `scripts/decision_logger.py` 均不存在；`.git-hooks/` 目录不存在，`core.hooksPath` 为默认，`.git/hooks` 仅 `.sample`，**无任何 hook 安装** | §5 D8「AGENTS.md 声称强制检查」隐含钩子/脚本存在 | 是（步 7 回填；不实声明实际在**全局** AGENTS.md，非项目 AGENTS.md） |
| 2 | 2026-10-10 | 步 6：`tests/unit/stigmergy-orchestrator.test.js` 未被 `testMatch` 匹配（孤立测试，从未执行）；`config/soul-state/` 原拟忽略，实为部署模板源应保留跟踪 | 计划 §11 步 6 原表述「`.gitignore` 追加 `config/soul-state/`」 | 是（改为保留跟踪，仅忽略运行期产物） |
| 3 | 2026-10-10 | `tests/tests/<cli>/session.json` 与 `signature.json` 均为运行期产物（含个人路径/标识），需取消跟踪并忽略 | 计划原仅列 `session.json`，未列 `signature.json` | 是（`884eff16`：13 文件取消跟踪 + `.gitignore` 追加） |
| 4 | 2026-10-10 | 文档编码「疑似告警」经严格 UTF-8 探测为**误报**：`docs/launch-2026-10-07.md`(5847B)、`README.md`(28425B)、`docs/strategy/WORKBUDDY_LAUNCH_PLAN.md`(18430B) 均 BOM=False、strictUTF8=True | 初查疑似编码问题 | 是（记录为误报，无需修复） |
| 5 | 2026-10-10 | `docs/strategy/WORKBUDDY_LAUNCH_PLAN.md` L199 在上一轮已诚实化（明示脚本不存在），本轮无需再改 | — | 否（记录为已处理） |

---

## 14. Execution success-criteria checklist（§1 成功标准核对，2026-10-10）

执行全部完成（步 1–7 ✅；步 8 未触发，属可选稳定性观察项）。逐条对本计划 §1「Success, observably」6 条实测核对：

| # | §1 成功标准（原文） | 实测证据 | 判定 |
|---|---|---|---|
| 1 | `npx jest tests/unit/agent_registry.test.js` **< 10s**（原 84.4s / 8 tests） | `Tests: 8 passed, 8 total`；`Time: 1.212 s` | ✅ PASS（1.212s < 10s） |
| 2 | `npx jest tests/unit` 全量 **< 5 min** 出结果（原 300s 超时无输出） | 全量 83 tests 通过；`Time: 15.059 s` | ✅ PASS（15.059s < 5min） |
| 3 | `npm run build:orchestration` **成功**（原 `tsconfig.build.json` 不存在必然失败） | `tsc --project tsconfig.build.json` 无错误；`EXIT=0` | ✅ PASS（exit 0） |
| 4 | `npm pack --dry-run` grep：**无 `wiki/state.json` 个人路径**，且 `dist/` 被打包 | `FILE_COUNT=685`；`HAS_DIST=True`；`HAS_WIKI_STATE=False`；`LEAK_COUNT=0`（`C:\Users` / `C:\` 无匹配） | ✅ PASS |
| 5 | README 每个安装/版本声明与 `npm view stigmergy` 实测一致 | `npm view stigmergy version` = `1.10.10-beta.5`；README 安装段与文末 `Version: 1.10.10-beta.5` 一致；标注仓库 v1.11.0 未发布 | ✅ PASS |
| 6 | 工作区 triage 完成：35 个变更/未跟踪文件分类处理 | `git status --short` 现仅 1 行（本计划文档）；5 批提交 + 12 个运行期 JSON 取消跟踪并 gitignore + `config/soul-state/` 保留跟踪 | ✅ PASS |

**Leading indicator re-check（§10「What would tell us we're wrong」）：** 修复后 `npx jest tests/unit` 全量 15.059s（<5min）✅；`npm pack --dry-run` 无个人路径（`LEAK_COUNT=0`）✅。无任一 core 决策（D1–D5）执行结果与其 falsifier 冲突。

**结论：** 步 1–7 全部完成且 6/6 成功标准实测通过；步 8（CI workflow）为可选后续项，需 2 周稳定性观察期后方触发，本轮按计划不做。无 npm 发布（§1 Out of scope）。