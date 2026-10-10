# AGENT_DRIVEN_PROVISIONING_PLAN —— 由引导智能体驱动的多智能体自助安装与配置范式

> **状态**：策略定案（grill-down 共 10 轮，每轮结论已落盘于本文档正文 + 变更记录；v0.2 增「开放部署」定位修正）
> **位置**：`docs/strategy/`，与 `TOOL_EXPANSION_PLAN.md` 互补（关系见 Round 8）
> **需求原文（用户明令，verbatim）**：
> 「这些智能体的安装，其实完全可以先安装一个智能体后，让这个智能体执行 一个 多层任务计划，分任务完成后续的 安装和配置工作。-------你系统思考下，落盘为文档，务必反复核验，钢铁人思辨，grill-down ，每一轮都务必落盘。直到最后完全确定确信，给出最佳实践建议方案----应该是安装一个最容易安装的智能体比如 opencode 后，根据用户的硬件和需求，让用户选择可安装的智能体，然后，形成计划，让这个智能体逐个安装，并核验。最后再聚合 配置，共同的技能 和 大脑 和 会话间协同 agentgit」
> **定位修正（v0.2 用户明令，verbatim）**：
> 「这个项目 是 要开放给用户 部署的，所以应该是安装过程中 测试 用户侧的软硬件，哪些可安装，哪些已安装，安装后如何配置安装必须的插件，如何协同会话。」

---

## 0. 核心命题

**多智能体工具链的安装与配置，本质是「智能体工作」（agentic work），不是「脚本工作」（scripted work）——因为目标环境高度异构、失败模式多样、每一步都需要基于机器实况做判断与解释。**

因此，最优实践不是让一个静态 CLI 穷举所有工具的所有安装细节，而是：

1. **先安装一个最容易安装的引导智能体**（本机实证 = opencode）；  
2. 由引导智能体**携带一份多层任务计划**（plan-as-bytecode），分层完成：机器感知 → 用户选型 → 逐个安装与核验 → 聚合配置；  
3. **聚合层统一收口**：共同技能（单一事实源）、共同大脑（agentgit git 仓库层）、会话间协同（跨工具会话恢复）。

一句话：**「引导代理解释计划，计划锚定确定性；CLI 提供感知脚手架，代理提供适应智能。」**

**产品定位（v0.2 用户明令）**：本范式不是「本机专用实施方案」，而是**面向任意用户的开放部署体验**。交付物 = `stigmergy setup` / `stigmergy provision` 一键装机引导，流程为：

**用户运行向导 → ①自动探测用户侧软硬件 → ②判定「可安装 / 已安装 / 不可安装(附原因)」→ ③用户勾选 → ④逐个安装并配置安装必需的插件 → ⑤统一收口会话协同（+ 共同技能 + agentgit 大脑仓库）→ 部署完成即协同就绪。**

§1 的本机画像只是「一次探测的输出样例」，不是目标机器规格；探测协议（§3.0）与判定规则（§3.3）对**任何用户机器通用**。

---

## 1. 本机参考画像（示例：一次探测的输出样例，2026-09-25 实测复核）

以下数字全部为本次直接实测（非转述），写入文档前已复核——**它演示「一次探测长什么样」，不代表用户的机器**：

| 类别 | 实测值 | 证据来源 |
|---|---|---|
| OS | Microsoft Windows 11 家庭版 中文版 64 位，Build 26200 | `Get-CimInstance Win32_OperatingSystem` |
| CPU | Intel(R) Core(TM) i9-14900HX | `Get-CimInstance Win32_Processor` |
| RAM | 63.7 GB | `Win32_OperatingSystem.TotalVisibleMemorySize` |
| 磁盘 | C: 余 21.5GB / 用 478.5GB；D: 余 294.4GB / 用 157.2GB；E: 余 155.5GB / 用 310.5GB；F: 余 146.1GB / 用 319.5GB | `Get-PSDrive` |
| node / npm | v22.14.0 / 10.9.2 | `node -v` / `npm -v` |
| npm registry | **https://registry.npmmirror.com**（已走镜像） | `npm config get registry` |
| python / pip | 3.12.0rc3 / pip index = **https://mirrors.aliyun.com/pypi/simple**（已走镜像） | `py --version` / `py -m pip config get global.index-url` |
| opencode | **1.18.32 已安装** @ `F:\npm-global\node_modules\opencode-ai\bin\opencode.exe` | `opencode.exe --version` |
| stigmergy | v1.10.10-beta.5 @ `F:\npm-global\stigmergy.ps1` | 前序实证 |
| 已装工具 | opencode、coze 0.2.0、qwen、qoder 0.1.20、claude、codex 0.77.0、doubao（桌面）、qwenwork（桌面）、kimiwork（CLI+桌面）、marvis（桌面） | 前序实证（TOOL_EXPANSION_PLAN.md） |
| 未装工具 | traework、qoderwork（Windows 版 Q2 2026 才发布）、agentgit | 前序实证 |
| 磁盘敏感项 | marvis `data.db` 13.9GB + `memory.db` 434MB（C4 只读约束） | 前序实证 |

**画像关键结论**：本机 = 高性能台式机级笔记本（64G RAM / 桌面版 Windows），可安装全部桌面型工具；但 **C 盘仅余 21.5GB** → 涉及大体积安装（marvis 类）必须引导用户装到 D/E/F，并在计划中做磁盘门（disk-gate）。

**示例意义**：对任意用户机器，§3.0 的同一套探测协议自动输出**同样的画像结构**（字段不变），只是数值不同；§3.3 的判定规则对任何机器通用。C 盘紧张这类「资源门」判定，在别的机器上会由同一规则自动得出不同的可安装集。

---

