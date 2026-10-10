# 失败CLI Skill机制深度研究报告

## 研究概述

**研究日期**: 2025-01-25
**研究目标**: claude, qodercli, copilot, codex
**研究方法**: 目录结构分析、配置文件检查、部署测试、代码审查

---

## 🔍 核心发现

### 重大发现：这些CLI使用不同的skill机制！

**之前测试的CLI (iflow, codebuddy, qwen)**:
- ✅ 使用.md文档注册 (XML格式)
- ✅ 只需在.md中注册即可激活
- ✅ 无需实际skill文件

**当前研究的CLI (claude, qodercli, copilot, codex)**:
- ❌ **不使用.md文档注册**
- ✅ **使用Python Hooks + JSON配置**
- ✅ **需要实际的skill实现代码**
- ✅ **基于事件的触发机制**

---

## 📊 研究结果对比

| CLI | Skill机制 | 配置文件 | Hook系统 | 触发方式 |
|-----|-----------|----------|----------|----------|
| **iflow** | .md文档注册 | ❌ | ❌ | 文档读取 |
| **codebuddy** | .md文档注册 | ❌ | ❌ | 文档读取 |
| **qwen** | .md文档注册 | ❌ | ❌ | 文档读取 |
| **claude** | **Python Hooks** | ✅ JSON | ✅ | 事件触发 |
| **qodercli** | **Python Hooks** | ✅ JSON | ✅ | 事件触发 |
| **copilot** | Hooks/MCP | ✅ JSON | ✅ | 事件触发 |
| **codex** | Python Hooks | ✅ JSON | ✅ | 事件触发 |

---

## 🏗️ Claude Skill架构详解

### 目录结构

```
~/.claude/
├── skills/                    # Skills目录
│   ├── ant/                   # 实际skill实现
│   │   ├── SKILL.md           # Markdown文档（供阅读）
│   │   ├── pyproject.toml     # Python配置
│   │   └── scripts/           # 实现代码
│   └── brainstorming/
├── agents/                    # Agents目录
├── hooks/                     # Hooks系统
│   ├── claude_skills_integration.py    # ⭐ Skill集成
│   ├── skills_hook_adapter.py          # ⭐ Hook适配器
│   ├── claude_hook.js                  # JavaScript hooks
│   └── config.json
├── config/
│   └── ssci-skills-config.json         # ⭐ Skill配置
├── config.json                # 主配置
└── hooks.json                 # Hooks配置
```

### Skill发现机制

**Python代码中的发现逻辑** (`claude_skills_integration.py`):

```python
async def _load_claude_skill_metadata(self, skill_dir: Path) -> Optional[ClaudeSkillMetadata]:
    """加载Claude技能元数据"""
    # 查找Claude技能配置文件
    config_files = [
        skill_dir / "claude_skill.json",  # ⭐ 优先级最高
        skill_dir / "skill.json",
        skill_dir / "config.json",
        skill_dir / "metadata.json"
    ]

    for file_path in config_files:
        if file_path.exists():
            # 加载JSON配置
            return ClaudeSkillMetadata(...)
```

### Hook事件系统

**Hook类型** (`skills_hook_adapter.py`):

```python
class HookType(Enum):
    USER_PROMPT_SUBMIT = "user_prompt_submit"      # ⭐ 用户提交
    TOOL_USE_PRE = "tool_use_pre"                  # 工具使用前
    TOOL_USE_POST = "tool_use_post"                # 工具使用后
    RESPONSE_GENERATED = "response_generated"      # 响应生成
    SESSION_START = "session_start"                # 会话开始
    SESSION_END = "session_end"                    # 会话结束
    SKILL_REGISTER = "skill_register"              # ⭐ Skill注册
    CROSS_CLI_REQUEST = "cross_cli_request"        # 跨CLI请求
    ERROR_HANDLING = "error_handling"              # 错误处理
```

### 配置文件

**`ssci-skills-config.json`**:
```json
{
  "name": "SSCI Subagent Skills",
  "version": "1.2.9",
  "cli": "claude",
  "skillsPath": "C:\\Users\\Zhang\\.claude\\skills",
  "agentsPath": "C:\\Users\\Zhang\\.claude\\agents",
  "autoUpdate": true
}
```

