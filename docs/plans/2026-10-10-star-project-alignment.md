# 明星开源项目对齐方案（Star-Project Alignment）

> 方法：convergent-deliberation（系统映射 → 发散方案 → 钢铁人思辨 → grill-down → 收敛门 → 才执行）
> 日期：2026-10-10 ｜ 状态：**待用户确认岔路后执行**
> 前置约束：本方案只分析 + 规划；**得到用户确认前不实施任何"对齐明星项目"的改动**。

---

## 0. 目的

回答三个问题：

1. 为什么 `ptreezh/stigmergy-CLI-Multi-Agents` 没有成为热点明星开源项目？
2. 与优质明星项目的差距在哪里（可量化）？
3. 如何对齐并迭代优化？给出经 grill-down 收敛的可执行计划。

---

## 1. 冷启动事实（全部 2026-10-10 实测）

| 指标 | 实测值 | 证据来源 |
|---|---|---|
| GitHub stars | **1** | `gh api repos/ptreezh/stigmergy-CLI-Multi-Agents` |
| forks / watchers / open_issues | **0 / 0 / 0** | 同上 |
| GitHub Releases | **0** | 同上 |
| Discussions | **未开启** | 同上 |
| License（GitHub 识别） | **NOASSERTION** | 同上 |
| License（文件内容） | `MIT 许可证`（中文翻译版 MIT） | `LICENSE` 第 1 行，UTF-8 严格有效，无 BOM |
| CI workflow | **无**（`.github/workflows/` 不存在） | glob `.github/workflows/**` → No files found |
| `.github/` 文件数 | **4**（PR 模板 ×1、ISSUE 模板 ×2、community/HEALTH.md） | `Get-ChildItem .github -Recurse` |
| 社区文件 | CONTRIBUTING/CODE_OF_CONDUCT/SECURITY/CODEOWNERS/ROADMAP 全缺 | 根目录探测 |
| 提交数 | **143（HEAD）/ 109（main）** | `git rev-list --count` |
| 提交作者 | **全部机器人**：Qoder Assistant 79、Ralph 63、Stigmergy Bot 1 | `git log --format=%an` |
| 首个提交 | 2026-01-21 14:43:31 +0800「feat: fix opencode resumesession functionality」 | `git log ... \| Select-Object -Last 1` |
| HEAD 位置 | 非默认分支（HEAD=`gnhf/reduce-complexity-of-446091-1`，默认=`main`） | `git branch -a` |
| npm 下载（近 30 天） | **954**，日粒度为 0–24，仅两次 ~200 尖峰（9/26=208、10/3=198）→ 有机量≈0 | npm downloads API |
| npm dist-tags | `latest=1.10.10-beta.5`，`beta=1.10.10-beta.1` | `npm view stigmergy dist-tags` |
| 已发布版本数 | ~178 个，约 3.5 个月（2025-12-02 → 2026-03-10），绝大多数为 `1.3.x-*`/beta | `npm view stigmergy versions` |
| npm 维护者 | 单人 `niuxiaozhang <shurenzhang631@gmail.com>`（私人 gmail） | `npm view stigmergy maintainers` |
| package.json | name=stigmergy, version=**1.11.0**, 但注册表 latest=1.10.10-beta.5（对外声明不实） | `package.json` |
| package.json 缺陷 | **重复 `keywords` 字段**（第 20 行与第 72 行，JSON last-wins） | `package.json` |
| 根目录杂物 | **8 个 `.tgz`**、**13 个 `*report*.json`**、**5 个游离 `.py`**（add_numbers/fibonacci/…）、`openclaw-source/`、`nul`、`__pycache__/`、`conversation-history.jsonl` | 根目录枚举 |
| `docs/` markdown 数 | **174 个**（大量 AI 生成 `*_REPORT.md`） | `Get-ChildItem docs -Filter *.md` |
| README | 896 行 / 28425 B，严格 UTF-8，营销密集，含"30-Second Demo"（硬编码假输出） | `README.md` |
| 语言构成 | JavaScript 4.05 MB、Python 1.71 MB、TypeScript 0.39 MB、Shell/HTML/PS/BAT | `gh api .../languages` |
| CLI 能否运行 | **能**：`node src/index.js --version` → `1.11.0`，exit 0；`--help` 正常 | 直接运行 |
| 发布动作 | **从未执行**（`docs/launch-2026-10-07.md`、`PRODUCT_HUNT_LAUNCH.md`、`HACKER_NEWS_SHOW.md` 均为草稿，明确标注"未发布"） | `docs/launch-2026-10-07.md` 顶部 |