## Round 1 — 第一性原理：为什么「由智能体安装智能体」

### 1.1 现状反思（静态 CLI 安装器的根本缺陷）

当前 TOOL_EXPANSION_PLAN Phase 1 方案 = stigmergy CLI 内置注册表（9+ 工具），CLI 自己跑 `spawnSync` 检测/安装/引导。它的根本问题是：

- **每个工具的每个细节都必须人工实证并硬编码**（真实目录名、版本命令、镜像、失败模式）。每加一个工具 = 一轮人工调研。
- 组合空间爆炸：10 工具 × 3 OS × 4 包管理器 × 网络镜像 × 版本门 × 目录差异 = **维护噩梦，且永远滞后于上游变化**（工具改名、换官网、改格式）。
- CLI 无法「解释」失败：`spawnSync` 返回码之外的原因（代理、证书、镜像未同步、磁盘满、杀软拦截）都要靠人猜或硬编码分支。
- **开放部署场景放大缺陷**：面向任意用户的机器（Win/macOS/Linux、桌面/无头、不同包管理器与镜像环境），硬编码分支的组合空间进一步爆炸——这正是 v0.2 定位下「探测协议必须通用化」的根本原因。

### 1.2 三范式对比

| 维度 | A. 静态脚本（现状） | B. 引导代理编排（本方案） | C. 全自动无监督 |
|---|---|---|---|
| 环境适配 | 硬编码分支 | Agent 读机器实况现场判断 | 同 B 但无人门 |
| 失败处理 | 靠预写分支 | 解释失败 → 换路径 → 落盘偏差 | 同 B |
| 确定性 | 代码即确定 | **计划文件为确定性锚** | 无锚，漂移风险 |
| 维护成本 | 每工具人工实证 | 计划文件 + 配方演进，agent 消化差异 | 同 B |
| 风险控制 | 低（命令白名单） | 人为门 + 验证门 + 回滚 | 高（无人门） |
| 安装吞吐 | 快（单机） | 中（无头 1-4 小时） | 快但不可控 |
| 开放部署适配 | **差**（OS/环境组合爆炸） | **强**（探测协议 + 配方表通用化） | 弱（无人门风险外泄） |

### 1.3 反方三连与回应（钢铁人思辨）

**反方①：「脚本更快更便宜。100 行 Node 就能装 npm 包，为什么要一个 LLM 代理？」**
回应：单工具安装确实是脚本工作；但**「跨 10 工具 × 真实机器 × 镜像 × 失败恢复 × 配置聚合」不是脚本工作**。Phase 1 的实证过程已经为此付了代价（每一轮都要人工探测真实目录、格式、版本）。代理的价值 = 消化「组合空间」与「现场偏差」，脚本的价值 = 每个原子安装动作本身确定。**二者不是替代，是分层：脚本做原子动作，代理做编排与解释。** 开放部署下，组合空间从「1 台本机」扩大到「任意 OS/环境的用户机器」，代理消化现场偏差的价值占比进一步上升。

**反方②：「LLM 不可复现，失败无法审计。」**
回应：引入**计划文件作为确定性锚（plan-as-bytecode）**——每单元的期望结果、验证命令、回滚命令全部由计划文件静态定义；代理只负责「选择执行路径 + 解释偏差 + 逐字落盘」。审计 = `provisioning-plan.json` diff + 执行日志（decision_logger 锁模式）。确定性从「代码强约束」转为「计划强约束 + 代理偏差解释」，这是本范式与随意让 AI 乱装的本质区别。

**反方③：「免费模型（big-pickle 等）质量不足，装坏了怎么办？」**
回应：三层兜底——① 每个安装单元缩小到**可独立验证**的最小粒度；② 验证门（版本命令/目录/冒烟）保证坏结果**被捕获而非被忽略**；③ 全局安装/PATH/写注册表等破坏性动作一律**人为门**（等待用户确认才继续）。模型只负责「选路与解释」，不负责「放权执行破坏」。开放部署下，目标机器不是自己的机器时，破坏性动作的人为门**更严格**（默认拒绝，用户显式批准才执行）。

### 1.4 本轮结论 ✅

**采用范式 B（引导代理编排）**，但保留 A 的原子脚本作为执行底层，加入 C 的前置计划纪律。三者不是互相替代，而是：**A 做手脚（原子动作），B 做大脑（编排解释），C 的 DAG 计划模型做骨架（确定性锚）。** 开放部署定位下，范式 B 同时承担「环境适配」职责（探测协议通用化），使组合空间爆炸从 CLI 代码转移到代理的现场判断上。

---

## Round 2 — 引导智能体选型：为什么是 opencode

### 2.1 候选对比

| 候选 | 已装本机？ | 无头驱动 | 免费模型 | skills/MCP | 结论 |
|---|---|---|---|---|---|
| **opencode** | ✅ 1.18.32 | ✅ `opencode run -m <free-model> "<msg>"` | ✅ free 系列 | ✅ | **选用** |
| claude | ✅ | ⚠ 需 Anthropic 账号付费，不可假设 | ❌ | ✅ | 备选 |
| qwen | ✅ | ⚠ 交互式为主，skills 依赖 stigmergy 扩展 | ⚠ | ⚠（机制测试中） | 备选 |
| gemini/copilot/codex | ✅ | ❌ 交互式为主 | ❌ | ❌ | 不选 |
| stigmergy 自身 | ✅ | 是 CLI 不是 LLM 代理 | — | — | 它是「脚手架」本体，不是引导代理 |

### 2.2 自举论证（关键，开放部署下尤为关键）

opencode 自身是 npm 包：`npm install -g opencode-ai` 一条命令即可在任何机器重装。**因此「先安装一个最容易安装的智能体」自举成立**：引导成本 = 一条 npm 命令（本机已验证 registry 为 npmmirror 镜像，速度快）。

