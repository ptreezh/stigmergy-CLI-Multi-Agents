# 中美桌面端高频使用/安装 AI Agent 产品系统分析

> 范围：桌面可安装、高频使用、有明确安装路径和会话机制的 AI Agent 产品
> 数据截至：2026-10-05

---

## 一、美国 Top 20 桌面端 AI Agent

| 排名 | 产品 | 公司 | 形态 | 安装方式 | 会话路径 | 认证方式 | 核心特点 |
|------|------|------|------|----------|----------|----------|----------|
| 1 | Claude Code | Anthropic | CLI + IDE | `curl -fsSL https://claude.ai/install.sh \| bash` | `~/.config/claude/projects/` | Anthropic 账户 / API Key | 最强自主多文件编辑、hooks、skills、sub-agents |
| 2 | Cursor | Anysphere | AI-native IDE | 下载安装包 / Homebrew | IDE 内 workspaceStorage | 账户 / API Key | 360K+ 付费用户，AI-first IDE，Composer 多文件编辑 |
| 3 | GitHub Copilot | GitHub/Microsoft | IDE Plugin + CLI | VS Code / JetBrains 插件 | `~/.config/github-copilot/` | GitHub 账户 | 最大安装基数，企业管理员友好，Agent HQ |
| 4 | OpenAI Codex CLI | OpenAI | CLI | `npm install -g @openai/codex` | `~/.codex/sessions/` | ChatGPT 账户 / API Key | 开源 Apache-2.0，自动 code review，Slack 集成 |
| 5 | Aider | Paul Gauthier | CLI | `pip install aider-chat` | Git 仓库内 `.aider*` | API Key (BYOK) | 410 万+ 安装，Git 原生，自动 commit |
| 6 | OpenCode | SST | CLI/TUI | `npm i -g opencode-ai` | `~/.config/opencode/` | 多 provider /connect | 21 万 GitHub stars，MIT，75+ providers |
| 7 | Kilo Code | Kilo | IDE + CLI | VS Code/JetBrains 插件 / CLI | `~/.kilocode/` | 多 provider / API Key | 500+ 模型，MIT，5M+ 用户，10T+ tokens/月 |
| 8 | Cline | Cline | VS Code + CLI | VS Code 插件 / CLI | `~/.clines/` | API Key (BYOK) | 6.3 万 GitHub stars，MCP 原生，Plan/Act 模式 |
| 9 | Windsurf | Codeium | AI-native IDE | 下载安装包 | IDE 内 | 账户 / API Key | Cascade 流式编辑，多文件理解，$15/月起 |
| 10 | Devin | Cognition | Cloud + Desktop | SaaS / 桌面客户端 | 云端 sandbox | 账户 | 完全自主远程 agent，$500/团队/月起 |
| 11 | Google Antigravity | Google | CLI + IDE | `npm install -g @google/antigravity-cli` | `~/.config/antigravity/` | Google 账户 | 多 agent 并行监控，IDE 集成 |
| 12 | Kiro CLI | Amazon | CLI | `curl -fsSL https://cli.kiro.dev/install \| bash` | `~/.kiro/` | Kiro-Code 计划 | Workflows 支持，MCP 恢复 |
| 13 | Goose | Block | CLI + Desktop | 下载安装包 / brew | `~/.config/goose/` | API Key (BYOK) | 4.9 万 GitHub stars，Rust，70+ MCP 扩展 |
| 14 | Gemini CLI | Google | CLI | `npm install -g @google/gemini-cli` | `~/.config/gemini/` | Google OAuth / API Key | 60 req/min 免费，100 万 token 上下文 |
| 15 | Roo Code | Roo | VS Code 插件 | VS Code 插件市场 | `~/.config/roo/` | API Key (BYOK) | 多专业 agent 模式，自定义 modes |
| 16 | Continue CLI | Continue | CLI + IDE | VS Code / JetBrains 插件 | `~/.continue/` | API Key (BYOK) | 开源，支持多种 LLM provider |
| 17 | Grok Build | xAI | CLI | `npm install -g @xai/grok-build` | `~/.config/grok/` | xAI 账户 | xAI 生态，快速低成本 coding |
| 18 | Command Code | Microsoft | CLI | 通过 Copilot 安装 | `~/.config/command-code/` | GitHub/Microsoft 账户 | 与 GitHub Copilot 深度集成 |
| 19 | CodeArts Agent | Huawei | CLI + IDE | 华为云插件 | 华为云工作空间 | 华为云账户 | 企业级合规，信创适配 |
| 20 | CodeBuddy Code CLI | 腾讯 | CLI | `npm install -g @tencent/codebuddy` | `~/.config/codebuddy/` | 腾讯云账户 | 与 CodeBuddy IDE 积分互通 |