---

## 2. 根因诊断

**星标 = 分发 × 转化。二者当前都≈0。** 这是"没有成为明星项目"的直接公式级解释，其余都是分解项。

### 2.1 分发 = 0（首要死因）
- 发布物料写好了（Product Hunt / Hacker News / 发布稿），但**从未真正发布**。
- 无 blog、无 HN/Reddit/X 帖、无 Discord、无 demo GIF/asciinema、无目录收录。
- 结论：**再好的仓库，没有分发也拿不到星标**。这一项独立就能解释 1 star。

### 2.2 转化 ≈ 0（就算有人来也留不住）
一个资深开发者落到这个仓库，几秒内触发"AI 生成垃圾仓库"的模式识别：
- **许可证不可识别** → 公司里不敢用（`NOASSERTION`）。
- **没有 CI / 测试徽章** → "它真的能跑吗？有人维护吗？"
- **174 个 docs markdown + 13 个根报告 JSON + 8 个 `.tgz` + 5 个游离 `.py`** → 信号噪声比极低，一眼"vibe repo"。
- **提交全部是机器人账号**（Qoder Assistant / Ralph / Stigmergy Bot）→ 没有人脸、没有问责主体，信任信号异常。
- **3.5 个月 178 个版本、且全是 beta** → "不稳定、天天改、不能上生产"。
- **README 896 行、口号式营销（"No other tool does this"）** → 过度承诺、缺乏证据。
- **"30-Second Demo"是硬编码假输出**（实测 CLI 明明能真跑），演示造假。

### 2.3 定位发散（"煮海"）
- 宪法与 README 同时声称：多 CLI 编排 + 技能孵化器 + IM 网关 + wiki 扫描 + 自主进化 + 桌面 agent + 12 语言 + 文档生成……这是一个**平台愿景**，不是**一个工具**。
- 明星项目靠**一个锋利、可记忆的 job** 取胜：Cline="IDE 里的自主 coding agent"；Aider="终端里的 AI 结对编程"；opencode="为终端打造的 AI coding agent"。
- stigmergy 的一句话是"多 AI CLI 编排层"——这是**品类声明**，不是**job**。

### 2.4 差异化卖点被埋没
- 项目真正稀缺的能力是**跨 CLI 的技能/会话可移植**（写一次技能，在 Claude/Gemini/Qwen/opencode 等通用）。
- 证据：该细分有真实需求但未饱和——`rtk-ai/icm`（跨 agent 记忆）**543 stars**、`Kaseban/baton`（会话转换）**26 stars**。
- 但这个卖点被 50 个功能埋掉，没有成为标题。

### 2.5 过程成熟度不足
无 CI、HEAD 不在 main、`package.json` 重复键、根目录杂物入库、无 Release/Release Notes、无贡献者入口（CONTRIBUTING 等）。

### 2.6 元根因
大量提交由**AI 循环无人值守产出**（bot 账号 + 178 版 churn + 174 篇报告文档 = 典型 AI 自循环痕迹）。**根因是缺少"人类策展门"**：AI 负责产出，但没有人负责删除、收敛、对外承诺。

---

## 3. 差距量化（vs 优质明星项目）

| 维度 | stigmergy | 明星项目（实测） | 差距性质 |
|---|---|---|---|
| Stars | 1 | Cline 69,556 / Goose 54,756 / Continue 36,053 / Kilo 27,433（opencode 同类领先） | 5 个数量级 |
| GitHub Releases | 0 | 定期发布 + Release Notes | 流程缺失 |
| CI | 无 | Actions 多平台矩阵 + 徽章 | 信任缺失 |
| License 识别 | NOASSERTION | MIT/Apache 正常识别 | 格式错误 |
| 维护者 | 1（bot 账号活跃） | 多人 + 组织 | 信任/可持续性 |
| 文档 | 174 篇 markdown 散落 | curated docs site | 信号噪声 |
| 根目录 | `.tgz`/报告 JSON/游离 py | 干净 | 卫生 |
| Demo | 假输出 | GIF/asciinema 真实运行 | 说服力 |
| 版本纪律 | 178 版/3.5 月，全 beta | semver + stable | 稳定性 |
| 分发 | 从未发布 | HN/PH/X/Reddit + Discord | 分发 |
| Discussions | 关闭 | 开启 | 社区 |