**开放部署推论**：对**任何用户的空机器**，stigmergy 自身也是 npm 包（`npm install -g stigmergy@beta`，见 README）。因此完整自举链为：
`npm i -g stigmergy` → `stigmergy setup`（探测 → 若无 opencode 则先 `npm i -g opencode-ai` 装引导代理）→ 交棒 opencode 执行 L1-L4。
**「最容易安装的引导代理」在任意机器上 = opencode（npm 一条命令），不需要图形安装、不需要账号** —— 这是面向第三方用户的引导代理选型的硬约束。

### 2.3 无头驱动证据（写死进计划的铁律）

全局环境规则已实证 `opencode run` 可脚本驱动，但有两个坑必须写进计划：

1. **`-f/--file` 是 greedy 数组参数**——裸消息必须放在 `-f` 之前：
   - ✅ 正确：`opencode.exe run -m <model> --dir <dir> "<message>" -f <promptfile>`
   - ❌ 错误：`opencode.exe run -m <model> -f <promptfile> "<message>"` → `Error: File not found`
2. **Start-Process 必须用 exe 全路径**：`F:\npm-global\node_modules\opencode-ai\bin\opencode.exe`（`opencode` 解析为 ps1 脚本，直接 Start-Process 会报「%1 不是有效的 Win32 应用程序」）。

### 2.4 结论 ✅

**引导智能体 = opencode**（已装、可无头、免费模型、支持 skills/MCP、self-host npm 可自举）。兜底：若目标机器无 opencode → 先由 stigmergy CLI 执行 `npm install -g opencode-ai` 一条命令装好，再交棒。**对开放部署 = 自举链首环固定为 npm 包，无平台性障碍。**

---

## Round 3 — 机器感知与选型（discovery & selection）

### 3.0 通用探测协议（v0.2 用户明令：安装过程中测试用户侧软硬件）

**探测 = 安装向导的内置第 1 步**，用户运行向导后自动执行（无需任何手工操作），输出 `machine-profile.json`。协议跨平台通用，命令按 OS 分派：

| 探测通道 | Windows | macOS | Linux |
|---|---|---|---|
| OS/桌面 | `Get-CimInstance Win32_OperatingSystem` + 检查桌面会话（explorer/taskhost） | `sw_vers` + 检查 Aqua 会话 | `uname -a` + `$DISPLAY`/`$WAYLAND_DISPLAY` |
| CPU/RAM | `Win32_Processor` / `TotalVisibleMemorySize` | `sysctl -n machdep.cpu.brand_string` / `hw.memsize` | `/proc/cpuinfo` / `free -h` |
| 磁盘 | `Get-PSDrive` | `df -h` | `df -h` |
| 运行时 | `where node npm python` | `which node npm python3` | `which node npm python3` |
| 网络/镜像 | `npm config get registry` + `pip config get global.index-url` | 同左 | 同左 |
| 已装工具 | `stigmergy scan`（Phase 1 三分支） | 同左 | 同左 |
| 密钥文件 | 存在性检测（**只标记存在，不读取内容**） | 同左 | 同左 |

**判定输出三元组（对注册表内每个工具）**：

- **installed** ✅ → 跳过（幂等，重报告不重装）
- **installable**（携带 0..n 个门）→ 门类型：桌面门（需 GUI）/ 资源门（磁盘/RAM 不足）/ 版本门（未发布或平台不匹配）/ 人为门（未知源或破坏性动作）
- **not-installable** ❌ → **必须附机器可读原因**（例：`qoderwork`=Windows 版 Q2 2026 未发布；`doubao`=无桌面会话）

三元组写进 `selection-manifest.json`，供用户勾选与计划生成器消费。

### 3.1 感知清单（引导代理必须先回答的 6 类问题）

1. **OS/桌面**：Windows/macOS/Linux？有无 GUI 桌面？（桌面型工具 doubao/qwenwork/kimiwork/marvis 需要桌面环境；无头服务器只能装 CLI 型）
2. **资源**：RAM / 磁盘余量 / CPU 架构（arm64 vs x64 影响二进制包）
3. **运行时**：node / npm / python / pip 存在？版本？（决定安装配方走 npm 还是 pip 还是 curl 还是桌面安装包）
4. **网络**：npm/pip registry 指向？（本机实测已走 npmmirror + aliyun → 安装几乎不需要代理配置）
5. **已装工具**：复用 `stigmergy scan`（Phase 1 registry 三分支）输出已装/未装清单 → **已装的绝不重装（幂等）**
6. **安全敏感**：存在哪些令牌/密钥文件（如 coze config.json patToken）→ 计划层标记「不得读取/不得复述/不得下传子代理」

### 3.2 本机实测填表（Round 1 数据的判定结论 —— 仅为样例演示）

- OS=Windows 11 桌面版 → **全部桌面型工具可装**
- C 盘余 21.5GB → **磁盘门触发**：marvis（13.9GB+ DB）必须引导装 D/E/F；桌面安装包优先请求改安装路径
- RAM 63.7GB → 无资源压力，可 3 并发安装
- npm/pip 均已镜像 → 无需代理干预，失败重试策略可保守（2 次）
- 已装 9 工具 → 计划只处理 **未装 4 项**（traework / qoderwork / agentgit / 可选重装校验）+ **聚合层**

### 3.3 选型矩阵（可安装集判定规则 —— 对任何机器通用）

