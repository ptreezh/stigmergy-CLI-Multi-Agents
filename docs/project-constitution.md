# Stigmergy Project Constitution

## 一、项目本质 Ontology

```
Stigmergy = 多AI Agent协作网络（CLI + Desktop + IDE + Web）+ 技能孵化器 + IM统一入口

核心命题: 把任何想法/项目/网站 → 可IM交互的专业技能包
价值主张: 解放用户从专业软件交互学习中，专注专业思维与方法论
```

## 二、业务场景 Application Scenarios

### 场景1: 跨Agent协作 (Cross-Agent Collaboration)
- **触发**: 用户有多样化AI工具(Claude, Qwen, Gemini, iFlow, Qoder, CodeBuddy, WorkBuddy, Marvis, Doubao, Poe, opencode等CLI/Desktop/IDE/Web)
- **问题**: 工具孤岛，技能不共享，会话不互通，用户需要在多个工具间手动切换
- **方案**: 统一路由器 + 技能共享层 + 会话恢复 + 协作总线的多智能体协作
- **价值**: 一次配置，全工具技能互通；会话跨工具恢复；多工具自动路由

### 场景2: 技能孵化 (Skill Incubation)
- **触发**: 用户有专业领域知识/软件/系统，需要转化为可交互技能包
- **问题**: 专业知识固化在软件操作中，用户需要学习复杂界面才能获得专业能力
- **方案**: OpenCLI/CLI-Anything/Desktop-Agent-Adapter → 自动生成工具包装 → 编排专业技能包 → IM可调用
- **价值**: 用户通过IM对话即可获得专业能力，无需学习软件操作

### 场景3: IM统一入口 (IM Gateway)
- **触发**: 用户希望通过熟悉的IM工具(飞书/微信/Telegram/Slack/Discord)控制AI能力
- **问题**: AI CLI工具局限于终端，移动端/远程使用困难
- **方案**: 多渠道IM网关 → 消息解析 → 命令路由 → CLI执行 → 结果回传
- **价值**: 手机/任何地方即可指挥AI团队工作

### 场景4: 多智能体协调 (Multi-Agent Orchestration)
- **触发**: 复杂任务需要多种AI能力协作(分析+编码+测试+文档)
- **问题**: 单一CLI能力有限，手动分工效率低
- **方案**: 中央编排器 → 任务分解 → 并行分发 → 结果聚合 → 质量门禁
- **价值**: 复杂任务自动分解为多智能体协作，结果自动聚合验证

### 场景5: 自主进化 (Autonomous Evolution)
- **触发**: 系统需要持续优化技能库和路由策略
- **问题**: 手动维护技能包效率低，无法适应新工具/新场景
- **方案**: Soul系统 → 反思 → 学习 → 技能发现 → 自动进化
- **价值**: 系统越用越强，自动发现和优化技能

## 三、核心实体 Ontology Entities

### Agent (智能体)
- **定义**: 可执行AI任务的计算实体，具有独立会话、记忆、技能配置
- **类型**:
  - CLI Agent: Claude, Qwen, Gemini, iFlow, Qoder, CodeBuddy, Copilot, Codex
  - IDE Agent: opencode, cursor, continue, windsurf, cody
  - Desktop Agent: WorkBuddy, Marvis, Doubao, Poe, Kimi, Wenxin, Lingyi, Baichuan, Xunfei, MiniMax, Coze, QwenWorker, TreeWorker, MiniMax-Agent, OpenWork, Claude Desktop, Muse
  - Web Agent: ChatGPT, Perplexity, Claude-web, Gemini-web
- **属性**: home目录, memoryFiles, summaryExtractors, lastActivity, projectPaths
- **关系**: 使用技能 → 参与项目 → 执行任务 → 协作事件

### Skill (技能)
- **定义**: 可复用的专业能力包，包含方法论、脚本、课程体系
- **类型**:
  - 基础操作技能: cli-openplc, cli-medusa (由OpenCLI/CLI-Anything生成)
  - 垂直专业技能: plc-edu, eb-edu, medical, legal (由孵化器编排)
  - 元技能: brainstorming, TDD, debugging, grill-down
- **属性**: name, description, location, manifest, provenance
- **关系**: 被Agent使用 → 编排为技能链 → 关联项目

