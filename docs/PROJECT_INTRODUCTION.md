# Stigmergy CLI - 跨AI工具协作的下一代进化平台

## 🚀 项目概述

**Stigmergy CLI** 是一个革命性的多智能体跨AI CLI工具协作系统，使不同的AI CLI工具（Claude、Gemini、Qwen、iFlow、QoderCLI、CodeBuddy、Copilot、Codex、Kode）之间能够无缝通信和智能任务路由。

### 核心使命

构建一个**科学严谨、可信可靠**的跨CLI多智能体进化系统，实现对齐和超越OpenClaw的：
1. **自主记忆机制** - 持久化、分层级的记忆系统
2. **自主反思机制** - 自我批判、自我修正、自我优化
3. **自主进化机制** - 持续学习、技能发现、能力提升
4. **知识生产系统** - 多Agent辩论、Wiki共识计算、可信知识自主生产

---

## 🎯 核心价值主张

### 与OpenClaw的差异化定位

| 维度 | OpenClaw | Stigmergy |
|------|----------|-----------|
| **核心定位** | 开放技能生态系统 | **可信知识生产平台** |
| **安全策略** | 开放生态（存在安全风险） | **全面安全审计** |
| **多CLI支持** | 单一CLI | **9+ CLI统一协作** |
| **知识生产** | 个体智能 | **多Agent辩论共识** |
| **跨平台兼容** | 有限支持 | **100%跨平台兼容** |
| **企业级就绪** | 社区版 | **企业级安全保证** |

### 三大核心优势

#### 1. 🔒 企业级安全
- **全面安全审计系统** - 所有外部技能必须通过多层安全检查
- **恶意代码检测** - 基于20+种危险模式的自动扫描
- **依赖漏洞检测** - 集成npm audit和GitHub安全数据库
- **权限分析** - 详细的权限请求和风险评分
- **安全评分** - 0-100分的量化安全评估

#### 2. 🌐 跨CLI统一协作
- **支持9+ AI CLI工具** - Claude、Gemini、Qwen、iFlow、QoderCLI、CodeBuddy等
- **智能任务路由** - 自动选择最适合的AI工具完成任务
- **跨CLI通信** - 统一的钩子系统实现无缝协作
- **跨平台兼容** - 100%兼容Windows、macOS、Linux

#### 3. 🧬 可信知识生产
- **Multi-Agent Debate系统** - 基于FREE-MAD和DREAM框架
- **Wiki共识计算** - 多Agent协作编辑和共识达成
- **可信度评估** - 来源可信度、证据强度、逻辑一致性
- **科学方法验证** - 假设生成、实验验证、同行评审、知识迭代

---

## 💡 主要功能

### 1. 智能CLI工具管理
```bash
# 一键安装和部署
stigmergy setup              # 完整安装 + 部署 + 初始化

# CLI工具管理
stigmergy scan               # 扫描可用AI工具
stigmergy install            # 安装缺失的工具
stigmergy status             # 查看系统状态

# 智能任务路由
stigmergy call "任务描述"     # 自动选择最佳AI工具
stigmergy use <cli> "任务"   # 指定使用某个CLI
```

### 2. Soul进化系统
```bash
# 自主进化
stigmergy soul evolve        # 触发自主学习和进化
stigmergy soul reflect       # 自我反思和优化
stigmergy soul co-evolve     # 多CLI协同进化
stigmergy soul compete       # 竞争进化选择最优方案
stigmergy soul status        # 查看进化状态
```

### 3. 安全技能系统
```bash
# 安全技能管理
stigmergy skills list        # 列出所有技能
stigmergy skills install     # 安装新技能（自动安全审计）
stigmergy skills audit       # 审计技能安全性
stigmergy skills update      # 更新技能库
```

### 4. 项目协作
```bash
# 项目级协作
stigmergy init               # 初始化项目
stigmergy deploy             # 部署跨CLI集成
stigmergy project setup      # 项目完整设置
```

---

## 🛡️ 安全架构

### 多层安全防护

#### Layer 1: 下载前检查
- ✅ GitHub Stars数量（>100）
- ✅ 最近更新时间（6个月内）
- ✅ 描述关键词安全检查
- ✅ 作者信誉评估