| 工具 | 类型 | 判定规则（门） | 例：本机判定 |
|---|---|---|---|
| opencode | CLI（npm） | 已装则跳过；未装则自动装（自举首环） | 已装 ✅ |
| coze | CLI（pip） | 已装跳过；未装则 pip 安装 | 已装 ✅ |
| qoder | CLI（npm） | 已装跳过；未装则 npm 安装 | 已装 ✅ |
| doubao | 桌面 | 桌面门（需 GUI）；**autoInstall:false**（无 CLI，引导用户装桌面客户端） | 已装 ✅ |
| qwenwork | 桌面 | 桌面门 | 已装 ✅ |
| kimiwork | 桌面+CLI | 桌面门 | 已装 ✅ |
| marvis | 桌面 | 桌面门 + **资源门**（C 盘 < 50GB 时引导重定向数据到其他盘）+ C4 只读 | 已装 ✅（磁盘门→D/E/F） |
| traework | 桌面 | 桌面门 + 用户门 | 未装 → 引导安装 |
| qoderwork | 桌面 | **版本门**（Windows 版 Q2 2026 未发布 → not-installable + 原因） | 未装 → not-installable ⏳ |
| agentgit | 未知源 | **人为门**（C2 延续：不静默装未验证源）+ 固定 tag/commit | 未装 → 引导（人为门） |

### 3.4 人机交互模式（开放部署 = 面向不懂技术的用户也要可用）

- **向导模式（默认，v0.2）**：三栏展示——「✅ 已安装（跳过）」/「🟢 可安装（勾选，含门提示）」/「🔴 不可安装（附原因）」→ 用户勾选 → 生成计划执行。**不可安装项必须显示原因**（用户要找 qoderwork 却得到「装不了」时，必须知道是「Windows 版 Q2 2026 才发布」而非系统故障）
- **交互模式（CLI 传统）**：引导代理打印「可安装集 + 门提示」→ 用户勾选 → 生成计划执行
- **自动模式（`--profile auto`）**：全部「绿色门」工具默认装，黄色门（磁盘/人为）暂停等确认，红色门（版本门）跳过并报告
- 产物：
  - `machine-profile.json`（感知结果，机器可读）
  - `selection-manifest.json`（选型结果，机器可读，供计划生成器消费）

---

## Round 4 — 多层任务计划分层（L0-L4）

### 4.1 层定义

| 层 | 名称 | 内容 | 产物/验证门 |
|---|---|---|---|
| **L0** | 引导自检 | opencode 冒烟（`--version`）、网络可达、磁盘门槛复核 | 继续/终止决策 |
| **L1** | 单体安装单元 | 每工具一个原子单元：选配方 → 执行 → 落 checkpoint | 安装成功证据 |
| **L2** | 单体核验单元 | 版本命令门 + 目录门 + 冒烟门；三击失败 → 回滚 | 核验通过证据 |
| **L3** | 聚合单元 | 技能同步 / 大脑 git 仓库 / 会话索引 / agentgit 注册 | 聚合清单 |
| **L4** | E2E 演练 | 从工具 A 恢复工具 B 的会话；技能单一源新增一次全工具可见 | 演练截图/日志 |

### 4.2 单元模板（与委托范本同构 —— 这是计划生成器的输出协议）

```json
{
  "id": "L2-kimiwork-verify",
  "layer": "L2",
  "tool": "kimiwork",
  "task": "核验 kimiwork 可执行",
  "expectedOutcome": "kimi.exe --version 退出码 0 且输出 v0.31.x；~/.kimi-code 与 ~/.kimi-work 至少其一存在",
  "requiredTools": ["spawnSync", "fs.existsSync"],
  "mustDo": ["执行版本命令", "检查双目录", "写 checkpoint"],
  "mustNotDo": ["不读取会话内容", "不写入工具目录", "不执行 --version 之外的命令"],
  "verify": ["exitCode==0", "版本前缀 v0.31"],
  "plugins": [],
  "rollback": "不适用（verify-only）",
  "gate": "auto"
}
```

```json
{
  "id": "L1-qwenwork-install",
  "layer": "L1",
  "tool": "qwenwork",
  "task": "安装 qwenwork 桌面客户端并配置必需插件",
  "expectedOutcome": "qwenwork 可启动；stigmergy 跨 CLI 扩展已存在于目标路径且可加载",
  "requiredTools": ["spawnSync", "fs.existsSync", "fs.writeFileSync"],
  "mustDo": ["执行安装配方", "写入插件配置", "写 checkpoint"],
  "mustNotDo": ["不读取既有会话", "不覆盖用户已有插件配置（合并）", "不执行白名单外命令"],
  "verify": ["安装证据（版本/目录）", "插件文件存在", "插件加载冒烟"],
  "plugins": [
    {
      "name": "stigmergy 跨 CLI 扩展",
      "targetPath": "~/.qwenworkcn/plugins/stigmergy",
      "contentFrom": "registry 内嵌配置模板",
      "verify": "目录存在 + 加载冒烟（插件列表可列出该插件）"
    }
  ],
  "rollback": "卸载桌面程序 + 删除新建插件目录（不动既有数据）",
  "gate": "auto"
}
```

每个**安装**单元 = **安装 + 插件配置 + 核验三件事打包**（v0.2 用户明令「安装后如何配置安装必须的插件」）：必须含 `plugins` 字段（安装后必须配置的插件清单，每项含 name/targetPath/contentFrom/verify）、`rollback` 与 `gate`。**「必需插件不配置完」=「该工具未安装完成」**，插件配置不是可选后置步骤。纯核验单元（如 L2-kimiwork-verify）`plugins: []`。

### 4.3 依赖图与并行度

- L0 → L1（全部并行但**上限 3 并发**，本机 RAM 充足、npm/pip 镜像已就绪；开放部署下并发上限按探测到的 RAM 动态设定：<16GB → 2 并发）
- L1 → L2（一一对应，装完立即核验，**不允许批量装完再统一核验** —— 坏结果要当下捕获）
- 全部 L2 通过 → L3（聚合，串行，后门依赖多）
- L3 → L4（唯一 E2E）