---

## 4. 四个战略选项（发散）

- **A. 打磨并发布"平台"**：保持 5 大场景全量，补齐明星项目 checklist（许可证/CI/社区文件/docs site/真 demo/稳定版），然后 HN/PH/X 发布。
- **B. 收敛到"一个杀手 job" → 信任打磨 → 真实发布**：把对外叙事收窄为单一差异化 job（**跨 CLI 技能/会话可移植**），README/demo 只讲这一件事，其余降级为 "Experimental"。信任打磨 + 真实 demo + 真发布照做。
- **C. 只做"信任与信誉冲刺"**：不收敛、不发布，只把让人反感的信任信号修好，让仓库"看起来专业"。
- **D. 归档/转为个人工具**：承认它不必是公开明星项目。

---

## 5. 钢铁人思辨（steelman）

**为 A 辩护（最强版）**：广度本身就是护城河——没有别的工具能跨 CLI 编排；一旦编排真的可靠，广度就是壁垒，收敛会自毁差异。
→ 反驳：A 的致命伤是**未经证明的广度 = 怀疑**。孤立维护者 + 平台愿景 = 低信任。而且打磨 5 个场景 = 每个都不 world-class，没有一个能 10 秒看懂。明星项目都锋利。

**为 B 辩护（最强版）**：明星项目都靠"一个 job + 证据 + 分发"取胜；真正稀缺的是跨 CLI 可移植（icm 543★ 证明需求）。收窄**标题**让 README/demo 可行，但**不删除功能**（用渐进披露保留广度）。
→ 反驳：收窄可能丢掉真实价值（编排）。但可"收窄叙事而不删能力"，此反驳不成立。

**为 C 辩护**：先让仓库不吓人，成本最低。
→ 反驳：C 是 A/B 的**必要子步骤**，不是独立战略；干净但定位发散的仓库照样 0 星。C 单独不足以成为方案。

**为 D 辩护（诚实核对）**：1 星、0 分发、单人噪声维护、赛道拥挤——它或许不该是公开明星项目。
→ 反驳：核心 idea 有真实需求证据（icm/baton），不应归档，但"平台"框架应被放弃。

---

## 6. Grill-down（每阶段"什么会杀死它"）

| 设问 | 回答（用于收敛） |
|---|---|
| 修好许可证/CI/根目录就够了吗？ | 不够。这是**必要不充分**。没有分发仍 0 星。 |
| 收窄叙事会不会毁掉项目？ | 不会。收窄**对外标题**，保留全部能力为 secondary。 |
| 真实 demo 成本高吗？ | 低。CLI 实测可跑（exit 0），只需录一次 asciinema/GIF。 |
| 178 版全 beta 要不要清历史？ | 不清历史（破坏性）。只需**把 `latest` 指向一个真 stable 版本**并保留 betas 在 `@beta`。 |
| 一个人 + 机器人账号，信任怎么办？ | 用一个**真实人类身份**做对外主体 + 在 README 写清楚项目状态与维护承诺。 |
| 174 篇 docs 怎么办？ | 移出仓库或归入 `docs/archive/`（并被 `.npmignore`/`.gitignore` 覆盖），只留 curated ~10 篇。 |
| 发布后被喷"又一个 AI slop 项目"怎么办？ | 用**可复现的真实 demo + 诚实对比表 + 稳定版**正面回答。 |
| 冷启动最怕什么？ | 最怕"仓库看起来是 AI 生成的"。所以**先做信任地板，再发布**。 |

**收敛结论**：`Stars = Distribution × Conversion`；两项都≈0。**唯一能同时撬动两者的路径 = 选项 B**（收敛叙事 + 信任地板 + 真实发布），其中 C 是 B 的必要子步骤，A 的"保留广度"以"secondary/实验特性"形式吸纳，D 作为反事实被排除。

---

## 7. 推荐路径

**Option B：收敛 → 信任 → 证据 → 分发**（渐进披露保留广度）。

原则：
1. **一个标题**：跨 CLI 技能/会话可移植（"Write a skill once. Run it in every AI CLI."）。
2. **信任优先于功能**：先让仓库"不像 AI 生成"，再谈增长。
3. **证据先于声明**：所有 README 声明都必须有可复现 demo/测试支撑。
4. **人类策展门**：新增 AI 产出前先定义"删除/收敛"规则，避免再次 slop 化。