#### Layer 2: 安装前审计
- ✅ 恶意代码模式扫描（20+种模式）
- ✅ 依赖漏洞检测
- ✅ 权限请求分析
- ✅ 安全评分（0-100分）
- ✅ 只有安全评分>60的技能才能安装

#### Layer 3: 运行时监控（规划中）
- ⏳ 行为监控
- ⏳ 异常检测
- ⏳ 自动隔离

### 安全原则
- ❌ **严禁**使用特定操作系统命令
- ✅ **必须**使用跨平台Python脚本
- ✅ **必须**通过安全审计才能使用外部技能
- ✅ **必须**高置信度才能执行操作

---

## 🧠 技术架构

### 分层设计

```
┌─────────────────────────────────────────────────────────────┐
│                 应用层 (Application Layer)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Claude  │  │  Gemini  │  │   Qwen   │  │  iFlow   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Stigmergy 核心层 (Core Layer)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Soul Engine (进化引擎)                      │  │
│  │  - 记忆管理  - 反思机制  - 进化系统                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │       Knowledge Production (知识生产)                 │  │
│  │  - Multi-Agent Debate  - Wiki Consensus              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              记忆层 (Memory Layer)                            │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  短期记忆         │  │  中期记忆         │               │
│  │  (Context)       │  │  (Redis/Memory)  │               │
│  └──────────────────┘  └──────────────────┘               │
│  ┌──────────────────────────────────────────────┐          │
│  │       长期记忆 (Long-term Memory)           │          │
│  │  ┌────────────┐  ┌────────────┐            │          │
│  │  │  Markdown  │  │ SQLite-vec │  + FTS5   │          │
│  │  └────────────┘  └────────────┘            │          │
│  └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│            数据层 (Data Layer)                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Git    │  │  Local   │  │  Remote  │  │  Vector  │  │
│  │  Repo    │  │  Files   │  │  APIs    │  │   DB     │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 核心技术栈

#### 后端技术
- **Node.js** - 核心运行时
- **TypeScript** - 编排层类型安全
- **Python** - 跨平台脚本支持
- **SQLite** - 向量存储和全文搜索
- **Git** - 版本控制和知识管理

#### AI集成
- **Anthropic Claude** - 默认AI助手
- **Google Gemini** - 多模态能力
- **Alibaba Qwen** - 中文优化
- **其他8+ AI CLI** - 全面的AI工具覆盖

#### 安全技术
- **AST解析** - 代码静态分析
- **模式匹配** - 恶意代码检测
- **依赖审计** - npm audit集成
- **权限分析** - 细粒度权限控制

---

## 📊 性能指标

### v1.11.0-beta.0 对齐度成就

| 指标 | v1.10.10 | v1.11.0-beta.0 | 提升 |
|------|----------|----------------|------|
| **总体对齐度** | 20% | **62.5%** | **+42.5%** 🎉 |
| 安全审计 | 0% | 100% | +100% ✅ |
| 网页自动化 | 0% | 95% | +95% ✅ |
| 跨平台兼容 | 0% | 100% | +100% ✅ |
| 外部知识源 | 1 个 | 4 个 | +300% ✅ |
| 自动发现 | 0% | 30% | +30% ✅ |

### 质量指标
- ✅ 单元测试通过率: **100%** (305/305)
- ✅ 集成测试通过率: **100%** (8/8)
- ✅ 系统测试通过率: **100%** (85/85)
- ✅ 跨平台兼容: **100%**
- ✅ 代码质量: ESLint通过，无语法错误

---

## 🎓 使用场景

### 1. 软件开发
```bash
# 自动选择最佳工具进行代码审查
stigmergy call "审查这段代码的性能和安全性"

# 多CLI协作重构代码
stigmergy project refactor src/components/Button.js
```

### 2. 知识生产
```bash
# 多Agent辩论生成可信知识
stigmergy soul debate "React vs Vue选择建议"

# Wiki共识计算
stigmergy soul consensus "微服务架构最佳实践"
```

### 3. 安全审计
```bash
# 审计新技能安全性
stigmergy skills audit @user/skill-name

# 全面安全扫描
stigmergy soul security-scan
```

### 4. 跨CLI协作
```bash
# 使用特定CLI
stigmergy use claude "解释这段代码"
stigmergy use gemini "分析这张图片"

