# 明星开源项目对齐 — Rev 2（Wave A/B/C 复盘 + 待确认门）

> 继承 `docs/plans/2026-10-10-star-project-alignment.md`（Rev 1，convergent-deliberation 框架 + grill-down）
> 实施日期：2026-10-11 · 状态：**Wave A/B/C 已落地（本地可逆）；不可逆动作仍待用户确认**
> 前置约束继承：本方案只分析 + 规划；**得到用户确认前不实施任何"对齐明星项目"的不可逆改动**（发布、远程仓库写、Releases 创建）。

---

## 0. 目标

回答 Rev 1 的悬而未决问题：

1. Rev 1 留下的"待用户确认"清单，本轮处理到哪一步？
2. Rev 1 实测之后的本地可逆优化（Wave A/B/C）是否到位、是否经得起再次实测？
3. 下一轮 grill-down 应该收敛到哪一条？

---

## 1. 实测基线刷新（2026-10-11 实测）

| 指标 | 2026-10-10（Rev 1） | 2026-10-11（Rev 2 实测） | Δ |
|---|---|---|---|
| 本仓库 stars | 1 | 1 | 0 |
| forks | 0 | 0 | 0 |
| open_issues | 0 | 0 | 0 |
| watchers | 0 | 0 | 0 |
| GitHub `has_releases` | falsy | falsy | 0 |
| GitHub `has_discussions` | True | True | 0 |
| License | MIT | MIT | 0 |
| `pushed_at` | 2026-10-11 02:43:58 | 2026-10-11 02:43:58 | — |
| 追踪文件数 | 766 | 766 | 0 |
| npm `latest` dist-tag | 1.10.10-beta.5 | （未刷新，本地 `package.json` v1.11.0 不变） | — |
| **Niche peer `rtk-ai/icm`** | **543 ★** | **579 ★** | **+36** |
| **Niche peer `Kaseban/baton`** | **26 ★** | **27 ★** | **+1** |
| **Closed-loop peer `cline/cline`** | **69,556 ★** | **70,173 ★** | **+617** |
| Rev 1 引用的 "Proliferate 151 ★" | 路径未在 Rev 1 文档化 → 404 | — | — |

证据：直接 `Read` GitHub `GET /repos/{owner}/{repo}` API（User-Agent header，`TimeoutSec 30`），2026-10-11 同步执行；非缓存。

**判断**：本仓库星数没动，但同体量赛道（icm/baton）的星数在 24h 内依然在涨。**Rev 1 的判断成立**——"差距不在质量而在不在赛道曝光"。本轮已落地的 Wave A/B/C 是"先把自家院子打扫干净"的工作（不可逆动作还是要等用户确认）。

---

## 2. 本轮已落地 Waves（本地可逆，全部 git 已提交但未 push）

### Wave A — `fee1c0f3` chore: untrack runtime agent state and simplify ignores

- 22 个文件从索引移除（路径不再 tracked，但磁盘保留）：
  - `.stigmergy/`、`.soul-evolution-results/`、`.wiki-articles/`、`bus/`、`independent-resume/`（整体目录，git-rm-cached 后由 .gitignore 接管）
- `.gitignore` 新增整目录忽略 + `docs/archive/**/*.zip` / `docs/archive/**/*.png` 重新忽略（防止 archive 内的中间产物误入索引）。
- 意图：把"运行时 agent 状态"和"历史发布产物"从公开仓库的可扫描表面拿掉，缩小暴露面。

### Wave B — `fea9e0e2` docs: consolidate legacy docs into docs/archive (phase B)

- 75 R（重命名）+ 3 A（新增：`docs/archive/strategy/workbuddy-skills/planning-with-files/templates/{findings,progress,task_plan}.md`）+ 1 D（`docs/.stigmergy/status/PROJECT_STATUS.md` 物理副本迁入 archive）= 79 个 git 变化。
- 意图：Rev 1 计划中 Track 3（c2e989c9）的延续，把顶层游离 doc 全部归位 archive。

### Wave C — `87d257dd` fix(docs): restore broken links after phase B archive consolidation

- 31 个链接重写（22 行 +/-），4 文件：根 `README.md`、索引 `docs/README.md`、两个 `analysis/*.md`。
- 意图：Wave B 把文件搬到 archive，但 `docs/README.md`、根 README、两个分析文档还在引用旧路径——**修了 Wave B 自己引入的链接腐烂**。
- 验证（实测）：
  - `docs/README.md`：45/45 链接全部可解析（修前 28/45 失败，修后 0 失败）。
  - 根 `README.md`：16/16 可解析。
  - `docs/analysis/OpenClaw-Evolution-Mechanism-Analysis.md`：3/3 可解析。
  - `docs/analysis/openclaw-evolution-mechanism-deep-dive.md`：1/1 可解析。
- 全仓链接审计还发现 49 个失败链接 → 33 在 `docs/archive/*`（archive 自身的"历史遗留腐烂"，非 Wave B 引入，不在本轮 scope）+ 16 在 `skills/` 和 `config/superpowers/` 的 `two-agent-loop/SKILL.md` 兄弟引用（与本轮 archive 移动无关，也不修复）。

---

## 3. 不可逆动作门（仍是 Rev 1 的待确认集，本轮**未执行**任何一项）