### 4.4 Checkpoint 与续跑（长任务铁律）

- **每单元完成后立即写 `checkpoints/<单元id>.json`**（状态+证据），幂等：重跑时已通过单元直接跳过
- 断电/中断/上下文耗尽 → 重新 `stigmergy provision --resume`，从第一个未通过单元继续
- 方法论对齐已存在的 `long-running-checkpoint-loop`（用户技能：检查点驱动 + 状态外化 + 确定性工作流 + 验证纪律）

### 4.5 本轮结论 ✅

**计划不是文本，是可机器消费的 JSON DAG**：每单元自含（task/expected/verify/plugins/rollback/gate），层间有门，单元间可并行但受并发上限约束，全程 checkpoint 续跑。**「多层」= L0-L4 五层 + 每单元的多字段契约（安装+插件+核验一条龙），不是「多步骤口号」。**

---

## Round 5 — 安装执行与核验工程

### 5.1 安装配方与镜像策略（基于实测）

| 渠道 | 本机实测状态 | 策略 |
|---|---|---|
| npm | registry=npmmirror ✅ | 直接 `npm install -g`，失败重试 2 次后报告 |
| pip | index=aliyun ✅ | 直接 `pip install`，重试 2 次 |
| curl/官网下载 | 桌面安装包 | **优先镜像/CDN 域名**；下载前检查磁盘余量（磁盘门）；下载后核验文件大小/版本 |
| git clone（agentgit） | 未验证源 | **人为门** + 固定 commit/tag（reproducibility） |

开放部署下：registry 探测结果决定配方族（官方 / npmmirror / 其他镜像），探测不到镜像 → 先测官方连通性，再测镜像，选可达者；与 3.0 探测通道联动。

### 5.2 核验门（双通道 + 冒烟）

1. **命令产物门**：`spawnSync(tool, ['--version'])` 退出码 0 且输出匹配预期前缀（防「装了但 PATH 里是旧版」）
2. **目录产物门**：`resolveLocalDirs()` 任一真实目录存在（防「命令在但核心数据目录缺失」）
3. **冒烟门**：`--help` 或最小无害调用（防「能报版本但实际不可运行」）
4. **三击即回滚**：同一单元失败 3 次 → 执行该单元 rollback → 报告阻塞原因 → 交人工

### 5.3 幂等

- 已装（checkpoint 绿）→ 跳过并报告「已存在，未重装」
- 半装（checkpoint 红/缺失）→ 先 rollback 再重装
- **绝不无脑重装已可用工具**（尊重用户已有环境）

### 5.4 审计

- 全部执行日志走锁文件模式（**跨进程锁**，防并发 append 交错破坏 UTF-8 行；仓库无现成 `scripts/decision_logger.py`，自行实现）
- 每单元落 4 行：`[时间][单元id][动作][结果/证据]`
- 行为与结果分离：日志只记「做了什么 + 证据」，不记 token/密钥

### 5.5 本轮结论 ✅

执行层 = **配方表（已镜像实测）+ 双通道验证门 + 三击回滚 + 幂等 + 加锁审计**。安装单元全部是「自动门」，只有破坏性动作（全局 install / PATH / 桌面安装包写入）与未知源（agentgit）是「人为门」。

### 5.6 插件配置核验（v0.2：安装后必须配置的插件 = 一等公民）

- 每个工具的「必需插件」由 registry 声明（见 §4.2 `plugins` 字段），**安装完成后立即配置并核验，不配置完不算安装完成**：
  - opencode → skills 目录 / MCP 配置（引导代理自身，保证后续 L1-L4 有技能可用）
  - qwenwork → stigmergy 跨 CLI 扩展
  - workbuddy → agents/插件集
  - coze → config.json（令牌**只写入口不读内容**，遵守红线 2；未配置则不可无头调用）
  - 各 CLI 工具 → `stigmergy deploy hooks`（跨 CLI 通信钩子，会话协同的前置）
- **插件核验 = 「文件/目录存在」+「加载冒烟」（工具的插件/扩展列表能列出该插件）双门**
- 插件的目标路径与内容模板全部由 registry/计划文件**确定性定义**，代理只负责写入与核验（不发明路径）
- **合并而非覆盖**：用户已有插件配置时，合并写入并留 diff 记录（红线 6「只加不改」精神延伸）
- 与 5.4 审计合并：插件写入同样走 decision_logger（加锁、行为与结果分离）

---

## Round 6 — 聚合层：技能 / 大脑 / 会话协同 / agentgit

> **部署完成即协同就绪（v0.2 定位）**：聚合层不是可选项，是装机向导的**默认最后一步**——用户跑完 `stigmergy provision`，会话协同（任一工具可恢复任一工具会话）+ 共同技能（单一源）+ agentgit 大脑仓库**已经可用**，无需另行配置。「如何协同会话」的答案 = 聚合层在部署流程内的固有收口。

### 6.1 共同技能（单一事实源）

- **Canonical skills root**：选一个目录作为唯一事实源（候选：`~/.config/opencode/skills`，因 opencode 是引导代理且支持 skills 加载；备选：stigmergy 的 skills 目录）
- 各工具的 `skillsDir`（如 qwenwork `~/.qwenworkcn/skills/`、workbuddy `~/.workbuddy/skills/`）通过 **Windows junction**（`mklink /J`）指向 canonical root——**新增一次技能，全工具可见，无复制漂移**
- 语义冲突（同名的 opencode skill 与 stigmergy skill）：由聚合报告列出冲突清单交用户裁决，**不自动覆盖**
- 各工具 skills 格式差异（skill-md / prompt 模板）→ 聚合层生成「格式适配索引」，逻辑不动原文件（C4 只读精神延续）

