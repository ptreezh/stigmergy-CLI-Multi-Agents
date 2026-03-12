# 什么是 Stigmergy？生物启发的 AI 协作系统

> 从蚂蚁群体到 AI 编排：大自然如何启发下一代 AI 协作工具

**发布时间**: 2026 年 3 月 23 日  
**作者**: Stigmergy CLI Team  
**阅读时间**: 8 分钟

---

## 引言：AI 工具的碎片化困境

想象这个场景：

你是一名开发者，正在构建一个新项目。你打开 **Claude** 让它帮你设计架构，然后需要写文档时切换到 **Gemini**，最后要用 **Qwen** 生成测试用例。每次切换，你都要重新解释上下文，复制粘贴代码，努力保持思路连贯。

这就像让三个天才各自为战，却不让他们互相交流。

**Stigmergy** 就是为了解决这个问题而生。

---

## 什么是 Stigmergy？

**Stigmergy CLI** 是一个多 AI 协作系统，让你通过统一界面协调 8+ 个主流 AI 命令行工具（Claude、Gemini、Qwen、iFlow、Qoder 等）。

核心理念很简单：**让 AI 助手像蚂蚁群体一样协作，通过环境线索（信息素）协调行动，无需中央控制。**

### 名字的由来

"Stigmergy"（群体智能）这个词来自希腊语：
- **stigma** = 痕迹、标记
- **ergon** = 工作、行动

生物学家让 - 亨利·法布尔在 19 世纪研究蚂蚁时发现：单个蚂蚁没有领导，却能建造复杂的蚁穴。秘诀在于它们通过**环境中的信息素痕迹**互相协调。

> "蚂蚁不交流'做什么'，而是通过改变环境来暗示'下一步该做什么'。"

这正是 Stigmergy CLI 的设计哲学：**AI 工具通过共享的上下文和状态板协作，而不是各自为战。**

---

## 为什么需要 Stigmergy？

### 问题 1：上下文丢失

使用多个 AI 工具时，最大的痛点是**上下文切换成本**：

```
# 传统方式
1. claude "分析这个代码库"
   → Claude 给出分析结果

2. 复制结果，打开 gemini
   gemini "基于以上分析，生成文档"
   → 需要重新解释上下文

3. 复制文档，打开 qwen
   qwen "根据文档写测试"
   → 再次重复上下文
```

每次切换，你都像在向新人重新介绍项目。

### 问题 2：工具孤岛

每个 AI CLI 都有自己的技能系统、会话历史、配置方式：

- Claude 的技能在 `~/.claude/skills/`
- Qwen 的技能在 `~/.qwen/skills/`
- 两者不互通

这就像买了三套不同的工具箱，每套都有锤子，但都不能混用。

### 问题 3：无法远程协作

你在地铁上突然想到一个绝妙的功能设计，但手边只有手机，无法使用终端里的 AI 工具。

或者你的团队想共享 AI 能力，但每个人都要单独配置环境。

---

## Stigmergy 如何解决这些问题？

### 解决方案 1：智能路由

Stigmergy 内置**智能路由系统**，自动分析任务并选择最适合的 AI：

```bash
# 让 Stigmergy 决定
stigmergy call "为这个项目创建完整的文档和测试"

# Stigmergy 自动：
# 1. 用 Claude 分析代码结构
# 2. 用 Gemini 生成 API 文档
# 3. 用 Qwen 编写单元测试
# 4. 汇总结果返回给你
```

你不需要知道哪个 AI 擅长什么，Stigmergy 知道。

### 解决方案 2：跨 CLI 上下文

Stigmergy 的 **ResumeSession** 系统让不同 AI 共享记忆：

```bash
# 开始会话
stigmergy interactive

# 使用 Claude
> use claude
> 设计用户认证系统

# 切换到 Qwen（上下文自动保留）
> use qwen
> 基于上面的设计，实现代码

# Qwen 能看到 Claude 的设计思路，无需重新解释
```

这就像三个天才共用一个大脑，每个人的思考都即时同步。

### 解决方案 3：统一技能系统

Stigmergy 的技能管理器兼容所有主流技能仓库（Vercel、Anthropic 等）：

```bash
# 安装一次
stigmergy skill install vercel-labs/agent-skills

# 在所有 AI 中可用
claude> stigmergy skill read pdf
qwen> "使用 PDF 技能处理这个文档"
gemini> "analyze this PDF using the installed skill"
```

一次安装，处处可用。

### 解决方案 4：远程编排网关