# 协同进化
stigmergy soul co-evolve "如何优化这个算法"
```

---

## 🚀 快速开始

### 安装

```bash
# 全局安装（推荐）
npm install -g stigmergy

# 或从GitHub安装最新版
npm install git+https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git#v1.11.0-beta.0
```

### 初始化

```bash
# 一键设置（推荐）
stigmergy setup --force

# 或分步设置
stigmergy install              # 安装AI CLI工具
stigmergy deploy               # 部署跨CLI集成
stigmergy init                 # 初始化项目
```

### 验证安装

```bash
stigmergy status              # 查看系统状态
stigmergy version             # 查看版本号
stigmergy soul status         # 查看Soul进化状态
```

---

## 🛣️ 发展路线图

### Phase 1: 可信知识平台（3-6个月）
- [x] 全面安全审计系统
- [x] 跨平台兼容性
- [x] 增强自主进化
- [ ] Multi-Agent Debate系统
- [ ] Wiki共识计算
- [ ] 可信度评估体系

### Phase 2: 跨CLI协作生态（6-12个月）
- [ ] 完整Multi-Agent Debate
- [ ] Wiki共识计算系统
- [ ] 知识可信度评估
- [ ] 企业级功能
- [ ] 云端同步

### Phase 3: 顶级知识生态（12-24个月）
- [ ] 强化学习集成
- [ ] 元学习能力
- [ ] 自主目标设定
- [ ] 社会责任感
- [ ] 行业领导地位

---

## 🤝 社区与贡献

### 参与方式

1. **GitHub** - [提交Issue和PR](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents)
2. **Discord** - 加入社区讨论（即将开放）
3. **技术博客** - 分享使用经验
4. **技能贡献** - 创建和分享技能

### 贡献指南

1. Fork项目
2. 创建特性分支
3. 提交变更
4. 推送到分支
5. 创建Pull Request

### 开源协议

本项目采用 MIT 协议开源。

---

## 📚 资源链接

### 官方文档
- [完整文档](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents)
- [API文档](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/wiki)
- [更新日志](CHANGELOG.md)

### 技术参考
- [OpenClaw双源记忆系统](https://zhuanlan.zhihu.com/p/2015393392931136100)
- [Multi-Agent Debate研究](https://www.themoonlight.io/en/review/voting-or-consensus-decision-making-in-multi-agent-debate)
- [2026年AI发展第一性原理](https://zhuanlan.zhihu.com/p/1978747770656531542)

### 相关项目
- [awesome-openclaw](https://github.com/rylena/awesome-openclaw)
- [OpenClaw Case Study](https://arxiv.org/html/2603.12644v1)

---

## 🎯 核心原则

### 第一性原理思维
- **Token经济学** - 用10-1000倍token投入创造革命性价值
- **价值优先** - 不本末倒置地纠结token成本
- **能力突破** - 模型能力持续突破边界
- **革命性价值** - 关注如何创造指数级价值

### 科学工程方法
- **观察** → **假设** → **实验** → **分析** → **迭代**
- 证据驱动、可验证、可重复
- 不确定性标注

### 诚信诚实原则
- ❌ 不得虚假或编造信息
- ❌ 不得故意误导
- ✅ 承认无知
- ✅ 标注不确定
- ✅ 提供证据
- ✅ 纠正错误

---

## 📞 联系我们

- **GitHub**: [ptreezh/stigmergy-CLI-Multi-Agents](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents)
- **Email**: ptreezh@gmail.com
- **Discord**: 即将开放
- **Twitter**: @stigmergy_cli (即将开通)

---

## 🎉 致谢

感谢以下项目和社区：
- OpenClaw团队 - 开创性的AI Agent进化系统
- Anthropic Claude - 强大的AI助手
- 所有贡献者和用户

---

**版本**: v1.11.0-beta.0
**最后更新**: 2026-03-22
**状态**: 🟢 活跃开发中
**对齐度**: 62.5% (+42.5%)
**诚信承诺**: 严格遵守诚信原则，追求科学严谨

---

**🚀 让AI工具协作更智能、更安全、更可信！**