### 6.2 共同大脑（agentgit 为共享层）

工具记忆格式异构且**不可强行统一**（kimiwork=wire.jsonl、workbuddy=brain//memory/ markdown、marvis=sqlite 13.9GB、且 C4 对 workbuddy.db 只读）。因此：

- **不统一格式，统一「入口」**：`btucker/agentgit`（C1 已定案）在 git 仓库层提供统一读写入口——将各工具的会话/记忆**导出目录**纳入一个 git 仓库；agentgit MCP 提供统一 read/write 语义
- 记忆级协同 = 通过 agentgit 仓库的变更感知（git diff）实现跨工具可见，而非复制 13.9GB sqlite
- workbuddy 双轨：对话级（db 只读反解，C4）+ 记忆级（brain//memory/ markdown 导出入仓库）

### 6.3 会话间协同（v0.2：「如何协同会话」的正解）

- 统一会话变更检测：file watcher 监听各工具会话目录（kimi `sessions\wd_*\session_*\agents\main\wire.jsonl`、workbuddy brain/、opencode 会话）新增/变更
- `stigmergy resumesession` 索引扩展：从任一工具可列出并恢复**任一工具**的最近会话（跨工具跳转 = 会话热切换）
- **L4 演练即验证此能力**：部署完成验收 = 从工具 A 恢复工具 B 的会话成功
- 开放部署默认开箱即用：聚合单元（L3）把 watcher + 索引 + agentgit 注册写进用户配置，`stigmergy provision` 完成后无需手工启用

### 6.4 分层架构图

```
┌─────────────────────────────────────────────┐
│ 应用层: stigmergy (resumesession / skills / provision)
├─────────────────────────────────────────────┤
│ 共享层: agentgit git 仓库 (统一记忆/会话入口)   │
│         canonical skills root (统一技能源)     │
├─────────────────────────────────────────────┤
│ 适配层: stigmergy parsers (wire.jsonl / md /  │
│         sqlite只读) + 引导代理(opencode)       │
├─────────────────────────────────────────────┤
│ 工具层: opencode qwen qwenwork kimiwork  ...   │
└─────────────────────────────────────────────┘
```

### 6.5 本轮结论 ✅

聚合不是「把东西复制到一起」，而是：**技能=单一源+junction；大脑=agentgit 仓库层统一入口（不动异构原格式）；会话=watcher+索引扩展。** 三件事都遵循「只加不改」原则（对既有数据目录只读）。v0.2 定位下，聚合 = 部署流程的固有收口：「装完即协同」是产品承诺而非进阶选项。

---

## Round 7 — 风险与治理（红线清单）

| # | 红线 | 治理手段 |
|---|---|---|
| 1 | 不执行任意 eval / 非白名单 shell | 安装命令白名单（npm/pip/官网下载器/junction）；其余一律人为门 |
| 2 | token/密钥进日志、进计划、进报告 | coze patToken 等标记「不得读取/不得复述/不得下传」；decision_logger 行为与结果分离 |
| 3 | 全局安装/PATH/注册表/桌面安装包自动执行 | 一律**人为门**，等待确认才继续（开放部署：目标机器非本人机器时更严格） |
| 4 | agentgit（未验证源）静默安装 | **人为门** + 固定 tag/commit（C2 延续：不静默安装） |
| 5 | 破坏性 git 命令 | 禁 `reset --hard` / `checkout --` / force-push（除非用户明确批准） |
| 6 | 对既有数据目录读写 | **只加不改**：parsers 只读；junction 不动原文件；workbuddy.db 严格只读（C4） |
| 7 | 失败静默吞错 | 三击即回滚 + 阻塞报告；坏结果必须被捕获 |
| 8 | 长任务无续跑能力 | 每单元 checkpoint 落盘；`--resume` 从失败点继续 |
| 9 | 并发写日志交错破坏 UTF-8 | 跨进程锁（decision_logger 模式） |
| 10 | 不静默安装原理 | 默认全部「引导」；用户显式同意某工具才安装（尊重 C2） |
| 11 | **插件配置越权/覆盖用户已有配置（v0.2）** | plugins 写入=合并而非覆盖；改动前留 diff；目标路径由 registry 确定（代理不发明路径） |
| 12 | **不可安装项无解释（v0.2 开放部署）** | not-installable 必须附机器可读原因（版本门/桌面门/资源门）；禁止「静默跳过」让用户以为功能缺失 |

---

## Round 8 — 与现有架构 / TOOL_EXPANSION_PLAN 整合

### 8.1 分工原则（本范式的最核心架构决策）

> **CLI（stigmergy）做「感知与脚手架」：给代理提供确定的机器事实、注册表、验证命令、回滚命令、审计日志。**
> **引导代理（opencode）做「执行与决策」：读感知结果、按计划选路、解释偏差、驱动验证门。**
> **两者通过「计划文件 + checkpoint + 报告」三种工件解耦。**

### 8.2 Phase 1 的价值保留

TOOL_EXPANSION_PLAN Phase 1（registry 9 条目 + validateCLITool 放宽 + scanForTools/checkInstallation 三分支 + scan.js 展示 + 单测）**不废弃，恰恰是新范式的感知层**：`stigmergy scan` 的输出 = machine-profile.json 的「已装工具」字段；registry 的 installUrl/installHint = 计划生成器的引导数据源。**Phase 1 从「安装执行器」降级为「感知与脚手架」——职责更聚焦，价值更持久。** v0.2 下，registry 每条目还需新增 `plugins`（必需插件清单，见 §4.2/§5.6）与 `gates`（门声明）字段，供计划生成器与向导三栏展示消费。

