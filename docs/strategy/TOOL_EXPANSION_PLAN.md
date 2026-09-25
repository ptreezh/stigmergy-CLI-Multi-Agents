# 多工具一键安装 + 会话切换 + 技能共享扩展方案

> 状态: **已确认 v0.2 终稿** (C1-C4 用户拍板: 2026-09-25; 含 2026-09-25 二轮核查修正: qwenwork `~/.qwenworkcn`/doubao 无 CLI)
> 生成日期: 2026-09-25
> 依据: 官方文档/产品页 + 本机实测 (bash/rg 实测复核，非转述)
> 关联: WORKBUDDY_LAUNCH_PLAN.md (技能上架基线，仍待评审)

---

## 0. 结论摘要 (Executive Summary)

用户需求: stigmergy 目前只能一键安装 **CLI 工具**，现在要**一键安装更多 `qwenwork workbuddy traework qoderwork coze doubao`**，
并支持这些工具之间的**会话切换、技能共享、agentgit**。

**第一性原理核对后的本质发现: 目标 6 工具不是同一种东西，必须分三类处理。**

| 类别 | 工具 | 安装形态 | 本机状态 (2026-09-25 实测) |
|---|---|---|---|
| A. 已有 CLI 且已装 | `coze` | `npm -g @coze/cli` | ✅ 已装 v0.2.0 |
| B. 桌面 Agent 应用 (无 PATH 命令) | `workbuddy` | Windows 安装器/腾讯客户端 | ✅ `~/.workbuddy` 已存在 (**64 子目录**, workbuddy.db 2.75MB+4MB WAL, brain+memory markdown 可读, skills/ 44 技能) |
| B. 桌面 Agent 应用 | `qwenwork`(千问办公) | 阿里客户安装器 | ✅ **已装修正**: `~/.qwenworkcn` 存在 (**CN 后缀**, 非 `~/.qwenwork`; `projects\C--Users-Zhang\*.jsonl`=51 个 CLI 格式会话日志, skills/ 29 项, bin\dws.cmd shim, 版本 1.1.32, APPDATA=QwenWorkCN) |
| B. 桌面 Agent 应用 | `traework` | 字节 Trae 客户端 | ❌ `~/.traework` 不存在 (未装; `~/.trae`=trae IDE, `~/.trae-cn`=**TRAE CN IDE**, 均非 traework) |
| B. 桌面 Agent 应用 | `qoderwork` | Alibaba Qoder 桌面 | ❌ 未装 (**Windows 版 Q2 2026 才发布**; 本机是 Windows) |
| B. 桌面 Agent 应用 (有 CLI) | `kimiwork`(kimi-code/kimi-work) | 月之暗面桌面客户端 + CLI | ✅ **已装**: **`kimi.exe` CLI v0.31.1** (`~/.kimi-code/bin/`); 会话=`sessions\wd_*\session_*\agents\main\wire.jsonl` (protocol 1.4 可解析); `~/.kimi-work/bin/kimi-tools/`=kimi-slides |
| B. 桌面 Agent 应用 | `marvis` | marvis 桌面客户端 | ✅ **已装**: `~/.marvis` (messages\*.md=**定时任务记录非对话**, database\data.db **13.9GB**+memory.db 434MB, skills/{custom,market}, 8 进程运行中, 无 CLI) |
| C. 桌面 App (非 CLI) | `doubao` | 字节豆包桌面客户端 | ✅ **已装修正**: `~\Doubao\` (**无点前缀**, 非 `~/.doubao`; chats\YYYY-MM-DD\new-chat*=**工作区/技能产物**, skills/geo-seo-claude, 会话存储=LOCALAPPDATA\Doubao\User Data (Chromium LevelDB), 运行中, 无 CLI) |

**方案核心 (3 条线)**:

1. **一键安装/检测**: 把 `CLI_TOOLS` 从"CLI 工具注册表"扩展为 **"AI 工具注册表"**，
   新增 `type: "cli" | "desktop"` 字段:
   - `cli` 型 (coze, doubao-cli, codex, claude, ...): 走现有 `enhanced_cli_installer` (命令式安装)
   - `desktop` 型 (workbuddy, qwenwork, traework, qoderwork): 走**目录检测 + 官网安装器引导**
     (不假装能静默安装外部桌面 App; 检测存在即可标记 installed 并可接入会话/技能)
2. **会话切换**: 在已规划的 A+B+C `session_harvester` (6 parser: claude/qwen/qoder/codex/coze/trae + marvis(db) + kimi(wire.jsonl) + qwenwork(jsonl))
   基础上**扩展桌面应用会话源**: workbuddy 的 `sessions/*.json` **实测=本地进程心跳探针**
   (pid/sessionId/endpoint/kind:interactive/mode:local 元数据, **无对话内容**) → 仅作安装/活跃检测, 不入 parser;
   **对话级恢复 = 只读反解 `workbuddy.db` (SQLite 主库 2.75MB + 4MB WAL, C4 已授权, 只读不改写)**;
   **记忆级恢复 = `brain/*.md` + `memory/*.md`** (markdown 记忆, 实测 10-21KB); 双轨采集 → `~/.stigmergy/memory/`。
   doubao/qwenwork/kimiwork/marvis 均已装且会话存储可解析 (见 §1.1); 未装仅 traework/qoderwork → 仅登记+引导。
3. **技能共享**: 复用 WORKBUDDY_LAUNCH_PLAN 已定案的 **SKILL.md 上架管线** (frontmatter 适配 + `~/.workbuddy/skills/<名>/`):
   `stigmergy skill deploy --target workbuddy` 把 stigmergy 的 18 技能同步到 `~/.workbuddy/skills/`。
   **实测: 该目录已存在 44 技能，但 stigmergy 18 个一个都没有** → 技能共享对 workbuddy 是即时可落地、零新增格式成本。
4. **agentgit**: **已确认 = btucker/agentgit** (GitHub, Go 轻量 CLI, JSON 版本控制 + diff + 会话回放, §1.3 候选1)。
   集成 = 登记安装 (Go binary) + harvester/resume 可选钩子 (Phase 4)。

---

## 1. 事实基础（全部实测/官方文档核对）

### 1.1 目标工具身份矩阵 (官方文档实测)

| 工具 | 官方身份 | 安装途径 | 本地数据目录 | 会话存储 | 技能目录 | CLI 有无 |
|---|---|---|---|---|---|---|
| **qwenwork** | 阿里云「千问办公」AI 生产力平台 (桌面+网页) | 官方客户端下载 | `~/.qwenworkcn` ✅ 已装 (**CN 后缀**, 非 `~/.qwenwork`; projects\C--Users-Zhang\*.jsonl=51 个会话日志) | JSONL 会话日志 (qwen CLI 风格 {type,sessionId,timestamp,message:{role,content}}, 可解析) | `skills/` ✅ 29 项 | 无 (仅 bin\dws.cmd shim v1.1.32) |
| **kimiwork** | 月之暗面 Kimi 办公/编程客户端 (kimi-code + kimi-work) | 桌面客户端 + CLI | `~/.kimi-code` ✅ + `~/.kimi-work` ✅ | `sessions\wd_*\session_*\agents\main\wire.jsonl` (protocol 1.4: metadata/config.update/systemPrompt, 可解析) | `~/.kimi-code/skills/` (browser-skill 等) | ✅ **CLI: `~/.kimi-code/bin/kimi.exe` v0.31.1** (+ ~/.kimi-work/bin/kimi-tools/kimi-slides.exe) |
| **marvis** | marvis 桌面客户端 | 桌面客户端 | `~/.marvis` ✅ (database\data.db **13.9GB** + memory.db 434MB) | `messages\*.md`=**定时任务记录非对话** (frontmatter: id/type:schedule/meta{prompt,status}); 对话存储=database\data.db (SQLite) | `skills/{custom,market}` ✅ | 无 |
| **workbuddy** | 腾讯全场景 AI 办公工作台 (桌面客户端) | workbuddy-cn.com.cn 下载 | `~/.workbuddy` ✅ 64 子目录 | **`sessions/*.json`=心跳探针(无对话)**; **对话全文=只读反解 `workbuddy.db` (2.75MB 主库 + 4MB WAL, C4 已授权)**; 记忆=`brain/*.md`+`memory/*.md`(markdown) | `skills/` ✅ 44 技能 | 无 (where.exe 无命中) |
| **traework** | 字节 Trae 的新办公客户端 (网页/桌面/移动三端, Work/Code/Design 双模式) | Trae 官方 | `~/.traework`? (未装); `~/.trae` = trae IDE | `~/.trae/chat/<id>/chat_histories.json` (IDE 的, 已实证可读) | 未知 | 无 |
| **qoderwork** | Alibaba Qoder 推出的桌面 AI Agent (Work 模式) | qoderwork.org | `~/.qoderwork`? (未装) | 未知 | 未知 | 无 (**Windows 版 Q2 2026 才发布**) |
| **coze** | 扣子 Coze (字节) 的 AI 智能体平台 | `npm -g @coze/cli` ✅ | `~/.coze/config.json` (⚠ 含 patToken) | 本地无会话 (bridge 不支持 CONFIG_DIR 覆盖) | 无 | ✅ **CLI 已装 v0.2.0** |
| **doubao** | 豆包 (字节) AI 助手 | 豆包桌面客户端 (官方无 CLI) | `~\Doubao` ✅ 已装 (**无点前缀**, 非 `~/.doubao`; chats\YYYY-MM-DD\new-chat*=工作区/技能产物) | 会话存储=LOCALAPPDATA\Doubao\User Data (Chromium **LevelDB**, 读取复杂度高 → 会话级不做) | `skills/geo-seo-claude` (git 仓库) | 无官方 CLI |

### 1.2 代码库实测 (2026-09-25)

| 项目 | 实测值 | 证据 |
|---|---|---|
| CLI_TOOLS 条目数 | **24 条** (16 原有: cc-connect/bun/claude/gemini/qwen/iflow/opencode/qoder/codebuddy/resumesession/oh-my-opencode/kilocode/copilot/codex/kode/opencli + 7 desktop: workbuddy/qwenwork/traework/qoderwork/doubao/kimiwork/marvis + coze) | cli_tools.js L11-335 实测 |
| 条目格式 (claude 样例) | `name/version/install/hooksDir/config/autoInstall/skills:{dir,format,supportsHooks,hookFormat}/plugins` | cli_tools.js L33-50 |
| **type 字段已引入** | `type: "im-gateway"` 1 条 (L14) + `type: "desktop"` 7 条 (L280-328, 经 `DESKTOP_TOOLS.xxx.name` 引用 desktop-tools.js) + 默认 cli | cli_tools.js L14/L277-335 实测 |
| scanForTools 机制 | `detectAllCLIPaths()` → cli 走 `checkIfCLIExecutable()`, desktop 走本机目录检测 (`fs.existsSync(localDir)`) → found/missing | cli_tools.js L587-625 + L678/L701 type 分支实测 |
| **coze 已登记** | CLI_TOOLS L334-341 coze 条目 (`version: coze --version`, `install: npm install -g @coze/cli`) | cli_tools.js L334-341 实测 |
| enhanced_cli_installer | 批量/并发 (concurrency=6), 无 per-tool 权限检查, install 字段命令驱动 | enhanced_cli_installer.js 实测 |
| 会话路径检测基线 | `stigmergy-resume.js` `getAllCLISessionPaths()` 覆盖 claude/gemini/qwen/iflow/qodercli/codebuddy/codex/kode | stigmergy-resume.js L1-80 |
| router 挂载 | deploy (L252-255), call (L312-317), interactive (L327-336), resume (L488-498) | router-beta.js |
| skills 命令 | `src/cli/commands/skills.js` (install/list/read/remove/validate/sync) | README 实证 |

### 1.3 agentgit 候选解释 (需用户确认)

| # | 候选 | 形态 | 安装 | 与需求契合度 |
|---|---|---|---|---|
| 1 | `btucker/agentgit` | CLI: **coding agent transcripts → git repos** (`agentgit session.jsonl -o ./output`) | uv/PyPI | 中-高: 会话转 git 仓库, 与 stigmergy 会话存档互补 |
| 2 | `agent-git` (PyPI AgentGit) | Python 库: **"Git for AI Memory. Prevent hallucinations with save points."** (记忆快照/回滚, 内置 OpenAI/Anthropic/LangChain/OpenClaw 集成) | `python -m pip install agent-git` (本机 python 3.12.0rc3 + py -m pip 26.1.2 可用) | 中: 给 agent 记忆加版本控制 |
| 3 | `agit-ai` (aGiT) | CLI: **交互式 coding-agent 包装 git** (支持 OpenCode/Claude) | `pip install agit-ai` | 中: agent+git 包装器 |
| 4 | `@open-gitagent/gitagent` | npm: **"your agent IS a git repository"** (agents as repos) | `npm -g @open-gitagent/gitagent` | 低-中: 范式最激进 |

> ⚠ 所有候选本地均未安装 (`where.exe agentgit` 无命中 → 上一轮 A 组实证)。用户说 "agentgit" 一个词无上下文, 4 个候选工作方式差异 ≥2x → **必须确认**。

---

## 2. 战略判断（第一性原理）

### 2.1 "一键安装"对两类工具的真实语义不同

- **CLI 型**: `npm install -g X` / `pip install X` → 纯命令, enhanced_cli_installer 现有能力直接覆盖。
- **桌面型**: 真实安装 = 下载安装包 → 静默安装 (耦合平台更新/签名/凭据, 成本高风险大)。
  → **"一键安装"的合理语义 = "一键检测 + 一键引导"**: 检测本地目录存在性 (installed/missing),
  missing 时给出官方下载 URL 引导 (可选: 打开浏览器/下载器预热)。**不做静默安装** (R1)。

### 2.2 会话切换的真实边界

- 能读的: CLI 会话 (6 parser 已规划) + **workbuddy `workbuddy.db` (C4 只读反解) + `brain/*.md` + `memory/*.md` (markdown 记忆, 实测有内容)** + trae IDE `chat_histories.json` + marvis (database\data.db) + **qwenwork jsonl 会话日志 + kimi wire.jsonl**。
- 不能读的: 未装应用的会话 (traework/qoderwork, 无从谈起); doubao 会话 (Chromium LevelDB, 读取复杂度高 → 会话级不做, 仅活跃检测)。
- 结论: 会话切换范围 = **已装且存储为文件/可只读反解的应用**。workbuddy 的 `sessions/*.json` **实测=本地进程心跳探针**
  (pid/sessionId/endpoint/mode 元数据, ~400B, **不含对话**) → 仅用于安装/活跃检测;
  对话级恢复 = **只读反解 `workbuddy.db`** (C4 已授权, 主库 2.75MB + 4MB WAL, 只读不改写);
  记忆级 = `brain/` + `memory/` (markdown)。→ workbuddy = **对话级 + 记忆级双轨恢复**。

### 2.3 技能共享的真实边界

- workbuddy: **SKILL.md 格式与 stigmergy 完全一致** (Anthropic Agent Skills 开放标准, WORKBUDDY_LAUNCH_PLAN 已实证)。
  `~/.workbuddy/skills/` 已存在 44 技能 → **同步 stigmergy 技能 = 目录复制 + frontmatter 检查**, 零格式成本。
- doubao/qwenwork/kimiwork/marvis: **均已装且有技能目录** (doubao: skills/geo-seo-claude git 仓库; qwenwork: skills/ 29 项; kimiwork: skills/browser-skill; marvis: skills/{custom,market}) → 可同步 (同 workbuddy SKILL.md 机制)。
- traework/qoderwork: 未装/无公开技能目录 → 登记即可, 装后自动可共享。
- coze: 无本地技能目录概念 (云端工作流) → 技能共享不适用 (或用 coze CLI 发布工作流, 超出范围)。

### 2.4 agentgit 的策略位置

- 无论哪个候选, agentgit 都是**给 agent 会话/记忆加版本控制**的工具, 与 A+B+C harvester (会话采集 → `~/.stigmergy/memory/`)
  天然互补: harvester 生产快照, agentgit 管理历史。→ 集成方式 = 登记安装 + 在 harvester/resume 里可选钩子。
- 候选 1 (btucker/agentgit) 与候选 2 (agent-git) 的对接点不同 → 身份必须先确认。

---

## 3. 实施方案

### Phase 0: 用户确认 (阻塞项, 先确认再动手)

- [x] C1: **agentgit = §1.3 候选 1 (btucker/agentgit)** — 已拍板 (2026-09-25)
- [x] C2: **桌面应用"一键安装" = A (仅检测+官网引导)** — 已拍板 (2026-09-25)
- [x] C3: **6 工具全接** (已装 qwenwork/workbuddy/coze/doubao/kimiwork/marvis 直接接入; 未装 traework/qoderwork 做"登记+引导") — 已拍板 (2026-09-25)
- [x] C4: **只读反解 `workbuddy.db` 已授权** (对话级恢复可行; 只读不改写) — 已拍板 (2026-09-25)

### Phase 1: CLI_TOOLS 注册表扩展 (核心改造, 1-2 天)

改 `src/core/cli_tools.js`:

```javascript
// 新条目结构 (desktop 型示例):
workbuddy: {
  name: "WorkBuddy (腾讯 AI 办公工作台)",
  type: "desktop",                    // 新增: cli | desktop
  localDir: path.join(os.homedir(), ".workbuddy"),   // 目录检测代替版本命令
  installUrl: "https://workbuddy-cn.com.cn/",        // missing 时引导
  sessionDirs: ["sessions"],          // 会话源 (harvester 用)
  skillsDir: path.join(os.homedir(), ".workbuddy", "skills"),
  skillsFormat: "skill-md",           // 与 claude 同格式 → 技能共享零成本
},
qwenwork: { /* type:"desktop", localDir:~/.qwenworkcn, installUrl:官方客户端下载 */ },
traework: { /* type:"desktop", localDir:~/.traework, installUrl:官方 */ },
qoderwork: { /* type:"desktop", localDir:~/.qoderwork, installUrl:qoderwork.org, installHint:"Windows Q2 2026" */ },
coze:     { /* type:"cli", version:"coze --version", install:"npm install -g @coze/cli", autoInstall:false */ },
doubao:   { /* type:"desktop", localDir:"~/Doubao", installUrl:"官方豆包桌面客户端", installHint:"桌面客户端, 无 CLI", autoInstall:false */ },
agentgit: { /* type:"cli"|"desktop", 待 C1 确认 */ },
```

配套改造:
- `scanForTools()`: 按 `type` 分支 — cli 走现有 `checkIfCLIExecutable`, desktop 走 `fs.existsSync(localDir)`;
  found 含 `type` 字段; missing 附 `installUrl` 便于引导。
- `checkInstallation()`: 同样分支。
- `enhanced_cli_installer.js`: desktop 型不执行命令, 输出 "检测到本地目录已安装" 或 "请访问 <installUrl> 下载";
  cli 型维持现状 (concurrency=6)。
- `scan.js` 展示: desktop 型显示 [桌面应用/已安装|未安装+引导URL]。
- 单测: `tests/unit/` 新增 desktop 条目检测用例 (fixtures 目录模拟)。

### Phase 2: 会话切换扩展 (与 A+B+C harvester 合并推进)

- 6 parser 已规划 (claude/qwen/qoder/codex/coze/trae+marvis) → **追加 workbuddy parser**:
  扫 `brain/*/*.md` + `memory/*.md` (markdown 记忆内容, 有真实对话/策略总结; 标注 `fullContent: false`
  因对话全文在 db, 由 C4 授权只读反解 `workbuddy.db` 提供对话级恢复; **`sessions/*.json` 是心跳探针 → 仅活跃检测用, 不入 parser**)。
- `getAllCLISessionPaths()` (stigmergy-resume.js) 追加 workbuddy brain/memory 目录。
- `session-sync` 命令 (已规划 todos ⑤) 覆写此新增源。
- qwenwork: **已装 (jsonl 会话日志可解析, 51 个)** → 追加 parser; kimiwork: **已装 (wire.jsonl protocol 1.4)** → 追加 parser; marvis: **已装 (data.db 13.9GB)** → 追加 parser。
- traework/qoderwork: 未装 → 无会话源 (检测到目录后自动可接, 机制预留)。

### Phase 3: 技能共享 (复用 WORKBUDDY_LAUNCH_PLAN 管线)

- `skills.js` 新增 `deploy --target <tool>`:
  - `--target workbuddy` → 校验 frontmatter (description/description_zh/description_en/version)
    → 复制 `skills/<名>/` → `~/.workbuddy/skills/<名>/` (与官方安装路径一致, WORKBUDDY_LAUNCH_PLAN §3 Phase 1 已验证此格式)。
  - 其他 target (qwenwork 等): 目录存在后同机制, 预留即可。
- **实测基线: `~/.workbuddy/skills/` 44 技能 = 用户自装 + 官方库, stigmergy 18 技能 0 部署 → 本 Phase 即时增量。**
- 与 WORKBUDDY_LAUNCH_PLAN 的关系: 该计划是"上架到开放平台审核", 本 Phase 是"本地直接同步到已装客户端",
  两者互补 (本地同步即时生效; 上架面向分发)。hooks/allowed-tools 处置沿用该计划 R1 保守决议。

### Phase 4: agentgit 集成 (待 C1)

- 确认候选后登记安装 (cli 型走一键安装)。
- 集成点: harvester 采集后可选 `git` 化快照; resume 列表可显示 agentgit 仓库;
  具体对接需按候选能力再细化 (Phase 4 输入 = C1 结论)。

---

## 4. 明确不做的 (刻意排除)

1. ~~桌面应用静默安装~~: 耦合安装器/签名/凭据, 成本高风险大 → 仅检测+引导 (除非用户明确要求 B)。
2. ~~直接改写 workbuddy.db~~: **C4 已授权只读反解** (只读不改写) → 反解已移入 Phase 2 对话级恢复; 任何写入仍不做。
3. ~~doubao 桌面会话读取~~: doubao 已装 (`~\Doubao`), 但会话存储=Chromium **LevelDB** 读取复杂度高 → 会话级不做, 仅安装/活跃检测 + chats 工作区扫描。
4. ~~coze 技能共享~~: coze 无本地技能目录概念 → 不适用。
5. ~~qoderwork 安装~~: Windows 版 Q2 2026 才发布 → 仅登记 + 引导 (本机 Windows)。
6. ~~agentgit 身份猜测后直接实现~~: 4 候选 ≥2x 工作差异 → 必须 C1 确认。

---

## 5. 风险清单

| # | 风险 | 等级 | 缓解 |
|---|---|---|---|
| R1 | 桌面应用"一键安装"语义若被理解为静默安装, 工作量/风险爆炸 | 高 | Phase 0 C2 先确认; 方案默认=检测+引导 |
| R2 | agentgit 身份未定 → 集成方案可能全错 | 高 | Phase 0 C1 阻塞一切 agentgit 工作 |
| R3 | workbuddy 对话全文在 db, **C4 已授权只读反解** (SQLite 主库 2.75MB + 4MB WAL); 会话切换=对话级 (db 只读) + 记忆级 (brain/memory markdown) 双轨 | 中 | 只读不改写; 先以记忆级落地, 对话级用 sqlite 只读查询 (格式未知处容错降级为 markdown 恢复) |
| R4 | CLI_TOOLS 扩展 type 字段可能影响现有 install/scan/skills 流 (回归) | 中 | 全量单测 (existing 91 项 + 新增); 小步演进不重构 |
| R5 | traework 数据目录名未实证 (未装); qwenwork 目录名**已实证修正** (`~/.qwenworkcn`, CN 后缀) | 低 | 登记时用可配置 localDir; 装后用实测校正 |
| R6 | doubao 社区 CLI (9 star) 稳定性/安全性 | 中 | autoInstall=false; 安装前提示社区性质 |
| R7 | 技能同步覆盖用户已有同名技能 (44 技能冲突) | 中 | deploy 默认 dry-run + 冲突提示, 不覆盖 |

---

## 6. 与既有文档的一致性

- `WORKBUDDY_LAUNCH_PLAN.md`: 技能上架管线 (frontmatter/格式/保守处置) 直接复用; 本计划 Phase 3 是本地同步补充, 不冲突。
- `STIGMERGY_TOP_PLATFORM_STRATEGY.md` / `STIGMERGY_VS_OPENCLAW_ANALYSIS.md`: 定位叙事不变。
- A+B+C 读记忆层 (session_harvester): 本计划 Phase 2 扩展其 parser 表, 不推翻既有设计。
- CLI_TOOLS 15 条 / cliNameMap / adapters: 均为增量扩展, 不改语义。

---

## 7. 下一步

1. ~~[阻塞] 用户确认 C1-C4~~ **已完成 (2026-09-25 拍板: C1=btucker/agentgit, C2=A 检测+官网引导, C3=6 工具全接, C4=workbuddy.db 只读反解授权)**
2. ~~Phase 1: cli_tools.js type 字段 + scan/install/skills 三分支 + 单测~~ **已落地 (2026-09-25)**: desktop-tools.js 7 条目 + cli_tools.js 24 条 + type 分流 + scan/install 桌面分支 + SkillSyncManager 技能共享基线 (workbuddy 入列) — 详见下方执行记录
3. Phase 2: workbuddy parser 并入 A+B+C harvester (todos ③-⑦ 一并推进)
4. Phase 3: `skill deploy --target workbuddy` (dry-run 冲突检测) — 前置基线已就绪 (SkillSyncManager 同步机制), 待 CLI 命令层接线
5. Phase 4: agentgit 按 C1 结论细化 (未验证源禁静默安装, 红线 4: AGENT_DRIVEN L381 人为门+固定 tag/commit)

### 执行记录 (2026-09-25)

- 目标工具身份矩阵: 官方页/产品页 + 本机目录实测 (见 §1.1)
- `~/.workbuddy` 结构实测: 64 子目录, workbuddy.db 2.75MB+4MB WAL, edge-sync-mapping*.db, sessions/*.json (~400B **心跳探针**: pid/sessionId/endpoint/mode:local/kind:interactive, 无对话), brain/*.md+memory/*.md (markdown 记忆可读), skills/ 44 技能, binaries=node/pandoc/PortableGit/python, MEMORY.md/SOUL.md/USER.md/IDENTITY.md, tencent-docs-engine.port, desktop_conversation_migrated
- `~/.doubao` ❌ 不存在; `~/.qwenwork`/`~/.traework`/`~/.qoderwork` ❌ 不存在; `~/.qoder`/`~/.trae`/`~/.qwen` ✅ 存在 (CLI/IDE 生态)
- CLI_TOOLS scanForTools/条目格式/claude 样例实测 (见 §1.2)
- stigmergy 技能 ↔ workbuddy 对照: 18 个上架技能 0 命中 (resumesession/verification-first/planning-with-files/two-agent-loop/complex-task-decomposition 全 False)
- agentgit 4 候选调研 (PyPI/GitHub 实证) 见 §1.3
- **2026-09-25 二轮核查修正 (用户纠正已全部实证成立)**: doubao/qwenwork/kimiwork/marvis **均已装**, 修正 §0/§1.1/§2.2/§2.3/Phase1 模板/Phase2/§4/R5:
  - doubao: `~\Doubao` (**无点前缀**), 会话存储=LOCALAPPDATA\Doubao\User Data (Chromium LevelDB), `chats\*`=工作区/技能产物 (agent-builder-coach 上车包、geo-seo-claude git 仓库), 无 CLI → 类型 C 桌面 App (原"未装"→已装)
  - qwenwork: `~/.qwenworkcn` (**CN 后缀**, 非 `~/.qwenwork`), projects\C--Users-Zhang\*.jsonl=51/2032.9KB (qwen CLI 风格, 可解析), skills/ 29 项, bin\dws.cmd shim (QWORK_SHIM_ROUTE=dws) v1.1.32, APPDATA=QwenWorkCN
  - kimiwork: **CLI `kimi.exe` v0.31.1** (@ ~/.kimi-code/bin), wire.jsonl protocol 1.4 (@ sessions\wd_*\session_*\agents\main\, 103.40KB, metadata/config.update/systemPrompt), session_index.jsonl, skills\browser-skill; ~/.kimi-work/bin/kimi-tools/kimi-slides.exe
  - marvis: `messages\*.md`=**定时任务记录非对话** (frontmatter: id/type:schedule/meta{prompt,status}), 对话存储=database\data.db **13.9GB** + memory.db 434MB + tantivy, skills/{custom,market}, 8 进程运行中, 无 CLI
  - 未装仅 traework/qoderwork: `~/.trae-cn`=**TRAE CN IDE** (trae IDE 非 traework); qoderwork Windows 版 **Q2 2026 才发布**
  - C1-C4 全部拍板 (见 Phase 0 checkboxes): C1=btucker/agentgit, C2=仅检测+官网引导, C3=6 工具全接, C4=workbuddy.db 只读反解授权 (对话级恢复可行, 只读不改写)

- **2026-09-25 W2 Phase 1 落地批注 (本计划驱动, 非后补)**:
  - `src/core/desktop-tools.js` 新建 = 桌面工具**单一事实来源** (7 条目: workbuddy/qwenwork/traework/qoderwork/doubao/kimiwork/marvis; 官方链接/installHint/版本门; 仅 workbuddy 具 `skillsDir`+`skillsFormat:"skill-md"`, 其余 6 桌面 skillsDir=null 待核验)
  - `src/core/cli_tools.js`: 24 条 (16 原有 + 7 desktop + coze); `type: "desktop"` 条目经 `desktopRef` 关联 desktop-tools.js (L277-330), cli 型维持原 install 命令; 函数导出 + scan/checkInstallation 双分支实测 (cli→checkIfCLIExecutable, desktop→fs.existsSync(localDir))
  - `scan.js`: desktop 型显示 [桌面应用/已安装|未安装+引导URL] (redline 12 实证: 附机器可读原因 installUrl/installHint)
  - `install.js`: `printDesktopInstallGuide()` (7 桌面表格+重启提示) 插入 install 入口/单工具分支/批量分支/help; 桌面不可安装项输出 installUrl+installHint (redline 12)
  - `SkillSyncManager.js`: cliTools 数组加入 `"workbuddy"` (唯一 skillsDir 已核验的桌面工具), 其余 6 桌面 **有意不纳入并注释说明** (redline 11 实证: 不发明未核验路径); 新增单测 `__tests__/SkillSyncManager.test.js` 6/6 通过, lint/回归全绿
  - **红线 11/12 精确出处 (本轮核验)**: AGENT_DRIVEN_PROVISIONING_PLAN.md **L388=红线 11** (插件配置越权/覆盖用户已有配置; 写入=合并不覆盖, 改动前留 diff, 目标路径由 registry 确定), **L389=红线 12** (不可安装项无解释; not-installable 必须附机器可读原因=版本门/桌面门/资源门; 禁止静默跳过); 相关: L152 qoderwork 版本门例, L190 向导三栏原因展示, L461/462 最佳实践 #11/#12 (编号与红线语义交叉对应, 属既有文档表述, 未改动)
  - agentgit: 保持未登记 (C1 已拍板 btucker/agentgit; 未验证源禁默认安装 → 红线 4 L381 人为门+固定 tag/commit; 不做静默安装)

- **2026-09-25 桌面三新增落地批注 (Phase 1 增量)**:
  - `src/core/desktop-tools.js`: 7→**10 条目**, 新增 `deepseek-harness-desktop` / `codex-desktop` / `coze-desktop` (仅官方源: deepseek-harness 官方仓库 / chatgpt.com/download+MS Store / coze.cn; checkedAt=2026-09-25)
  - `src/core/cli_tools.js`: 24→**27 条**, desktop 区块新增 3 desktopRef (`deepseek-harness-desktop`/`codex-desktop`/`coze-desktop`, L334 前); 既有 `coze` CLI (npm @coze/cli) 条目原样保留 — coze 桌面装后仍需 CLI (用户明令)
  - `docs/desktop-tools/versions.json`: 7→**10 条目** (lastKnownVersion 全 null, note 固定格式指向 check-desktop-versions.js --set)
  - 核查脚本实测 (2026-09-25): `node scripts/check-desktop-versions.js` 10 工具登记, **9/10 LINK OK**; `codex-desktop` official=chatgpt.com/download 本机 TCP 层不可达 (curl 000 ETIMEDOUT, 中国网络对 OpenAI 域名限制) — **非链接失效**: 同日 exa 搜索证实 chatgpt.com 官方页/MS Store (200)/learn.chatgpt.com 文档 (winget install --id 9PLM9XGG6VKS -s msstore) 均有效; installHint 已含 winget 官方命令路径 (learn.chatgpt.com 官方文档来源)
  - localDirs 近似信号遵 kimiwork 先例: deepseek→~/.dsh (官方 config-catalog 验证), codex→~/.codex (CLI 配置, installHint 标注近似), coze→~/.coze (CLI 配置 v0.2.0, installHint 标注近似+需装 @coze/cli)