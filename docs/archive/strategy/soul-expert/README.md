# Soul Expert (EvolveX) - 多智能体进化编排专家

**English**: A WorkBuddy/CodeBuddy expert agent that executes autonomous evolution, competitive selection, co-evolution and self-reflection for users through a dual-agent loop - driving capability improvement through action, not advice.

**中文**: 多智能体进化编排专家（EvolveX）：基于双 Agent 循环，替用户执行自主进化、协同进化、竞争择优与自我反思，用行动驱动能力持续迭代，而非只给建议。

## 📦 资产结构（官方 /docs/expert 规范）

```
soul-expert/
├── .codebuddy-plugin/
│   └── plugin.json            # 插件清单（expertType=agent）
├── agents/
│   └── soul-evolution-expert.md  # 专家 agent 定义（maxTurns=100，预载 5 技能）
├── avatars/
│   └── expert.png             # 专家头像 512×512 PNG
└── skills/                    # 5 个捆绑技能（string[] 形式声明）
    ├── two-agent-loop/        # 核心执行机制（基础循环）
    ├── soul-evolution/        # 自主进化
    ├── soul-reflection/       # 自我反思
    ├── soul-compete/          # 竞争择优
    └── soul-co-evolve/        # 协同进化
```

## 🚀 安装使用

1. 将本目录打包为 `soul-expert.zip`（zip 根即 `soul-expert/`）。
2. 登录 [open.workbuddy.cn](https://open.workbuddy.cn) → 资产中心 → 导入 zip。
3. 安装后在对话中选择专家「EvolveX 进化专家」，或直接使用快捷提示词。

## 📝 快捷提示词（quickPrompts）

| # | 中文 | English |
|---|------|---------|
| 1 | 带我完成一次自主进化：分析我最近的工作模式并提炼可复用技能 | Help me run autonomous evolution: analyze my recent work patterns and distill reusable skills |
| 2 | 用竞争择优帮我对比两个方案 | Use competitive evolution to compare two approaches |
| 3 | 帮我做一次自我反思，找出改进点 | Help me reflect on my recent work and find improvements |

> `defaultInitPrompt` 与 quickPrompts[0] 保持一致（官方字段约束）。

## 🔧 技能说明

| 技能 | display_name | 职责 |
|------|--------------|------|
| two-agent-loop | 双 Agent 循环 (Two-Agent Loop) | 基础执行机制：主/子 Agent 双循环驱动所有步骤 |
| soul-evolution | 自主进化 (Soul Evolution) | 分析工作模式 → 提取知识 → 创建新技能 → 验证测试 |
| soul-reflection | 自我反思 (Soul Reflection) | 收集任务数据 → 分析成败模式 → 生成改进计划 |
| soul-compete | 竞争进化 (Soul Compete) | 生成多方案 → 独立执行 → 对比择优 → 进化沉淀 |
| soul-co-evolve | 协同进化 (Soul Co-Evolve) | 多 CLI 协作学习，发布与获取共享知识 |

技能产物统一沉淀于 `~/.stigmergy/soul-state/`（evolutions / reflections / competition / co-evolution）。

## 📋 plugin.json 关键字段

- `name` / `plugin`: `soul-expert`（lowercase + hyphen）
- `expertType`: `agent`
- `agentName`: `soul-evolution-expert`
- `agents`: `["./agents/soul-evolution-expert.md"]`
- `categoryId`: `04-DataAI`
- `displayName`: { en: `EvolveX`, zh: `进化专家` }
- `profession`: { en: `Multi-Agent Evolution Orchestrator`, zh: `多智能体进化编排专家` }
- `displayDescription.zh`: 「双智能体循环进化编排专家，替用户执行自主进化、协同进化、竞争择优与自我反思，驱动能力持续迭代而非说教。」（46 汉字，满足 40-50 官方要求）
- `author`: { name: `Stigmergy CLI Team`, email: `zhangshuren@agent.qq.com` }
- `skills`: 5 个技能目录（`./skills/<name>` string[] 形式）

## 🛠 本地开发/复现

```bash
# 头像（PIL，4x 超采样抗锯齿）
py <repo>/scripts/python/gen_soul_expert_avatar.py   # 输出 avatars/expert.png

# 全量字段/结构/链接验证
py <repo>/scripts/python/verify_soul_expert.py       # ALL PASS 即合格

# 打包（zip 根含 soul-expert/）
# 位置: docs/strategy/release/soul-expert.zip
```

技能 frontmatter 模板（A 组官方适配规范，必填）：`name` / `description` / `description_zh` / `description_en` / `version` / `display_name` / `category` / `author`。
跨技能引用一律用相对链接 `../<skill>/SKILL.md`（同级 skills/ 目录）。

## 📄 License

MIT License - see repository LICENSE.