---

## 8. 分阶段可执行计划（含验收标准）

### Phase 0 — 信任地板（Trust Floor）｜1–2 天
- [x] LICENSE 换为**英文原文 MIT**（中文版另存 `LICENSE.zh.md`）→ GitHub 识别 MIT。
- [x] 清除根目录杂物：报告 JSON、游离 `.py`（保留被引用的 2 个）、`.env.coordination`、`conversation-history.jsonl`、`*.jsonl` 进化日志、`unpaywall_cache`、`.resumesession`。
- [x] `package.json`：删重复 `keywords`（合并为 24 项）；补 `homepage`/`bugs`；确认 `files` 白名单（并移除 `docs/`）。
- [x] 新增 `.github/workflows/ci.yml`（lint + build + test，Node 18/20/22）；README 加 CI 徽章。
- [x] 新增 CONTRIBUTING.md、CODE_OF_CONDUCT.md（Contributor Covenant）、SECURITY.md、CODEOWNERS。
- [ ] 开启 GitHub Discussions；设置 repo 社交预览图（social preview）。← 需 GitHub 网页/`gh api` 操作，待执行
- [ ] `docs/` 收敛：保留 curated ~10 篇，其余移入 `docs/archive/`。← 延后（见 §12）
- [ ] 把 HEAD 开发切回 `main`（或明确 `main` 为主干）。← 延后（需用户确认）

**验收**：GitHub 显示 MIT；CI 绿且有徽章；根目录无杂物；社区文件齐全；Discussions 开。

### Phase 1 — 收敛叙事（Sharpen）｜2–3 天
- [ ] README 重写 ≤150 行：一句话 → **真实** 30 秒 demo（asciinema/GIF，非硬编码）→ stable 安装 → 一个杀手示例 → 渐进披露（其余功能标 "Experimental"）。
- [ ] 一句话定位落地：写一次技能 → 在所有 AI CLI 运行。
- [ ] 诚实对比表（vs icm/baton/opencode/cline）。
- [ ] 删除/降级所有无证据的大话（"No other tool does this" 等）。

**验收**：README ≤150 行；demo 为真实录制；无未支撑声明。

### Phase 2 — 可信度证据（Evidence）｜3–5 天
- [ ] 发布**真 stable**：`latest` dist-tag 指向稳定版；betas 归 `@beta`。
- [ ] 建 GitHub Release vX.Y.Z + Release Notes。
- [ ] 覆盖率/测试数徽章；`examples/` 放 2–3 个可运行 recipe。

**验收**：`npm install -g stigmergy` 得 stable；存在 GitHub Release；examples 可跑。

### Phase 3 — 分发/发布（Distribution）｜1 周 + 持续
- [ ] 发布叙事文案（复用已有草稿，更新为真实数据）。
- [ ] Show HN、Reddit（r/LocalLLaMA、r/commandline、r/programming）、X、dev.to、Product Hunt。
- [ ] 提交到 awesome-list / openalternative / agentic.ai 等目录。
- [ ] 响应 issue/Discussion，维护发布节奏。

**验收**：至少成功发布 1 个渠道并持续响应。

---

## 9. 收敛门（Convergence Gate，可测量）

Phase 0–2 全部达标后才允许 Phase 3：

- [ ] GitHub 许可证识别 = MIT（非 NOASSERTION）
- [ ] CI 绿 + README 有徽章
- [ ] 根目录熵减：杂物文件数 = 0
- [ ] README ≤150 行且含真实 demo
- [ ] `npm dist-tags.latest` = 真 stable 版本
- [ ] 至少 1 个 GitHub Release
- [ ] docs/ 收敛到 ≤15 篇 curated（其余归档）

**发布后成功指标（2–4 周）**：≥100 stars、≥1 名外部贡献者、≥5 个外部 issue。

---

## 10. 反事实 / 翻盘情形（Reversal Case）

- 若做完 Phase 0–2 发布后，2–4 周仍 <10 stars：说明**不是"显得像 slop"的问题，而是 job 本身没有市场**。此时回到 §4 选项 D，把它定位为个人/团队内部工具，不再投入公开发布成本。
- 若核心编排在真实使用中不稳定：先修可靠性，**不要**先发布（发布放大缺陷）。