### Project (项目)
- **定义**: 用户实际工作所在的目录/代码库，具有明确业务目标
- **类型**:
  - 业务系统: powerSale, fintech, Chat4
  - 研究项目: socienceAI, failureLogic
  - 技能开发: ssciskills
- **属性**: path, context, agents, lastSeen, progressNotes
- **关系**: 被多个Agent访问 → 使用多个技能 → 产生协作事件

### Task (任务)
- **定义**: Agent执行的具体工作单元，具有输入、输出、状态
- **类型**: 编码、分析、文档、测试、采集、监控
- **属性**: id, agent, project, status, created, completed
- **关系**: 属于项目 → 由Agent执行 → 可能触发协作

### Collaboration Event (协作事件)
- **定义**: 多Agent间协调、交接、评审的活动
- **类型**: handoff, review, routing, delegation
- **属性**: type, fromAgent, toAgent, taskId, status, timestamp
- **关系**: 关联任务 → 涉及多个Agent

### Verification Level (验证等级)
- **定义**: 功能完成度的严格等级
- **等级**: Level 0(未验证) → Level 1(代码完成) → Level 2(部署完成) → Level 3(测试通过) → Level 4(生产验证)
- **作用**: 拦截虚假完成声明，确保质量

## 四、核心原则 Constitution Principles

### P0: 用户解放第一 (User Liberation First)
所有设计必须回答：这个功能如何解放用户？
- ❌ 不增加软件学习负担
- ❌ 不要求用户记忆操作流程
- ✅ 让用户专注专业思维和方法论
- ✅ IM对话即获得专业能力

### P1: 证据先行 (Evidence First)
所有报告、声明和结论在发布前必须经过完整测试和验证。
- 禁止未核实的项目路径
- 禁止伪造数据或会话
- 所有结论必须可溯源

### P2: 渐进式披露 (Progressive Disclosure)
信息按需分层披露：
- L1: 会话历史摘要
- L2: 项目目录和活动
- L3: 进程和运行状态
- L4: Agent主目录存储

### P3: 记忆文件优先 (Memory-First Scanning)
只扫描智能体的记忆和总结文件，不扫描全文件系统。
- 每个Agent的记忆文件命名不同: agent.md, MEMORY.md, QODER.md, history.jsonl等
- 必须逐个精细化研究每个Agent的记忆格式
- 增量更新，每次只处理变化部分

### P4: 全热点覆盖 (Universal Hot-Agent Coverage)
必须支持所有用户可能安装的热点智能体，不仅限于当前机器已安装的。
- US/Global CLI: Claude, Gemini, Qwen, iFlow, Qoder, CodeBuddy, Copilot, Codex, Kode, Grok, DeepSeek, Perplexity, Pi, NotebookLM, Character.ai, Devin, Manus
- China/Local Desktop: WorkBuddy, Doubao, Kimi, Wenxin, Lingyi, Baichuan, Xunfei, MiniMax, Marvis, Coze, Poe, QwenWorker, TreeWorker, MiniMax-Agent
- IDE Extensions: opencode, cursor, continue, windsurf, cody, githubcopilot, tabnine, supermaven
- Web/Cloud: ChatGPT, Claude-web, Gemini-web, Perplexity-web
- Specialized: agentgit, gbrain, stigmergy

### P5: 项目进度为核心 (Project Progress as Core)
Wiki的核心输出是每个项目的进度摘要，而非简单的文件列表。
- 每个项目必须有关联的Agent列表
- 每个项目必须有最近活动时间线
- 每个项目必须有进度笔记(来自Agent记忆)
- 每个项目必须有业务上下文推断

## 五、系统架构 Constitution Architecture

### Layer 1: Agent Forensics (智能体取证扫描)
- **职责**: 扫描所有热点Agent的home目录，读取记忆文件
- **覆盖范围**:
  - CLI Agents: Claude, Qwen, Gemini, iFlow, Qoder, CodeBuddy, Copilot, Codex, Kode, Grok, DeepSeek, Perplexity, Pi, NotebookLM, Character.ai, Devin, Manus
  - Desktop Agents: WorkBuddy, Doubao, Kimi, Wenxin, Lingyi, Baichuan, Xunfei, MiniMax, Marvis, Coze, Poe, QwenWorker, TreeWorker, MiniMax-Agent
  - IDE Agents: opencode, cursor, continue, windsurf, cody, githubcopilot, tabnine, supermaven
  - Web Agents: ChatGPT, Perplexity-web, Claude-web, Gemini-web
  - Specialized: agentgit, gbrain, stigmergy