**Stigmergy Gateway** 让你通过聊天应用控制 AI：

```bash
# 启动网关
stigmergy gateway --feishu --tunnel
```

然后在飞书/Telegram/Slack/Discord 中：

```
@AI-Stigmergy 为这个项目写一个 REST API

→ Stigmergy 自动执行 Claude CLI
→ 返回结果到聊天窗口
```

你可以在地铁上、咖啡馆里，甚至飞机上（如果有 WiFi）控制你的 AI 团队。

---

## 技术架构

### 核心组件

```
┌─────────────────────────────────────────────────────────┐
│                   Stigmergy CLI                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────┐      │
│  │           Natural Language Parser            │      │
│  └─────────────────┬────────────────────────────┘      │
│                    │                                    │
│  ┌─────────────────▼────────────────────────────┐      │
│  │           Task Router (AI Selector)          │      │
│  │  - Analyzes task complexity                  │      │
│  │  - Checks AI availability                    │      │
│  │  - Considers user preferences                │      │
│  └─────────────────┬────────────────────────────┘      │
│                    │                                    │
│        ┌───────────┼───────────┐                       │
│        │           │           │                       │
│  ┌─────▼─────┐ ┌──▼──────┐ ┌─▼─────────┐             │
│  │  Claude   │ │ Gemini  │ │   Qwen    │   ...       │
│  └─────┬─────┘ └──┬──────┘ └─┬─────────┘             │
│        │           │           │                       │
│        └───────────┼───────────┘                       │
│                    │                                    │
│  ┌─────────────────▼────────────────────────────┐      │
│  │         Context Manager (ResumeSession)      │      │
│  │  - Shared memory across sessions             │      │
│  │  - Status boards for collaboration           │      │
│  └──────────────────────────────────────────────┘      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 技术栈

- **运行时**: Node.js >= 16.0.0
- **语言**: Pure JavaScript/TypeScript
- **依赖**: 最小化（chalk, commander, inquirer 等）
- **无 Python 依赖**: 轻量、快速、易安装

---

## 实战演示

### 场景 1：完整项目开发

假设你要创建一个 REST API 项目：

```bash
# 传统方式（需要 3-4 小时）
1. claude "设计 REST API 架构" (30 分钟)
2. 复制设计 → gemini "生成 API 文档" (30 分钟)
3. 复制文档 → qwen "编写单元测试" (1 小时)
4. 手动整合所有内容 (1 小时)
5. 调试和修改 (30 分钟+)

# Stigmergy 方式（15 分钟）
stigmergy call "创建完整的 REST API 项目，包括架构设计、文档和测试"

# Stigmergy 自动协调多个 AI 完成所有任务
# 你在旁边喝咖啡即可
```

### 场景 2：跨语言协作

你的团队有中国、美国、日本开发者：

```bash
# 中国开发者
stigmergy call "请用中文分析这个代码库"

# 美国开发者
stigmergy call "Please generate English documentation"

# 日本开发者
stigmergy call "日本語でテストケースを書いてください"

# 所有结果自动同步到共享状态板
```

Stigmergy 支持 12 种语言，真正实现全球化协作。

### 场景 3：远程团队协作

团队使用 Slack：

```bash
# 管理员启动网关
stigmergy gateway --slack --port 3000

# 团队成员在 Slack 中
@stigmergy "分析这个 PR 的代码质量"

# Stigmergy 执行 Claude，返回结果到 Slack 频道
# 整个团队都能看到
```

---

## 从生物学学到什么？

### 蚂蚁的启示

蚂蚁个体智商极低，但蚁群能：
- 建造结构复杂的蚁穴
- 找到最短路径获取食物
- 分工协作（工蚁、兵蚁、蚁后）
- 适应环境变化

秘诀在于**间接协调**：

1. 蚂蚁 A 发现食物，返回巢穴时留下信息素
2. 蚂蚁 B 感知到信息素，跟随路径
3. 路径越短，信息素越浓（因为往返次数多）
4. 最终所有蚂蚁都选择最优路径

### 应用到 AI 协作

Stigmergy 的**状态板**就是数字信息素：

```
项目状态板 (.stigmergy/status/PROJECT_STATUS.md)
│
├── 任务列表（待处理、进行中、已完成）
├── 发现（AI 分析结果）
├── 决策（技术选型、架构决定）
└── 协作历史（哪个 AI 做了什么）
```

当 AI A 完成分析，它把结果写到状态板。AI B 开始工作时，自动读取状态板，知道"前人"做了什么。

这就是**数字 stigmergy**。

---

## 快速开始

### 安装（5 分钟）

```bash
# Windows (PowerShell 管理员)
npm install -g stigmergy@beta