### 8.3 新增命令协议：`stigmergy provision`

```
1. stigmergy scan                       → machine-profile.json（复用 Phase 1；含跨平台探测 §3.0）
2. 向导/交互/自动选型（三栏：已装/可装/不可装+原因）
                                        → selection-manifest.json
3. 计划生成器（本地确定性代码）          → provisioning-plan.json（L0-L4，单元契约，含 plugins/验证/回滚/门）
4. stigmergy provision 调起 opencode run（注入 provisioning skill + 计划 + 画像；-m 免费模型；裸消息在 -f 前——参数顺序铁律）
5. opencode 逐单元执行：install → plugins → verify → checkpoint 回写；人为门单元暂停等确认
6. 聚合（默认最后一步）：skills junction / agentgit 仓库 / 会话索引 / resumesession 扩展 / deploy hooks
7. 最终报告回写 stigmergy（decision_logger 审计），失败单元列出原因与重试/回滚命令
```

关键点：**计划生成器是普通确定性代码（第 3 步），不允许代理发明计划**（代理编计划 = 不可复现 + 易漏门）。代理只能解释与执行。这同时回答了 Round 1 反方②。**「如何协同会话」的答案落在第 6 步聚合收口**（v0.2 用户明令）。

### 8.4 互补关系

本范式**不替代** TOOL_EXPANSION_PLAN 的 Phase 2-4：parsers（wire.jsonl / brain md / sqlite 只读反解）、skill deploy --target、agentgit 细化——它们仍是**适配层**（架构图 6.4）的必需件。本范式只把「安装」从脚本升级为代理驱动。**两文档是同一目标的两半：一个是适配层实现，一个是编排层范式。** v0.2 起，编排层范式同时定义**产品化交付形态**（一键向导 + 探测 + 插件配置 + 协同就绪）。

---

## Round 9 — 证据核验表（所有关键声明的证据行）

| # | 声明 | 证据 |
|---|---|---|
| 1 | opencode 已装 v1.18.32 | 实测 `opencode.exe --version` = 1.18.32 |
| 2 | opencode 可无头驱动 | 全局 AGENTS.md §2（`opencode run` -f greedy 坑 / 裸消息在前 / exe 全路径） |
| 3 | 免费模型可用 | 全局 AGENTS.md §2 免费模型列表 + 本会话模型 opencode/big-pickle |
| 4 | npm/pip 已走镜像 | 实测 `npm config get registry`=npmmirror；`pip config get global.index-url`=aliyun |
| 5 | 引导自举成本 = 一条命令 | opencode 为 npm 包（`npm install -g opencode-ai`），registry 已镜像 |
| 6 | 本机为准桌面高性能机（示例画像） | 实测 OS=Win11 家庭中文版、CPU=i9-14900HX、RAM=63.7GB |
| 7 | C 盘余量紧张触发磁盘门（示例） | 实测 C: Free=21.5GB（D=294.4 / E=155.5 / F=146.1） |
| 8 | 已装 9 工具清单 | 前序实证（TOOL_EXPANSION_PLAN.md），含真实目录名 |
| 9 | qoderwork Windows 版 Q2 2026 未发布 | 前序官方来源实证 |
| 10 | marvis 磁盘敏感 → 只读+磁盘门 | 实测 data.db 13.9GB + memory.db 434MB（前序） |
| 11 | 计划生成必须确定性代码 | Round 1 反方②论证（可复现性由代码保证，非代理保证） |
| 12 | 会话格式异构不可统一 | 前序实证：kimi=wire.jsonl、workbuddy=md、marvis=sqlite |
| 13 | 开放部署 = 自举链全 npm 可达（v0.2） | stigmergy 自身为 npm 包（README install），opencode 同为 npm 包（§2.2） |
| 14 | 探测协议命令跨平台可用（v0.2） | §3.0 命令表（Win/macOS/Linux 三列，待实证清单挂起核验精确输出） |

---

## Round 10 — 最终结论：最佳实践建议方案

### 10.1 最佳实践（可立即执行；#11-13 为 v0.2 开放部署新增）

1. **只装一个引导代理，且选最易装的**——opencode（npm 一条命令、已装、可无头、免费模型）；自举成立
2. **计划先于执行**——`provisioning-plan.json` 由确定性代码生成并落盘前置；agent 只解释不发明顺序
3. **五层分层（L0-L4）**——每层独立可验证，层间有门
4. **每工具 = 原子单元（装+插件配+验+回滚一条龙）**——命令产物门 + 目录产物门 + 冒烟门；必需插件计入安装契约；三击即回滚
5. **不静默安装**——未知源（agentgit）与破坏性动作（全局 install/PATH/桌面安装包）一律人为门；默认引导
6. **已装不重装（幂等）**——checkpoint 绿则跳过；半装先回滚再装
7. **checkpoint 每单元落盘 + `--resume`**——断电/中断/上下文耗尽可续跑（对齐 long-running-checkpoint-loop）
8. **镜像优先**——按实测 registry（npmmirror/aliyun）选配方，失败重试 2 次后报告而非瞎试
9. **令牌/密钥纪律**——不进日志、不进子代理 prompt、不进最终报告；行为与结果分离审计
10. **聚合最后统一做**——技能单一源（junction）、大脑 agentgit 仓库统一入口、会话 watcher+索引；完成后必跑 L4 E2E 演练
11. **探测先行、判定可解释（v0.2）**——安装向导第 1 步自动探测用户侧软硬件；每个「不可安装」工具必须附机器可读原因（版本门/桌面门/资源门），禁止静默跳过
12. **安装三步曲：安装 + 插件配置 + 核验（v0.2）**——每工具单元将「必需插件」打包进安装契约（plugins 字段），不配完插件不算安装完成；插件写入=合并不覆盖
13. **部署完成即协同就绪（v0.2）**——聚合层（技能/大脑/会话）是装机默认最后一步；用户跑完 `stigmergy provision` 即具备跨工具会话恢复能力，无需另行配置