---

## 二、中国 Top 20 桌面端 AI Agent

| 排名 | 产品 | 公司 | 形态 | 安装方式 | 会话/数据路径 | 认证方式 | 核心特点 |
|------|------|------|------|----------|---------------|----------|----------|
| 1 | Qoder (通义灵码) | 阿里云 | IDE + CLI + Desktop | `qoder.com` 下载 / npm | `~/.config/qoder/` 或 `C:\Users\Zhang\.qoder\` | 阿里云账户 / 微信 | 600 万+ 用户，Quest 2.0 任务规划，Expert 多 agent |
| 2 | Trae / TraeWork | 字节跳动 | IDE + Desktop + Web | `trae.ai` 下载 | 沙箱运行时 + 本地 | 抖音/手机号 | SOLO 自主 Agent，20 并发云端任务，GLM-5.2/Seed 模型 |
| 3 | CodeBuddy | 腾讯云 | Plugin + IDE + CLI | `codebuddy.com` 下载 | `~/.config/codebuddy/` | 腾讯云账户 | Craft 智能体，与 WorkBuddy 积分互通，等保三级 |
| 4 | 文心快码 (Comate) | 百度 | Plugin + IDE + Zulu | VS Code / JetBrains 插件 | 百度智能云工作空间 | 百度账户 | SPEC 驱动开发，IDC C++ 生成质量第一，Mission 多任务 |
| 5 | Kimi Code | 月之暗面 | CLI + IDE + Desktop | `kimi.moonshot.cn` 下载 | `~/.config/kimi/` | 手机号 / 账户 | 200 万 Token 上下文，Plan/Goal 模式，Swarm 多 agent |
| 6 | 豆包 | 字节跳动 | Desktop + Mobile | `doubao.com` 下载 | 沙箱 `C:\Users\Zhang\AppData\Local\Doubao\` | 抖音/手机号 | 3.15 亿 MAU，browser-use-cli daemon，多模态 |
| 7 | QClaw | 腾讯 | Desktop Agent | `qclaw.qq.com` 下载 | `~/.config/qclaw/` | 微信 | OpenClaw 国内版，微信远程控制，5000+ Skills |
| 8 | Manus | Manus | Web + Desktop | Web 平台 / 桌面客户端 | 云端 | 账户 | 月访问 2390 万，自主任务执行 |
| 9 | Qwen Code | 阿里 | CLI | `npm install -g @qwen-code/qwen-code` | `~/.config/qwen/` | 阿里云 OAuth | 国产模型优化，`/compress` `/clear` `/stats` |
| 10 | MiniMax Agent | MiniMax | IDE + Desktop | `minimax.io` 下载 | 本地 + 云端 | 账户 | 多模态强，GLM 系列模型 |
| 11 | GLM Code | 智谱 AI | IDE + CLI | `zhipu.ai` 下载 | `~/.config/glm/` | 智谱账户 | GLM-5 系列，coding 和 tool use 强 |
| 12 | Step Code | 阶跃星辰 | IDE + CLI | `stepfun.com` 下载 | `~/.config/step/` | 账户 | Step 系列模型，多模态推理 |
| 13 | 通义千问 Qwen App | 阿里 | Desktop + Mobile | 应用商店 / 下载 | 阿里云工作空间 | 支付宝/淘宝 | 44.53M 月访问，多模态，Agent 模式 |
| 14 | 腾讯元宝 | 腾讯 | Desktop + WeChat | 微信小程序 / Desktop | 微信生态 | 微信 | 12.10M 月访问，WeChat 集成 |
| 15 | 智谱清言 | 智谱 AI | Desktop + Web | `chatglm.cn` 下载 | 云端 + 本地 | 手机号 | 4.69M 月访问，GLM 模型驱动 |
| 16 | 百川智能 | 百川 | Desktop + Web | `baichuan-ai.com` 下载 | 云端 | 账户 | Baichuan 系列模型 |
| 17 | 讯飞星火 | 科大讯飞 | Desktop + Web | `xinghuo.xfyun.cn` 下载 | 讯飞云 | 手机号 | 语音交互强，企业合规 |
| 18 | 华为盘古 | 华为 | Desktop + Cloud | 华为云工作空间 | 华为云 | 华为账户 | 信创/政企市场，私有化部署 |
| 19 | 零一万物 | 01.AI | Desktop + Web | `01.ai` 下载 | 云端 | 账户 | Yi 系列模型，开源权重 |
| 20 | 月之暗面 Kimi | 月之暗面 | Desktop + Mobile | `kimi.moonshot.cn` 下载 | 云端 + 本地缓存 | 手机号 | 40.16M 月访问，长文档分析强 |

---

## 三、重点产品详细档案（桌面安装+会话机制）

### 美国

#### 1. Claude Code (Anthropic)
- **安装路径**: `~/.claude/` 或通过官方脚本全局安装
- **会话存储**: `~/.config/claude/projects/<project-path>/sessions/`
- **会话格式**: JSONL，每行一个事件
- **恢复方式**: `claude --continue`, `claude --list`, `claude --resume <id>`
- **认证**: Anthropic 账户 / API Key / OAuth
- **数据量**: OpenRouter 56.7B tokens/月，全球 CLI agent 使用率第一
- **平台**: macOS, Linux, WSL, Windows (WSL2)
- **GitHub**: 13.1 万 stars（非开源，但 issues/docs 公开）

#### 2. Cursor (Anysphere)
- **安装路径**: `~/Applications/Cursor.app` (macOS) 或 `C:\Users\<user>\AppData\Local\Programs\Cursor\`
- **会话存储**: IDE workspaceStorage 目录下 SQLite / JSON
- **会话格式**: 项目级 workspaceStorage，跨平台同步
- **恢复方式**: 打开项目自动恢复历史聊天
- **认证**: 账户 / API Key
- **数据量**: 360K+ 付费用户，估计 $2B 年化收入
- **平台**: macOS, Windows, Linux
- **特点**: VS Code fork，AI-native IDE，Tab 自动补全，Composer 多文件编辑

#### 3. GitHub Copilot (GitHub/Microsoft)
- **安装路径**: VS Code / JetBrains / Vim / Neovim 插件
- **会话存储**: GitHub 云端 + 本地 `~/.config/github-copilot/`
- **会话格式**: 云端同步，GitHub 账户关联
- **恢复方式**: IDE 内自动同步历史
- **认证**: GitHub 账户 / Microsoft 账户
- **数据量**: 最大安装基数，企业管理员友好
- **平台**: 全平台 IDE 支持
- **特点**: 2026年2月25日 GA，Agent HQ 多 agent 路由，$10-39/月

#### 4. Aider
- **安装路径**: `pip install aider-chat` 全局
- **会话存储**: Git 仓库内 `.aider*` 文件（`.aider.chat.history.md` 等）
- **会话格式**: Markdown + Git commits
- **恢复方式**: Git 历史回溯，`aider --resume`
- **认证**: API Key (BYOK)
- **数据量**: 410 万+ pip 安装，45.9k GitHub stars
- **平台**: 跨平台
- **特点**: 最成熟开源 CLI，Git 原生，支持任意 LLM

#### 5. OpenCode (SST)
- **安装路径**: `npm i -g opencode-ai` 或 `brew install anomalyco/tap/opencode`
- **会话存储**: `~/.config/opencode/`
- **会话格式**: 项目级 JSON，支持 AGENTS.md
- **恢复方式**: `opencode --continue`
- **认证**: 多 provider / `/connect`
- **数据量**: 21 万 GitHub stars，MIT 许可
- **平台**: macOS, Linux, Windows
- **特点**: 最受欢迎开源 agent，75+ providers，TUI 体验

### 中国

#### 1. Qoder / 通义灵码 (阿里云)
- **安装路径**:
  - Desktop: `qoder.com` 或 `qoder.cn` 下载安装包
  - CLI: `npm install -g @qoder-ai/qodercli`
  - IDE: JetBrains 插件
- **会话存储**:
  - Desktop: `~/.config/qoder/` 或 `C:\Users\Zhang\.qoder\`
  - 云端: 阿里云百炼平台同步
- **会话格式**: 本地 JSON + 云端同步
- **恢复方式**: 跨设备同步，记忆跨会话持久化
- **认证**: 阿里云账户 / 微信 / 支付宝
- **数据量**: 600 万+ 全球用户，10 万+ 企业客户
- **平台**: macOS, Windows, Linux, HarmonyOS
- **特点**: 2026年8月升级为智能体工作台，Quest 2.0 任务规划，40+ 连接器，70+ 插件，20K+ 技能

#### 2. Trae / TraeWork (字节跳动)
- **安装路径**:
  - IDE: `trae.ai` 下载
  - Desktop: `trae.ai` 下载
  - CLI: 内置
- **会话存储**:
  - 沙箱运行时: `C:\Users\Zhang\AppData\Local\Doubao\` (共享字节生态)
  - TraeWork: 云端 + 本地混合
- **会话格式**: 沙箱持久化 + 云端同步
- **恢复方式**: 多端联动，TraeWork 网页/桌面/移动端
- **认证**: 抖音账户 / 手机号
- **数据量**: 字节跳动生态，3.15 亿豆包 MAU
- **平台**: macOS, Windows, Linux, Web, Mobile
- **特点**: SOLO 自主 Agent，20 并发云端任务，GLM-5.2/Seed 模型，MCP 集成

#### 3. CodeBuddy (腾讯云)
- **安装路径**:
  - IDE: `codebuddy.com` 下载 / VS Code 插件
  - CLI: `npm install -g @tencent/codebuddy`
- **会话存储**: `~/.config/codebuddy/` + 腾讯云同步
- **会话格式**: 本地 + 云端混合
- **恢复方式**: 跨设备同步，与 WorkBuddy 积分互通
- **认证**: 腾讯云账户 / 微信
- **数据量**: 腾讯内部 50%+ 研发团队使用
- **平台**: macOS, Windows, Linux
- **特点**: Craft 智能体，Sub Agent 编排，@workspace 代码库问答，等保三级/ISO 42001

#### 4. 文心快码 (百度 Comate)
- **安装路径**:
  - IDE: VS Code / JetBrains 插件
  - Zulu: 智能体终端
- **会话存储**: 百度智能云工作空间
- **会话格式**: 云端为主，SPEC 规范驱动
- **恢复方式**: 云端同步，Doc → Tasks → Changes → Summary 流程
- **认证**: 百度账户
- **数据量**: IDC 报告 C++ 生成质量第一
- **平台**: 全平台 IDE
- **特点**: SPEC 驱动开发，白盒化交付，Mission 多任务模式，支持私有化部署

#### 5. Kimi Code (月之暗面)
- **安装路径**:
  - Desktop: `kimi.moonshot.cn` 下载 (2026年9月17日发布)
  - CLI: `curl -LsSf https://code.kimi.com/install.sh \| bash`