# macOS/Linux
sudo npm install -g stigmergy@beta

# 验证安装
stigmergy --version
```

### 设置（1 分钟）

```bash
# 一键完成设置
stigmergy setup

# 这会自动：
# ✓ 扫描已安装的 AI CLI 工具
# ✓ 部署集成 hooks
# ✓ 安装内置技能
# ✓ 初始化配置
```

### 第一次使用

```bash
# 进入交互模式
stigmergy interactive

# 尝试第一个任务
> call "用中文介绍你自己"

# 查看状态板
> status
```

就这么简单。

---

## 与其他工具的比较

| 功能 | Stigmergy | 单独 AI CLI | LangChain |
|------|-----------|-------------|-----------|
| 多 AI 编排 | ✅ 原生支持 | ❌ 不支持 | ✅ 需要编码 |
| 跨工具上下文 | ✅ 自动 | ❌ 手动 | ⚠️ 需配置 |
| 远程控制 | ✅ Gateway | ❌ 不支持 | ⚠️ 需开发 |
| 技能共享 | ✅ 统一系统 | ❌ 各自为政 | ⚠️ 有限 |
| 安装难度 | ⭐ 简单 | ⭐ 简单 | ⭐⭐⭐ 复杂 |
| 编程需求 | ❌ 无需 | ❌ 无需 | ✅ 需要 |

---

## 路线图

### 已实现（v1.3.x）
- ✅ 9+ AI CLI 支持
- ✅ 智能路由
- ✅ ResumeSession 跨 CLI 记忆
- ✅ Stigmergy Gateway 远程编排
- ✅ 统一技能系统
- ✅ 12 语言支持
- ✅ 项目状态板

### 即将推出（v1.4.x）
- 🔜 Web UI 仪表板
- 🔜 AI 工作流可视化编辑器
- 🔜 性能分析和优化建议
- 🔜 企业级权限管理
- 🔜 技能市场

### 长期愿景（v2.0）
- 🌟 去中心化 AI 协作网络
- 🌟 AI 代理自主协商任务分配
- 🌟 基于区块链的贡献追踪
- 🌟 生态系统：插件、主题、扩展

---

## 社区与贡献

Stigmergy 是**完全开源**的（MIT 许可），欢迎所有形式的贡献：

### 你可以贡献
- 💻 代码（功能、bug 修复、测试）
- 📚 文档（翻译、教程、示例）
- 🎨 设计（Logo、UI、宣传材料）
- 📢 宣传（博客、演讲、社交媒体）
- 💡 反馈（bug 报告、功能建议）

### 获取帮助
- **GitHub**: [github.com/ptreezh/stigmergy-CLI-Multi-Agents](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents)
- **Discord**: [加入社区](链接待添加)
- **npm**: [npmjs.com/package/stigmergy](https://www.npmjs.com/package/stigmergy)

---

## 结语：AI 协作的未来

我们正站在 AI 革命的早期阶段。就像 20 年前的互联网，5 年前的深度学习，今天的 AI 工具还处于"各自为战"的原始状态。

**Stigmergy 的愿景**：

> 让 AI 协作像呼吸一样自然。

不需要学习复杂的 API，不需要手动切换工具，不需要重复解释上下文。

你只需要**用自然语言说出需求**，Stigmergy 自动协调最合适的 AI 团队完成工作。

这不仅是工具的创新，更是**工作方式的革命**。

---

## 延伸阅读

1. [Stigmergy GitHub 仓库](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents)
2. [完整文档](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/blob/main/STIGMERGY.md)
3. [快速入门指南](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents#-quick-start-guide)
4. [技能系统详解](链接待添加)
5. [Stigmergy Gateway 教程](链接待添加)

---

**关于作者**

Stigmergy CLI Team 是一个由多个 AI 系统（Claude、Qwen、Gemini 等）和人类开发者组成的协作团队。我们相信，AI 的未来不在于单个超级智能，而在于**协作智能**——就像蚂蚁群体一样，个体简单，集体卓越。

---

*喜欢这篇文章？欢迎分享！*

*有问题或建议？在 GitHub 上开 Issue 或加入 Discord 社区讨论。*

---

**标签**: #AI #MultiAgentSystems #DeveloperTools #OpenSource #Stigmergy #CLI #Productivity #Biomimicry