| # | 动作 | 风险面 | Rev 1 决策状态 | 当前状态 |
|---|---|---|---|---|
| 1 | npm 发布 `1.11.0` stable（`npm publish --tag stable`, 然后 `npm dist-tag add stigmergy@1.11.0 stable`） | 公开供应链；npm dist-tag 错配会被用户全局拉取；公告承诺（CHANGELOG #1.11.0 已写）需要可发布代码配套 | 待用户确认 | **未执行**；`package.json` v1.11.0 在仓；npm `latest` 仍 `1.10.10-beta.5` |
| 2 | GitHub 启用 Releases / 启用 Discussions（`POST /repos/.../releases` 之类 API） | Releases 创建后无法"软删除"，必须发新 release；Discussions 启用同样可见 | 待用户确认 | **未执行**；`has_releases` 仍 falsy，`has_discussions` 已 True |
| 3 | 创建 asciinema / GIF demo，落地到 `examples/quickstart.md` 引用位 | 文件本身不可逆；视觉品牌选择 | 待用户确认 | **未执行**；README L131 留作承诺 |
| 4 | 修复幽灵命令：`stigmergy resume` 在 `package.json` `bin` 中被引用但未在 CLI router 中实现 | 用户已经看到命令但运行失败，**这本身就是一种"半曝光"风险** | 待用户确认 | **未修复**；已记录 |
| 5 | 全量审计 `scripts/` 153 文件，挑出可发布的稳定脚本（vs 实验/历史） | 同 npm 发布-Reputable 风险面 | 待用户确认 | **未执行**；脚本状态未定 |

**所有 5 项均未触发**——本轮严格遵循 Rev 1 前置约束"得到用户确认前不实施"。

---

## 4. 隐式决策（已写入代码/索引，未来等价动作默认走同一条路）

1. `docs/archive/**` 现在有 228 tracked 文件，是仓库的"历史档案"。**新增档案默认走 archive/**；任何"把 archive 顶上 docs/README 索引"的动作必须经过链接审计（与本轮 Wave C 同一脚本）。
2. `.gitignore` 的"运行时整目录忽略"白名单已稳定：`.stigmergy/`、`.soul-evolution-results/`、`.wiki-articles/`、`bus/`、`independent-resume/`、`.stigmergy/status/`。**任何新增的 agent-runtime 路径也走这套忽略**——避免被无意 tracked 后再走 untrack。
4. 链接腐烂审计脚本（`# FULL repo-wide relative link audit`）现在被本计划绑定。**每一波 doc 移动后必须跑一次**，直到剩下 ≤ 5 个非 archive 链接失败。

---

## 5. 下一轮 grill-down 候选（待用户挑）

收敛门：再跑一轮就把"差距"问题推到极限——差距在哪儿就改到哪儿，剩下的不可逆动作依然等用户。

候选 A：**做"Star 路径"。** 把现有 npm CHANGETOP 改名→发 1.11.0 stable→修复幽灵命令→启用 GitHub Releases+Discussions 一条龙。需要用户对每条都答 yes。

候选 B：**做"赛道精度"。** 把 README 的"How it compares"行扩成完整 10 行表格，每个 niche peer 都给出实测链接；并把 `examples/quickstart.md` 改成"60 秒能验证一次"的可执行 doctest。

候选 C：**做"社区信号"。** 把 `CONTRIBUTING.md` 缺失这件事优先补齐；启用 Discussions → 设置 4 个分类（Q&A/Show & Tell/Ideas/General）；轮值 cron 启一次 weekly digest。

候选 D：**做"Ghost 清理"。** 把幽灵命令 `stigmergy resume`（以及任何在 `bin` 中被引用但 router 没实现的命令）全部 grep 出来，要么实现要么下线；以及把 scripts/ 153 文件中所有 `node test_*` 一类的 stub 脚本清出（如果被 npm `files` whitelist 包括的话）。

---

## 6. 收尾纪律自检

- [x] 三轮 commit 全部本地，未触发 remote（无 `npm publish`、没有 `git push`）。
- [x] Wave A 移除的 runtime 目录**磁盘上还在**（`git rm -r --cached`），可以从 `.stigmergy` 直接读回。
- [x] Wave B 的 archive 文件**磁盘上还在**（纯 rename + 路径未触碰内容）。
- [x] Wave C 的链接改写只动了 22 行/4 文件，diff stat 严格 22+/22-。
- [x] 工作区状态 clean（`git status --short` empty）。
- [x] 追踪文件数 766，未变。
- [x] npm pack dry-run：429 文件 / 4.5 MB unpacked；runtime 路径在 tarball 中 = 0；docs/ 在 tarball 中 = 0（`package.json` 的 `files` 白名单从未包含 docs/，Rev 1/Rev 2 不变）。
- [x] GitHub `pushed_at` = 2026-10-11 02:43:58（Wave C commit 之后**没有 push**，所以 remote 时间未刷新——本地领先 remote 4 commits）。

---

## 7. 引用

- Rev 1：`docs/plans/2026-10-10-star-project-alignment.md`（2026-10-10，convergent-deliberation 框架）
- Track 3 commit：`c2e989c9`（docs/archive 142 + docs/README.md 索引首次落地）
- 本轮 commits：`220cfe01`（已存在于 Rev 1 之前）→ `fea9e0e2`（Wave B）→ `fee1c0f3`（Wave A）→ `87d257dd`（Wave C，本轮）
- npm pack 验证：`npm pack --dry-run --json` 2026-10-11 实测
- GitHub API：2026-10-11 直接 `Invoke-RestMethod` 实测