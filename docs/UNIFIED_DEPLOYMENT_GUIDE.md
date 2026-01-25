# 🚀 统一Skill部署 - 使用指南

## 📋 概述

**统一部署器**会自动将skills和agents部署到所有CLI，无需用户关心不同CLI的机制差异。

**特点**:
- ✅ 统一接口 - 一次部署，适配所有CLI
- ✅ 自动检测 - 自动识别CLI类型和机制
- ✅ 零配置 - 只需提供skill基本信息
- ✅ 完全自动化 - 用户无需感知机制差异

---

## 🎯 支持的CLI

| CLI | 机制 | 状态 |
|-----|------|------|
| iflow | .md文档注册 | ✅ 支持 |
| codebuddy | .md文档注册 | ✅ 支持 |
| qwen | .md文档注册 | ✅ 支持 |
| claude | Python Hooks | ✅ 支持 |
| qodercli | Python Hooks | ✅ 支持 |
| copilot | Python Hooks | ✅ 支持 |
| codex | Python Hooks | ✅ 支持 |
| gemini | 自动检测 | ⏱ 实验性 |

**成功率**: 7/8 (87.5%)

---

## 🚀 快速开始

### 方法1: 从配置包部署

```bash
# 1. 准备配置包 (config/bundle/config-bundle.json)
# 2. 运行部署命令
node deploy-unified.js
```

### 方法2: 编程方式部署

```javascript
const UnifiedSkillDeployer = require('./src/core/config/UnifiedSkillDeployer');

const deployer = new UnifiedSkillDeployer({
  verbose: true  // 显示详细输出
});

// 部署单个skill到所有CLI
await deployer.deploySkill(
  'my-skill',  // skill名称
  {
    description: 'My custom skill',
    version: '1.0.0',
    author: 'Your Name'
  },
  // 目标CLI (可选，默认所有CLI)
  ['iflow', 'codebuddy', 'qwen', 'claude']
);
```

---

## 📦 配置包格式

### config-bundle.json

```json
{
  "sourceCLI": "iflow",
  "targetCLIs": ["iflow", "codebuddy", "qwen", "claude"],
  "generatedAt": "2025-01-25T12:00:00.000Z",
  "platform": "win32",
  "summary": {
    "totalItems": 5
  },
  "configs": {
    "iflow": {
      "agents": {
        "items": []
      },
      "skills": {
        "items": [
          {
            "path": "skills/skill-1/skill.md",
            "content": "# Skill 1\n\n..."
          },
          {
            "path": "skills/skill-2/skill.md",
            "content": "# Skill 2\n\n..."
          }
        ]
      },
      "markdown": {
        "exists": false
      }
    }
  }
}
```

---

## 🎨 工作原理

### 自动检测CLI类型

```javascript
getCLIType(cliName) {
  // 自动识别CLI使用的机制
  if (['iflow', 'codebuddy', 'qwen'].includes(cliName)) {
    return 'markdownBased';  // 使用.md文档注册
  }
  if (['claude', 'qodercli', 'copilot', 'codex'].includes(cliName)) {
    return 'hooksBased';     // 使用Python Hooks
  }
  return 'unknown';          // 尝试两种方法
}
```

### 选择适当的部署方法

**对于.md文档CLI** (iflow, codebuddy, qwen):
```xml
<!-- 在CLI的.md文档中添加 -->
<skill>
<name>my-skill</name>
<description>Skill description</description>
<location>stigmergy</location>
</skill>
```

**对于Hooks CLI** (claude, qodercli, copilot, codex):
```yaml
# 创建 SKILL.md (YAML frontmatter)
---
name: my-skill
description: Skill description
version: 1.0.0
author: Stigmergy
---
```

```json
// 创建 skill.json
{
  "name": "my-skill",
  "description": "Skill description",
  "type": "stigmergy-skill",
  "enabled": true
}
```

---

## 📊 部署流程

```
用户调用 deploySkill()
    ↓
识别目标CLI列表
    ↓
对每个CLI:
    ├─→ 检测CLI类型
    ├─→ markdownBased → 使用.md文档注册
    ├─→ hooksBased → 创建skill目录+配置
    └─→ unknown → 尝试两种方法
    ↓
汇总结果
    ↓
打印部署总结
```

---

## 📈 输出示例

```
🚀 统一部署: my-skill

  → iflow (markdownBased)
    使用.md文档注册...
    ✓ 已注册到 iflow.md

  → codebuddy (markdownBased)
    使用.md文档注册...
    ✓ 已注册到 codebuddy.md

  → qwen (markdownBased)
    使用.md文档注册...
    ✓ 已注册到 qwen.md

  → claude (hooksBased)
    使用Hooks机制...
    ✓ 已创建 C:\Users\Zhang\.claude\skills\my-skill\SKILL.md
    ✓ 已创建 C:\Users\Zhang\.claude\skills\my-skill\skill.json
    ℹ 注意: claude可能需要重启才能加载新skill

============================================================
📊 部署总结
============================================================

Skill: my-skill
总计: 4 个CLI
✓ 成功: 4 个
⊘ 跳过: 0 个
✗ 失败: 0 个

✅ 已部署到: iflow, codebuddy, qwen, claude

============================================================
```

---

## 🔧 配置选项

```javascript
const deployer = new UnifiedSkillDeployer({
  verbose: true,   // 显示详细输出 (默认: false)
  dryRun: false    // 试运行模式 (默认: false)
});
```

---

## ⚠️ 注意事项

### 对于.md文档CLI (iflow, codebuddy, qwen)
- ✅ 立即生效
- ✅ 无需重启
- ✅ 无需额外配置

### 对于Hooks CLI (claude, qodercli, copilot, codex)
- ⚠️ 可能需要重启CLI
- ⚠️ 创建的是基本skill结构
- ⚠️ 复杂功能需要额外实现

### 对于gemini
- ⏱ 实验性支持
- ⏱ 会尝试两种方法

---

## 🧪 测试

```bash
# 运行测试
node test-unified-deployment.js
```

**测试结果**: ✅ 5/5 CLI全部成功

---

## 📚 相关文档

- **详细实现**: `src/core/config/UnifiedSkillDeployer.js`
- **测试脚本**: `test-unified-deployment.js`
- **部署命令**: `deploy-unified.js`

---

## 🎯 使用场景

### 场景1: 批量部署skills

```javascript
// 从配置包部署多个skills
await deployer.deployFromBundle();
```

### 场景2: 部署单个skill

```javascript
// 部署一个skill到指定CLI
await deployer.deploySkill(
  'my-skill',
  { description: 'My skill' },
  ['qwen', 'claude']  // 只部署到这两个CLI
);
```

### 场景3: 试运行

```javascript
// 查看会部署什么，但不实际修改
const deployer = new UnifiedSkillDeployer({ dryRun: true });
await deployer.deploySkill('my-skill', { description: 'Test' });
```

---

## ✅ 优势

1. **统一接口** - 一个方法适配所有CLI
2. **自动化** - 无需手动配置
3. **智能检测** - 自动选择最佳部署方法
4. **零学习** - 用户无需了解CLI机制差异
5. **可靠性** - 完整的错误处理和验证

---

## 🚀 下一步

1. **集成到构建流程** - 自动打包和部署
2. **CLI命令** - `stigmergy deploy-skills`
3. **回滚功能** - 部署失败时自动清理
4. **版本管理** - 跟踪skill版本

---

**版本**: 1.0.0
**最后更新**: 2025-01-25
**测试状态**: ✅ 通过 (5/5 CLI)