- **会话存储**: `~/.config/kimi/`
- **会话格式**: 本地 JSON + 云端同步
- **恢复方式**: 跨设备同步，Plan/Goal 模式持久化
- **认证**: 手机号 / 账户
- **数据量**: 40.16M 月网站访问
- **平台**: macOS, Windows, Linux
- **特点**: 200 万 Token 上下文，Plan 模式先规划后执行，Swarm 多 Agent 协作，Sub-agents

---

## 四、中美桌面 Agent 安装路径模式对比

| 维度 | 美国 | 中国 |
|------|------|------|
| 主导形态 | CLI + IDE 插件 | Desktop 应用 + IDE + 小程序/App |
| 安装来源 | Homebrew / npm / pip / curl 脚本 | 官网下载 / 应用商店 / 小程序 |
| 包管理 | Homebrew, npm, pip 为主 | 自有安装包 + npm + 插件市场 |
| 默认路径 | `~/.config/<agent>/` | `~/.config/<agent>/` 或 `C:\Users\<user>\AppData\Local\<agent>\` |
| 沙箱化 | 较少，直接本地运行 | 较多，沙箱运行时隔离（如 Doubao、Trae） |
| 自动更新 | Homebrew / npm 自动 | 自有更新机制 + 应用商店 |
| 企业部署 | GitHub Copilot 管理后台 | 等保三级/信创适配/私有化部署 |

---

## 五、会话存储模式对比

| 维度 | 美国 | 中国 |
|------|------|------|
| 存储位置 | 本地 `~/.config/` + 云端同步 | 本地 + 沙箱 + 强云端同步 |
| 格式开放性 | 多为 JSON/JSONL/Markdown，部分开源 | 多为私有格式，云端为主 |
| 跨设备同步 | 通过账户云同步 | 微信/手机号生态级同步 |
| 历史回溯 | CLI 历史 + Git commits | 工作空间历史 + 知识图谱 |
| 数据主权 | 用户可控，可导出 | 平台可控，导出受限 |
| 会话恢复 | `--continue`, `--resume <id>` | 自动同步续接，无需手动恢复 |

---

## 六、认证方式对比

| 维度 | 美国 | 中国 |
|------|------|------|
| 主流认证 | OAuth (Google/GitHub) / API Key | 手机号 / 微信 / 支付宝 |
| 超级 App 集成 | 无 | 微信生态（QClaw、CodeBuddy、腾讯元宝） |
| 企业认证 | SAML / SSO / GitHub Enterprise | 等保三级 / 涉密资质 / 信创 |
| 开发者认证 | API Key 为主，BYOK 普遍 | 平台账户为主，API Key 逐步开放 |
| 匿名使用 | 部分支持（Gemini CLI 免费额度） | 基本都需要注册 |

---

## 七、核心趋势与差异总结

### 美国趋势
1. **CLI 优先**: 开发者工具以终端为第一入口，IDE 扩展为辅
2. **开源主导**: Aider, OpenCode, Kilo, Cline 等 MIT/Apache 许可
3. **BYOK 文化**: Bring Your Own Key 成为标配，500+ 模型选择
4. **MCP 标准化**: Model Context Protocol 成为事实标准
5. **订阅制**: $10-200/月为主，企业级 $500+/月
6. **GitHub 生态**: Copilot 主导，GitHub-native 工作流

### 中国趋势
1. **Desktop 优先**: 从 IDE 插件转向独立 Desktop 应用
2. **超级 App 集成**: 微信/抖音/支付宝账号体系
3. **国产模型适配**: DeepSeek, Qwen, Kimi, GLM, Doubao 等本土模型
4. **政企合规**: 等保三级、信创、数据不出境成为标配
5. **全家桶策略**: IDE + CLI + Desktop + Mobile 全覆盖
6. **补贴大战**: 免费额度、新用户福利、积分制定价

### 技术路径分化
- **美国**: 终端 agent 自主执行 → IDE 深度集成 → 云端 delegate agent
- **中国**: 国产大模型底座 → 本地/沙箱执行 → 超级 App 远程控制 → 企业私有化

### 关键数据
- 2026 年 6 月 AICPB 全球 AI Agent 网站访问 Top 3: 纳米AI (151.92M), Manus (23.90M), GenSpark (12.15M)
- 中国 AI Agent 访问 Top 3: 纳米AI (151.92M), Manus (23.90M), GenSpark (12.15M)
- OpenRouter 2026年5月 Token 消耗 Top 3: Hermes Agent (271B), OpenClaw (245B), Kilo Code (149B)
- JetBrains 调查: Claude Code 工作场景使用率 39%, Copilot 21%
- 中国开发者: Qoder 600 万+ 用户, 文心快码 IDC 报告 C++ 生成质量第一

---

## 八、本机已安装匹配

根据进程和文件系统扫描，本机已安装的桌面端高频 AI Agent：

| 产品 | 进程/路径 | 类型 |
|------|----------|------|
| Qoder | `E:\Users\Zhang\AppData\Local\Programs\Qoder\Qoder.exe` | Desktop IDE + CLI |
| Kilo CLI | `F:\npm-global\node_modules\@kilocode\cli\bin\kilo` | CLI |
| 豆包 | `C:\Users\Zhang\AppData\Local\Doubao\` + browser-use-cli daemon | Desktop + Daemon |
| WorkBuddy | `C:\Users\Zhang\.workbuddy\` | Plugin/MCP |
| Stigmergy | 本仓库 | CLI 多 agent 协作 |
| Claude Code | `C:\Users\Zhang\AppData\Roaming\npm\node_modules\.stigmergy-*` | 临时安装 |
| 多个 Node/Python 服务 | powerSale 微服务 | 后端服务，非 agent |

---

*报告生成时间: 2026-10-05*
*数据来源: AICPB, OpenRouter, JetBrains Research, IDC, 各产品官方文档*
