# 斜杠命令 /history 方案可行性分析

## 方案概述

通过在AI CLI中实现斜杠命令 `/history` 来查看跨CLI的历史会话，并提供会话内容导出和有限恢复功能。

## 1. 斜杠命令支持现状

### 实际测试结果

| CLI | 斜杠命令支持 | 现有斜杠命令 | /history实现可行性 |
|-----|-------------|-------------|-------------------|
| Claude | ✅ | `--disable-slash-commands` | ⚠️ 需插件支持 |
| Gemini | ❌ | 无 | ❌ 需外部工具 |
| Qwen | ❌ | 无 | ❌ 需外部工具 |
| IFlow | ❌ | 无 | ❌ 需外部工具 |
| Qoder | ❌ | 无 | ❌ 需外部工具 |

**关键发现**: 只有Claude CLI原生支持斜杠命令，其他CLI需要外部工具实现。

### Claude斜杠命令架构

基于实际测试，Claude CLI有完整的斜杠命令系统：

```bash
# Claude CLI斜杠命令相关选项
--disable-slash-commands    # 禁用所有斜杠命令
```

说明Claude有内置的斜杠命令处理机制，可以通过插件扩展。

## 2. /history 命令实现方案

### 方案1: Claude插件扩展 (仅Claude)

**技术实现**:
```javascript
// Claude插件格式
module.exports = {
  name: 'cross-cli-history',
  version: '1.0.0',
  slashCommands: {
    history: {
      description: '查看跨CLI历史会话',
      handler: async (args, context) => {
        return await showCrossCLIHistory(context.cwd);
      }
    }
  }
};

// 实际会话扫描逻辑
async function showCrossCLIHistory(projectPath) {
  const sessions = await scanAllCLISessions(projectPath);

  let output = `## 跨CLI历史会话 (${projectPath})\n\n`;

  sessions.forEach((session, index) => {
    const time = new Date(session.lastUpdated).toLocaleString();
    const icon = getCLIIcon(session.sourceCLI);

    output += `**${index + 1}. ${icon} ${session.sourceCLI.toUpperCase()}**\n`;
    output += `- 时间: ${time}\n`;
    output += `- 消息数: ${session.messages.length}\n`;
    output += `- 最后消息: ${getLastMessage(session)}\n\n`;
  });

  return output;
}
```

**可行性**: ⭐⭐⭐⭐ **Claude专用，高度可行**

### 方案2: 独立CLI工具 (通用方案)

**技术实现**:
```bash
# 创建独立的history工具
npm install -g cli-history-viewer

# 使用方式
cli-history --project /path/to/project
# 或者在CLI中使用
echo "/history" | cli-history --stdin
```

**可行性**: ⭐⭐⭐⭐⭐ **完全可行，适用于所有CLI**

## 3. 历史会话可查看的信息

### 基于实际会话文件分析

#### Claude会话文件 (JSONL)
```json
{
  "parentUuid": null,
  "isSidechain": true,
  "cwd": "C:\\Users\\Zhang\\AppData\\Local\\Temp",
  "sessionId": "f7767350-c888-4607-8f66-4c2b19fa5f3a",
  "version": "2.0.65",
  "gitBranch": "",
  "agentId": "a0b7aea",
  "type": "user",
  "message": {
    "role": "user",
    "content": "Warmup"
  },
  "uuid": "4515abe9-1f5a-4b79-bc1a-b78e85f46708",
  "timestamp": "2025-12-12T00:39:01.396Z"
}
```

#### 可提取的展示信息

| 信息类型 | Claude | Gemini | Qwen | IFlow | Qoder |
|---------|--------|--------|------|-------|-------|
| 会话ID | ✅ sessionId | ✅ sessionId | ✅ sessionId | ✅ sessionId | ✅ id |
| 时间戳 | ✅ timestamp | ✅ timestamp | ✅ timestamp | ✅ timestamp | ✅ created_at |
| 工作目录 | ✅ cwd | ❌ | ❌ | ✅ cwd | ✅ working_dir |
| Git分支 | ✅ gitBranch | ❌ | ❌ | ✅ gitBranch | ❌ |
| 消息内容 | ✅ message.content | ✅ content | ✅ content | ✅ content | ✅ 需要读取详细内容 |
| 消息数量 | ✅ 统计JSONL行数 | ✅ messages.length | ✅ messages.length | ✅ 统计JSONL行数 | ✅ message_count |

#### /history 命令输出格式

```
## 跨CLI历史会话 (/d/my-project)

### 🤖 Claude CLI 会话 (2个)
**1. f7767350-c888-4607-8f66-4c2b19fa5f3a**
- 🕒 2025-12-12 08:39:01
- 📁 C:\Users\Zhang\AppData\Local\Temp
- 🌿 Git分支: (无)
- 💬 5条消息
- 📝 最后用户输入: "Warmup"

**2. e488609e-b6c8-4249-aa7e-87f9b4ad3df5**
- 🕒 2025-12-11 22:34:02
- 📁 C:\Users\Zhang\AppData\Local\Temp
- 🌿 Git分支: (无)
- 💬 3条消息
- 📝 最后用户输入: "分析这个代码"

### 💎 Gemini CLI 会话 (1个)
**3. 264c12b1-9b6d-47c8-887f-9e008bd15f64**
- 🕒 2025-11-03 10:44:23
- 💬 12条消息
- 📝 最后用户输入: "请检查这个项目的状态"

### 🐲 Qwen CLI 会话 (3个)
**4. 9e676089-2e2f-436f-a9e0-81bd0a4e96fc**
- 🕒 2025-11-26 22:59:49
- 💰 成本: $0.00258
- 🎯 Tokens: 16783
- 📝 最后用户输入: "工具安装有问题"

