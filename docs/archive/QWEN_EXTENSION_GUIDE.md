# Qwen CLI Extensions 系统使用指南

## 📋 概述

Qwen CLI 拥有 **Extensions 系统**，允许通过 JavaScript 扩展增强功能。本指南说明如何部署和使用 superpowers 技能扩展。

---

## 🚀 快速开始

### 1. 部署 Extension

```bash
# 部署 superpowers extension
node scripts/deploy-qwen-extension.js

# 验证部署
node scripts/test-qwen-extension.js

# 查看部署状态（不修改文件）
node scripts/deploy-qwen-extension.js --dry-run
```

### 2. 使用 Extension

```bash
# 列出所有可用 extensions
qwen --list-extensions

# 使用特定 extension
qwen --extensions superpowers-qwen "Design a RESTful API"

# 正常使用（extension 自动加载）
qwen "Implement a login function with tests"
```

### 3. 卸载（如果需要）

```bash
# 卸载 extension
node scripts/deploy-qwen-extension.js --uninstall
```

---

## 📁 部署的文件

部署后，以下文件将被创建/修改：

```
~/.qwen/
├── extensions/
│   └── superpowers-qwen/        # ⭐ Extension 目录
│       ├── package.json          # Extension 元数据
│       ├── index.js             # ⭐ 主入口文件
│       ├── hooks/               # Hook 处理器
│       │   ├── session-start.js
│       │   └── pre-prompt.js
│       └── skills/              # 技能文件
│           ├── brainstorming.md
│           ├── tdd.md
│           ├── debugging.md
│           ├── collaboration.md
│           └── verification.md
└── QWEN.md                      # ⭐ 上下文注入
```

---

## ⚙️ Extension 配置

### package.json 结构

```json
{
  "name": "superpowers-qwen",
  "version": "4.1.1",
  "description": "Core skills library for Qwen CLI",
  "main": "index.js",
  "qwen": {
    "extensionType": "skills",
    "version": "1.0.0",
    "enabled": true,
    "priority": 100
  },
  "superpowers": {
    "version": "4.1.1",
    "skills": [5 skills]
  },
  "hooks": {
    "sessionStart": "./hooks/session-start.js",
    "prePrompt": "./hooks/pre-prompt.js"
  },
  "skills": [
    {
      "name": "brainstorming",
      "file": "./skills/brainstorming.md",
      "trigger_keywords": ["design", "create", "brainstorm"],
      "description": "Use before creative work"
    }
  ]
}
```

---

## 🎯 可用的技能

Extension 提供 5 个 superpowers 技能：

### 1. Brainstorming
- **触发关键词**: design, create, brainstorm, plan, architecture
- **用途**: 创意设计、架构规划
- **流程**: 探索选项 → 分析优劣 → 选择方案 → 记录决策

### 2. Test-Driven Development
- **触发关键词**: implement, feature, function, code, test
- **用途**: 功能开发、代码实现
- **流程**: 编写测试 → 运行(失败) → 实现 → 运行(通过) → 重构

### 3. Debugging
- **触发关键词**: debug, fix, error, issue, problem, broken
- **用途**: 问题排查、错误修复
- **流程**: 理解问题 → 隔离根因 → 修复 → 验证

### 4. Collaboration
- **触发关键词**: team, review, discuss, share, collaborate
- **用途**: 团队协作、代码审查
- **流程**: 沟通 → 审查 → 文档 → 协调

### 5. Verification Before Completion
- **触发关键词**: done, finish, complete, ready
- **用途**: 完成前验证
- **流程**: 检查清单 → 测试 → 审查 → 确认

---

## 🔧 Extension Hooks

### sessionStart Hook

**触发时机**: Qwen CLI 启动时

**功能**:
- 加载 superpowers 上下文
- 注入技能列表
- 初始化 extension

**实现**: `hooks/session-start.js`

### prePrompt Hook

**触发时机**: 用户输入提示后

**功能**:
- 分析用户输入
- 匹配触发关键词
- 激活相应技能

**实现**: `hooks/pre-prompt.js`

---

## 💡 使用技巧

### 自动技能激活

Extension 会根据关键词自动激活技能：

```
# 自动激活 brainstorming
qwen "Design a new API endpoint"

# 自动激活 TDD
qwen "Implement a user login function with tests"

# 自动激活 debugging
qwen "Debug the authentication failure"
```

### 手动指定 Extension

```bash
# 明确使用 superpowers extension
qwen --extensions superpowers-qwen "your task"

# 只使用 superpowers（禁用其他 extensions）
qwen --extensions superpowers-qwen "your task"
```

### 查看可用 Extensions

```bash
qwen --list-extensions
```

---

## 🧪 测试部署

运行测试套件验证部署：

```bash
node scripts/test-qwen-extension.js
```

测试包括：
1. ✅ Extension 目录存在性
2. ✅ package.json 有效性
3. ✅ index.js 存在性
4. ✅ Hooks 存在性
5. ✅ Skills 完整性
6. ✅ 上下文注入正确性

---

## 🔍 故障排查

### 问题：Extension 未加载

**检查**:
```bash
# 验证 extension 目录
ls -la ~/.qwen/extensions/superpowers-qwen/

# 验证 package.json
cat ~/.qwen/extensions/superpowers-qwen/package.json
```

**解决**:
```bash
# 重新部署
node scripts/deploy-qwen-extension.js
```

### 问题：技能未激活

**检查**:
```bash
# 验证 QWEN.md 包含技能
grep -A 5 "superpowers-qwen" ~/.qwen/QWEN.md
```

**解决**:
```bash
# 重新注入上下文
node scripts/deploy-qwen-extension.js
```

### 问题：Hook 未执行

**检查**:
```bash
# 验证 hooks 存在
ls -la ~/.qwen/extensions/superpowers-qwen/hooks/
```

**解决**:
确保 hooks 文件有正确的 module.exports

---

## 📚 高级配置

### 创建自定义技能

1. 在 `skills/` 目录创建新的 `.md` 文件
2. 在 `package.json` 的 `skills` 数组中添加定义
3. 重新部署 extension

### 修改 Hook 行为

编辑 `hooks/` 目录中的相应文件：
- `session-start.js`: 修改启动行为
- `pre-prompt.js`: 修改技能激活逻辑

### 调整 Extension 配置

编辑 `package.json` 中的 `qwen` 配置：
- `priority`: Extension 优先级
- `enabled`: 启用/禁用 extension

---

## 🎓 最佳实践

### 1. 使用描述性提示词

好的示例：
```
qwen "Design a RESTful API for user management with authentication"
```

不好的示例：
```
qwen "user api"
```

### 2. 利用自动技能激活

让 extension 自动选择合适的技能：
```
qwen "Implement and test a login function"
# 自动激活 TDD skill
```

### 3. 明确任务上下文

提供足够的上下文信息：
```
qwen "Implement login using JWT tokens for the React frontend"
```

---

## 🔗 相关资源

- **Superpowers 官方仓库**: https://github.com/obra/superpowers
- **Qwen CLI 文档**: https://github.com/QwenLM/qwen-code
- **Stigmergy 项目**: https://github.com/your-org/stigmergy-cli-multi-agents

---

## 📝 更新日志

### v1.0.0 (2025-01-26)
- ✅ 初始版本
- ✅ 支持 5 个 superpowers 技能
- ✅ Session start hook
- ✅ Pre-prompt hook
- ✅ 自动技能激活
- ✅ 完整测试套件

---

**文档版本**: 1.0.0
**最后更新**: 2025-01-26
**维护者**: Stigmergy Project