### 10.2 落地路线（M0-M5，含验收标准）

| 里程碑 | 内容 | 验收标准 |
|---|---|---|
| **M0** 感知层 | 完成 TOOL_EXPANSION_PLAN Phase 1（registry 9 条 + 三分支 + scan 展示 + 单测；条目补 `plugins`/`gates` 字段） | lint 通过、91 项全量测试不回归、scan 输出 machine-profile 字段 |
| **M1** 引导 | 确认 opencode 1.18.32；编写 `provisioning` skill（含 13 条最佳实践 + 单元模板 + 参数顺序铁律） | opencode 无头加载 skill 成功 |
| **M2** 计划 | 实现 provision 计划生成器（machine-profile → selection → provisioning-plan，含 plugins 字段与门标记） | `stigmergy provision --dry-run` 输出合法 JSON DAG，门标记正确；三栏向导展示正确 |
| **M3** 执行核验 | 试点 2 单元（kimiwork 核验 + coze 安装核验）→ 全量 L0-L4 | 每单元 install/plugins/verify/rollback 四路径均有自动化证据；人为门正确暂停 |
| **M4** 聚合 | skills junction / agentgit 仓库 / 会话索引 / resumesession 跨工具扩展 / deploy hooks | 新增一次技能全工具可见；agentgit 仓库可达可控；跨工具会话恢复可用 |
| **M5** 试运行验收 | 全量 provision + L4 E2E 演练 + 最终报告（含「不可安装项原因」展示） | 从任一工具可恢复另一工具会话；报告含全部失败单元与重试命令 |

**吞吐预期**：试点（已装核验 + 1-2 安装）≈ 1-2 小时无头；全量（含桌面安装包下载）≈ 2-4 小时，受人为门等待影响。

### 10.3 最终定案

本方案**确定、确信、可执行**：核心命题（智能体工作是编排层而非脚本层）、引导代理选型（opencode + 自举）、确定性锚（计划文件由代码生成）、聚合三件事（技能单一源 / agentgit 大脑仓库 / 会话协同）全部有实测证据与反方论证支撑。v0.2 定位修正（**开放给用户部署**）使范式进一步产品化：探测协议通用化（§3.0）、判定可解释（三元组+原因）、插件配置进入安装契约（§4.2/§5.6）、聚合 = 部署默认收口（§6）。**与 TOOL_EXPANSION_PLAN 的关系是「编排层范式 + 适配层实现 = 同一目标的两半」，并行推进：Phase 1 照做（它是 M0 的前置依赖，并补 plugins/gates 字段），本范式作为 M1-M5 的编排蓝图。**

---

## 待实证清单（后续行动）

- [ ] `opencode run` 在当前机器以 `-m opencode/big-pickle`（或 deepseek-v4-flash-free）跑通一条最小任务（M1 前置冒烟）
- [ ] agentgit（btucker）README 细读 + 固定 tag；确认其 git-watch 语义与 MCP 入口（M4 前置，且需人为门）
- [ ] 桌面安装包下载的镜像/CDN 域名实证（traework、qoderwork 发布后）
- [ ] skills junction 在 Windows 上对 qwenwork/workbuddy skillsDir 的可行性实证（mklink /J 权限）
- [ ] marvis 数据目录重定向可行性（是否可配置 data 目录位置，避免 C 盘）——受 C4（workbuddy 只读）对应的 marvis 授权边界确认
- [ ] workbuddy 技能数 44 vs 47 复核（挂起项）
- [ ] **§3.0 探测命令在 macOS/Linux 的精确输出格式实证**（sw_vers/sysctl/df/which/无头会话检测）——开放部署（任意 OS 用户）必需（v0.2）
- [ ] **各工具「必需插件」目标路径与内容模板实证**（qwenwork stigmergy 扩展 / workbuddy agents / coze config 写入口 / deploy hooks 幂等性）——§5.6 前置（v0.2）
- [ ] **`stigmergy provision` 向导三栏界面设计定稿**（✅已装 / 🟢可装+门提示 / 🔴不可装+原因 的展示与勾选交互）——M2 前置（v0.2）

## 变更记录（append-only）

| 版本 | 日期 | 变更 |
|---|---|---|
| v0.1 | 2026-09-25 | 初始成稿：需求原文收编；实测基线（全新实测：OS/CPU/RAM/磁盘/node/npm-registry/py/pip/opencode 1.18.32）；Round 1-10 全部落盘；最佳实践 10 条 + M0-M5 路线 + 验收标准；待实证清单；与 TOOL_EXPANSION_PLAN 的整合定位（编排层 vs 适配层） |
| v0.2 | 2026-09-25 | 定位修正（用户明令：**开放给用户部署**）：§0 增产品定位（探测→判定→选型→安装+插件→协同收口）；§1 降级为「参考画像样例」；Round 3 增 §3.0 跨平台通用探测协议 + 三元组判定（installed/installable/not-installable+原因）；Round 4 单元模板增 `plugins` 字段（安装三步曲：装+插件配+验）；Round 5 增 §5.6 插件配置核验（必需插件=一等公民，合并不覆盖）；Round 6 开场锚定「部署完成即协同就绪」；Round 7 增红线 11（插件越权）/12（不可装无解释）；Round 9 增证据 13-14；Round 10 增最佳实践 #11-13 并更新 M0/M3 验收标准；待实证清单 +3 项 |