选择会话查看详情: 输入数字 (1-6) 或 'q' 退出
```

## 4. 会话内容导出作为新会话上下文

### 技术原理

将选中会话的内容导出为文本格式，作为新会话的初始上下文。

### 实现方案

```javascript
// 会话导出器
function exportSessionForRecovery(session, format = 'markdown') {
  switch (format) {
    case 'markdown':
      return exportToMarkdown(session);
    case 'context':
      return exportToContext(session);
    case 'json':
      return exportToJSON(session);
  }
}

// 导出为上下文格式
function exportToContext(session) {
  let context = `以下是从${session.sourceCLI}会话中恢复的对话历史:\n\n`;

  session.messages.forEach(msg => {
    const role = msg.type === 'user' ? '用户' : '助手';
    context += `${role}: ${msg.content}\n\n`;
  });

  context += `--- 会话结束 ---\n\n`;
  context += `现在请基于以上历史对话继续我们的讨论。`;

  return context;
}

// 使用示例
const context = exportSessionForRecovery(selectedSession);
claude --print "请基于以下上下文恢复我们的对话:\n\n${context}"
```

### 导出格式选择

| 格式 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| Markdown | 可读性好，易于编辑 | 需要手动复制粘贴 | 人工查看和编辑 |
| Context | 直接可用，格式统一 | 可能丢失原始格式 | 自动恢复 |
| JSON | 完整保留结构 | 需要解析 | 程序处理 |

## 5. 技术障碍分析

### 5.1 斜杠命令实现障碍

**障碍1: CLI原生支持差异**
- 只有Claude支持斜杠命令
- 其他CLI需要外部工具或包装器

**解决方案**:
```bash
# 通用解决方案：创建CLI包装器
# /usr/local/bin/gemini-wrapper
#!/bin/bash
if [[ "$1" == "/history" ]]; then
  cli-history-viewer --project "$(pwd)" --cli gemini
else
  command gemini "$@"
fi
```

**障碍2: 命令解析冲突**
- 原生CLI可能将"/history"当作普通输入

**解决方案**: 使用专门的交互模式或预处理。

### 5.2 会话导出技术障碍

**障碍1: 内容格式差异**
- 不同CLI的消息结构不同
- 工具调用和特殊格式处理

**技术解决方案**:
```javascript
// 格式标准化处理
function normalizeMessage(msg, sourceCLI) {
  switch (sourceCLI) {
    case 'claude':
      return {
        role: msg.message.role,
        content: msg.message.content,
        timestamp: msg.timestamp
      };
    case 'gemini':
      return {
        role: msg.type,
        content: msg.content,
        timestamp: msg.timestamp
      };
    // 其他格式...
  }
}
```

**障碍2: 上下文窗口限制**
- 长会话可能超出新会话的上下文限制
- 需要智能截断和摘要

**技术解决方案**:
```javascript
// 智能上下文截断
function truncateForContext(messages, maxTokens = 4000) {
  // 保留最近的对话，优先保留重要内容
  const truncated = messages.slice(-10); // 保留最后10条消息

  if (estimateTokens(truncated) > maxTokens) {
    // 进一步压缩
    return summarizeOldMessages(truncated, maxTokens);
  }

  return truncated;
}
```

**障碍3: 元数据丢失**
- Token使用、成本等信息无法完全恢复
- 工具调用状态可能丢失

**解决方案**: 明确告知用户限制，提供替代信息。

### 5.3 用户体验障碍

**障碍1: 会话连续性**
- 恢复的会话可能失去原有的上下文连贯性
- AI可能需要重新理解会话背景

**解决方案**:
```javascript
// 添加会话恢复提示
function addRecoveryPrompt(context) {
  return `${context}

请注意：以上是从${sourceCLI}会话中恢复的历史对话。如果某些上下文不够清晰，请告诉我，我会基于当前的信息重新理解我们的讨论。`;
}
```

## 6. 有限会话恢复的定义

### 什么是有限会话恢复？

**有限会话恢复**是指在明确的技术限制下，提供部分功能的会话恢复，与完全无缝恢复相对。

### 有限恢复的特征

1. **内容恢复**: ✅ 可以恢复对话文本内容
2. **功能限制**: ⚠️ 工具调用可能失效
3. **上下文限制**: ⚠️ 可能失去部分连续性
4. **元数据丢失**: ❌ Token、成本等信息无法保留

### 有限恢复的适用场景

**适合的场景**:
- ✅ 文本对话为主的会话
- ✅ 代码分析和讨论
- ✅ 文档编写和编辑

**不适合的场景**:
- ❌ 复杂的工具调用序列
- ❌ 依赖特定状态的会话
- ❌ 需要精确环境重现的场景

## 7. 推荐实现路径

### Phase 1: 独立CLI工具 (立即实施)

```bash
# 开发通用history工具
npm init -y cross-cli-history
# 实现核心扫描和展示功能
```

### Phase 2: CLI包装器集成 (短期目标)

```bash
# 为每个CLI创建包装器
# 支持斜杠命令或特殊参数
```

### Phase 3: Claude插件集成 (中期目标)

```bash
# 为Claude开发专用插件
# 利用原生斜杠命令系统
```

## 总结

斜杠命令 `/history` 方案在技术上是可行的：

1. **Claude CLI**: 通过插件扩展，高度可行 ⭐⭐⭐⭐
2. **其他CLI**: 通过外部工具，完全可行 ⭐⭐⭐⭐⭐

会话内容导出和有限恢复存在一些技术障碍，但都有可行的解决方案。关键是要明确告知用户限制，管理好用户预期。