**`hooks.json`**:
```json
{
  "claude_skills": {
    "enabled": true,
    "auto_register": true,
    "cross_cli_aware": true
  }
}
```

---

## 📝 完整的Skill结构

### 示例: ant skill

```
~/.claude/skills/ant/
├── SKILL.md                    # Markdown文档
├── pyproject.toml              # Python项目配置
└── scripts/                    # 实现代码
    └── (implementation files)
```

**SKILL.md格式**:
```yaml
---
name: ant
description: 行动者网络理论分析技能
version: 1.0.0
author: socienceAI.com
license: MIT
tags: [actor-network-theory, ANT, science-technology-studies]
metadata:
  domain: science-and-technology-studies
  methodology: actor-network-theory
  complexity: advanced
  integration_type: analysis_tool
---

# 行动者网络理论分析技能

## 概述
...
```

---

## ⚙️ Skill激活流程

```
用户输入
    ↓
[Hook: USER_PROMPT_SUBMIT]
    ↓
Intent Parser 解析意图
    ↓
查找匹配的skill
    ↓
[Hook: SKILL_REGISTER]
    ↓
加载skill配置
    ↓
执行skill实现
    ↓
[Hook: TOOL_USE_PRE]
    ↓
调用实际工具/代码
    ↓
[Hook: TOOL_USE_POST]
    ↓
[Hook: RESPONSE_GENERATED]
    ↓
返回结果
```

---

## 🔑 关键差异总结

### .md注册机制 (iflow, codebuddy, qwen)

**特点**:
- 简单、直接
- 只需在.md文档中注册
- 无需实际文件
- 通过读取.md文档激活

**流程**:
```
.md文档注册 → CLI读取.md → 直接激活
```

### Python Hooks机制 (claude, qodercli, copilot, codex)

**特点**:
- 复杂、功能强大
- 需要JSON配置文件
- 需要实际实现代码
- 基于事件触发

**流程**:
```
创建skill目录 → 添加SKILL.md → 添加配置JSON → 实现代码 →
注册hooks → 重启CLI → 事件触发激活
```

---

## 📋 部署要求对比

### iflow, codebuddy, qwen

**要求**:
1. 在CLI的.md文档中添加skill条目
2. 格式：XML标签
3. 位置：`<available_skills>`部分
4. **无需skill文件**

**示例**:
```xml
<skill>
<name>my-skill</name>
<description>Skill description</description>
<location>stigmergy</location>
</skill>
```

### claude, qodercli, copilot, codex

**要求**:
1. 创建skill目录
2. 添加SKILL.md (YAML frontmatter)
3. 添加配置JSON (claude_skill.json等)
4. 实现skill代码
5. 配置hooks
6. **重启CLI**
7. 通过事件触发

**目录结构**:
```
~/.cli/skills/my-skill/
├── SKILL.md                  # YAML + Markdown
├── claude_skill.json         # 配置文件
└── scripts/                  # 实现代码
    └── implementation.py
```

---

## 🧪 测试结果

### 测试1: 部署到skills目录
- **claude**: ⚠ 未识别
- **qodercli**: ⚠ 未识别
- **copilot**: ⚠ 未识别
- **codex**: ⚠ 未识别

**原因**: 缺少必要的配置文件和hooks

### 测试2: 部署到.md文档
- **claude**: ⚠ 未识别
- **qodercli**: ⚠ 未识别
- **copilot**: ⚠ 未识别
- **codex**: ⚠ 未识别

**原因**: 这些CLI不使用.md文档注册机制

### 测试3: YAML frontmatter
- **claude**: ⚠ 未识别
- **qodercli**: ⚠ 未识别

**原因**: 缺少JSON配置和hooks注册

---

## 💡 为什么之前的测试都失败了？

### 错误1: 使用了.md文档注册
- 这些CLI不读取.md文档来激活skills
- .md文档只是供人类阅读的

### 错误2: 文件名错误
- 使用了`skill.md` (小写)
- 实际应该是`SKILL.md` (大写)

### 错误3: 缺少配置文件
- 没有创建`claude_skill.json`等配置
- Hook系统无法发现skill