- **输入**: 40+ Agent配置定义
- **输出**: Agent记忆摘要列表
- **约束**: 只读记忆文件，不扫描项目代码；增量扫描；幂等

### Layer 2: Ontology Builder (本体构建)
- **职责**: 从记忆摘要中提取项目、Agent、技能关系
- **输入**: Agent记忆摘要
- **输出**: 全局Ontology (agents, projects, skills, tasks, events)
- **约束**: 项目路径去重；上下文推断；增量delta计算

### Layer 3: LLM Wiki (LLM知识库)
- **职责**: 生成可被LLM消费的结构化项目知识库
- **输入**: 全局Ontology
- **输出**: latest.json (当前快照) + state.json (增量状态)
- **约束**: 渐进式披露；项目进度摘要优先；支持增量查询

### Layer 4: Coordination Bus (协作总线)
- **职责**: 实现Agent间的手工/自动交接、评审、知识共享
- **输入**: Agent协作事件
- **输出**: registry, handoffs, reviews, shared knowledge
- **约束**: 文件系统总线，无中心服务器；JSON格式；幂等

## 六、应用场景与系统映射 Scenario Mapping

| 场景 | 核心实体 | 关键流程 | 系统输出 |
|------|----------|----------|----------|
| 跨CLI协作 | Agent, Skill, Collaboration Event | 扫描 → 路由 → 执行 → 聚合 | 可用的CLI工具列表 + 技能共享状态 |
| 技能孵化 | Skill, Project, Agent | 分析 → 生成 → 编排 → 部署 | 专业技能包清单 + 课程体系 |
| IM统一入口 | Agent, Task, Collaboration Event | 接收 → 解析 → 路由 → 执行 → 回传 | 多渠道接入状态 + 命令路由表 |
| 多智能体协调 | Task, Agent, Collaboration Event | 分解 → 分发 → 并行 → 聚合 → 验证 | 任务分解图 + 并行执行状态 |
| 自主进化 | Skill, Agent, Verification Level | 反思 → 学习 → 发现 → 进化 | 技能进化日志 + 能力提升指标 |

## 七、数据模型 Constitution Data Model

### Wiki Output Schema
```json
{
  "timestamp": "ISO8601",
  "agents": {
    "<agentName>": {
      "name": "string",
      "type": "cli|ide|desktop|web|specialized",
      "lastActivity": "ISO8601|null",
      "memoryFileCount": "number",
      "summary": "object (agent-specific)",
      "projectPaths": ["string"]
    }
  },
  "projects": {
    "<projectPath>": {
      "path": "string",
      "agents": ["string"],
      "lastSeen": "ISO8601",
      "summary": {
        "name": "string",
        "context": "string (业务上下文)",
        "recentActivity": "number",
        "lastActivity": "ISO8601|null",
        "progressNotes": [
          {
            "agent": "string",
            "time": "ISO8601",
            "summary": "object"
          }
        ]
      }
    }
  }
}
```

### Delta Schema
```json
{
  "newProjects": ["string"],
  "updatedProjects": ["string"],
  "newAgents": ["string"],
  "updatedAgents": ["string"]
}
```

## 八、验证标准 Verification Standards

### Wiki Scan Verification
- [ ] 扫描覆盖所有40+热点Agent配置
- [ ] 每个Agent的记忆文件正确识别和解析
- [ ] 项目路径去重和上下文推断准确
- [ ] 增量delta计算正确
- [ ] latest.json和state.json正确生成
- [ ] 扫描时间 < 30秒

### Ontology Quality Standards
- [ ] 每个项目都有明确的业务上下文(context)
- [ ] 每个项目都有最近的进度笔记(progressNotes)
- [ ] 每个Agent都有正确的类型标识(type)
- [ ] 项目路径无重复
- [ ] Agent-Project关系准确

## 九、非约束 Non-Constraints

- 不扫描项目源代码文件
- 不扫描全文件系统
- 不修改Agent原始数据
- 不依赖特定Agent已安装
- 不支持web chat-only工具(飞书/钉钉/Telegram等作为通信渠道不算Agent)