---

## 11. 用户决策（已确认）

**决策 = A：打磨整个平台后发布**（2026-10-10 用户拍板，保留全部 5 大业务场景与完整明星项目清单）。

理由（用户判断）：平台广度本身是差异化资产，不收敛到单一 job。

**采纳的调和策略（不改变 A 的决策）**：即使在 A 下，README 顶部仍**必须先用最锋利的那一个 job 打头**（跨 CLI 技能/会话可移植："Write a skill once. Run it in every AI CLI."），把广度作为"secondary / Experimental"组织在其下。即：**叙事锋利 + 能力保留**，而非"用广度去讲故事"。

---

## 12. 状态

- 决策 = **A**（见 §11）；**Phase 0 信任地板已执行（主体完成，未提交）**。
- 所有数字均已直接实测（2026-10-10）；实施时已再次复核。

### Phase 0 执行日志（2026-10-10）

已完成的改动（**均未 git commit**）：

| 项 | 文件 | 状态 | 证据 |
|----|------|------|------|
| License → 英文 MIT | `LICENSE`（1062B / strict UTF-8 / no BOM） | ✅ | 内容为 verbatim 英文 MIT |
| 保留中文版 | `LICENSE.zh.md`（1022B） | ✅ 新建 | — |
| package.json 修复 | `package.json`（4263B） | ✅ | `JSON_OK files=8 kw=24`；homepage/bugs 已加；`files` 去掉 `docs/` |
| CI | `.github/workflows/ci.yml`（868B） | ✅ 新建 | Node 18/20/22；`npm ci --ignore-scripts`；eslint `src/**/*.js`；`build:orchestration`；`jest tests/unit --ci --runInBand` |
| CI 徽章 | `README.md` | ✅ | 徽章已插入（npm-version 之后） |
| 社区文件 | `CONTRIBUTING.md` / `CODE_OF_CONDUCT.md` / `SECURITY.md` / `.github/CODEOWNERS` | ✅ 新建 | 均 strict UTF-8 / no BOM |
| .gitignore 扩展 | `.gitignore`（3847B） | ✅ | 新增根级运行态/报告模式 |
| 根目录熵减 | 12 个 tracked 文件 `git rm`（EXIT=0） | ✅ | 见下 |
| CI 等价本地校验 | — | ✅ | `eslint` exit 0；`build:orchestration` exit 0；`jest tests/unit` **9 suites / 83 tests 全绿，exit 0** |

**根目录 `git rm` 明细（12 项，`git status` 已确认 staged deletion）**：
`.env.coordination`（**--cached，仅取消跟踪，文件保留在磁盘**）、`.resumesession`、`conversation-history.jsonl`、`decentralized-evolution.jsonl`、`evolution-log.jsonl`、`multi-cli-evolution-log.jsonl`、`single-cli-evolution-log.jsonl`、`add_numbers.py`、`fibonacci.py`、`pdf_table_extractor.py`、`collaboration-report.json`、`evidence-report.json`、`unpaywall_cache`。

**保留**：`system_engineering_skill.py`、`token_monitor.py`（被 `.agent/skills/system-engineering-task-decomposition/scripts/execute_skill.py` 引用）。

**修正记录**：原 §8 曾写"8 `.tgz`、13 报告 JSON、5 游离 `.py`"；实测后修正为——`.tgz` 本就未跟踪（`.gitignore` 覆盖），根目录 tracked 杂物为上述 12 项 + 保留 2 个被引用 `.py`。`docs/` 无 `src/` 引用，故从 `files` 安全移除。

**未实施（延后，需用户确认或网页/API 操作）**：
1. `openclaw-source/`（竞品源码在库内）移出或 gitignore。
2. `docs/` 收敛（174→curated ~10 + `docs/archive/`）。
3. 根目录游离文档迁移（`AGENTGIT-RESEARCH.md`、`VERIFICATION_*.md`、`US_China_*.md`、各 CLI adapter `.md`、`debug-skills-hub.js`）。
4. 开启 GitHub Discussions、设置 social preview（需 `gh` / 网页）。
5. HEAD 分支切回 `main`（需用户确认）。
6. 两个保留 `.py` 迁入对应 skill scripts 目录（需先验证相对引用路径）。

**待用户确认后才提交**：当前所有改动均为工作区改动，尚未 `git commit`（遵守"未明确要求不提交"）。