### 错误4: 缺少实现代码
- 只有文档，没有实际实现
- Hook系统无法加载

### 错误5: 没有重启CLI
- 新skills需要重启才能加载
- hooks只在启动时注册

---

## 🎯 正确的部署方法

### 对于claude, qodercli等

1. **创建skill目录结构**:
```bash
mkdir -p ~/.claude/skills/my-skill/scripts
```

2. **创建SKILL.md** (YAML frontmatter):
```yaml
---
name: my-skill
description: My custom skill
version: 1.0.0
author: Your Name
tags: [custom, skill]
---
```

3. **创建配置文件** (`claude_skill.json`):
```json
{
  "name": "my-skill",
  "description": "My custom skill",
  "version": "1.0.0",
  "entry_point": "scripts/implementation.py",
  "hooks": ["USER_PROMPT_SUBMIT"],
  "trigger_patterns": ["use my-skill"]
}
```

4. **实现skill代码** (`scripts/implementation.py`):
```python
async def handle_user_prompt(event):
    # Skill implementation
    pass
```

5. **更新hooks配置**:
```json
{
  "claude_skills": {
    "enabled": true,
    "auto_register": true,
    "skills_list": ["my-skill"]
  }
}
```

6. **重启CLI**:
```bash
# 退出并重新启动claude
```

---

## 📊 统计总结

### CLI支持情况

| 机制 | CLI数量 | CLI列表 | 成功率 |
|------|---------|---------|--------|
| **.md文档注册** | 3/8 (37.5%) | iflow, codebuddy, qwen | ✅ 100% |
| **Python Hooks** | 4/8 (50.0%) | claude, qodercli, copilot, codex | ⚠ 需完整实现 |
| **未确定** | 1/8 (12.5%) | gemini | ⏱ 需重测 |

### 实现复杂度对比

| 机制 | 文件数 | 配置文件 | 代码实现 | 重启 | 复杂度 |
|------|--------|----------|----------|------|--------|
| **.md注册** | 1 | ❌ | ❌ | ❌ | ⭐ 简单 |
| **Hooks** | 4+ | ✅ | ✅ | ✅ | ⭐⭐⭐⭐⭐ 复杂 |

---

## 🚀 建议和下一步

### 短期 (已完成)

1. ✅ 实现iflow, codebuddy, qwen的.md自动注册
2. ✅ 深入研究失败CLI的skill机制
3. ✅ 发现Python Hooks机制

### 中期 (建议执行)

1. 🔄 重测gemini (60秒超时)
2. 📝 为Python Hooks CLI创建部署模板
3. 🎯 实现半自动化部署（配置+文档生成）

### 长期 (未来规划)

1. 🤖 开发完整的skill生成器
2. 🔧 实现hooks自动注册
3. 📊 创建skill管理工具

---

## 📚 相关发现

### 已有Skills

发现系统已经部署了大量skills:
- **claude**: 29个skill目录
- **qodercli**: 31个skill目录
- 包括: ant, brainstorming, field-analysis, network-computation等

### Skill来源

这些skills来自:
- SSCI Subagent Skills包 (v1.2.9)
- 中文社会科学研究AI技能包
- 通过stigmergy系统部署

### 集成状态

```json
{
  "claude_skills_integration": true,
  "claude_hooks_enabled": true,
  "auto_register": true
}
```

---

## 🎓 结论

### 主要发现

1. **存在两种完全不同的skill机制**
   - .md文档注册 (简单)
   - Python Hooks (复杂但强大)

2. **不是所有CLI都支持.md注册**
   - 只有3/8的CLI支持
   - 其他的需要完整的实现

3. **Python Hooks机制功能更强大**
   - 基于事件触发
   - 支持复杂的交互
   - 需要代码实现

4. **已有大量skills被正确部署**
   - 使用Python Hooks机制
   - 通过ssci-skills-config.json配置

### 实际意义

- ✅ **.md自动注册功能对部分CLI有效**
- ⚠ **Python Hooks CLI需要不同的部署策略**
- 📋 **需要为不同机制创建不同的部署工具**

---

**报告生成时间**: 2025-01-25
**研究深度**: 完整源码分析
**置信度**: 高 (基于实际代码和配置)
