# 项目全局状态看板 - 间接协同机制

## 核心理念

**文件系统 = 持久化共享内存**

所有 CLI 会话通过读写同一个 `.stigmergy/status/PROJECT_STATUS.md` 文件实现间接协同，而非直接通信。

## 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                  多个 CLI 会话                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ qwen 会话1│  │ qwen 会话2│  │ iflow 会话│  │ claude 会话│ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       │             │             │             │          │
│       └─────────────┴─────────────┴─────────────┘          │
│                             │                               │
│                             ▼                               │
│              ┌─────────────────────────────┐               │
│              │   ProjectStatusBoard        │               │
│              │  (状态看板管理器)            │               │
│              └─────────────┬───────────────┘               │
│                            │                                 │
│                            ▼                                 │
│              ┌─────────────────────────────┐               │
│              │ PROJECT_STATUS.md           │               │
│              │ (项目全局状态文件)           │               │
│              │ - 任务队列                   │               │
│              │ - 关键发现                   │               │
│              │ - 决策日志                   │               │
│              │ - 协作历史                   │               │
│              └─────────────────────────────┘               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 状态文件结构

### PROJECT_STATUS.md

```markdown
# 项目全局状态看板

## 项目信息
- **项目名称**: xxx
- **项目根目录**: `xxx`
- **创建时间**: xxx
- **会话ID**: xxx
- **阶段**: active

## 当前状态
- **活跃CLI**: qwen
- **当前任务**: xxx
- **最后活动**: xxx

## 任务队列
### 待处理
- [ ] Task 1
- [ ] Task 2

### 进行中
- [→] Task 3 (qwen)

### 已完成
- [x] Task 4 (iflow)

## 关键发现
- **research** [qwen]: qwen 响应时间较慢，平均 16秒
- **decision** [iflow]: iflow 使用持久进程池效果更好

## 决策日志
- qwen 使用 one-shot 模式 [system]
  > 理由: qwen 不支持持久 stdin

## 协作历史
- 📋 [qwen] 你好，请简短回复 (2026/1/27 10:00:00)
- 📋 [qwen] 我刚才说了什么？ (2026/1/27 10:05:00)
- 💡 [qwen] qwen 响应时间较慢 (2026/1/27 10:10:00)
- 📋 [iflow] 帮我写一个函数 (2026/1/27 10:15:00)

---
*此文件由 Stigmergy 自动维护，请勿手动编辑*
*更新时间: 2026/1/27 10:20:00*
```

## 核心功能

### 1. 状态记录

```javascript
// 记录任务
await statusBoard.recordTask('qwen', '你好', {
  success: true,
  executionTime: 15000
});

// 记录发现
await statusBoard.recordFinding('qwen', 'research', '发现关键信息');

// 记录决策
await statusBoard.recordDecision('system', '决策内容', '理由');
```

### 2. 上下文注入

每次执行任务时，自动从状态看板获取上下文摘要并注入：

```javascript
async _buildContextualTask(cliName, task) {
  // 获取项目全局上下文
  const statusContext = await statusBoard.getContextSummary({
    maxHistory: 10,
    includeFindings: true,
    includeDecisions: true
  });

  // 获取本地 CLI 上下文
  const localContext = this._getCLIContext(cliName, 3);

  // 构建完整上下文
  return `
# Project Status Board (Cross-Session Context):
${statusContext}

# Recent Conversation (${cliName}):
${localContext}

# Current Task:
${task}
  `.trim();
}
```

### 3. 任务队列管理

```javascript
// 添加任务到队列
const taskId = await statusBoard.addTaskToQueue('实现功能X', 'high');

// 完成任务
await statusBoard.completeTask(taskId, '功能已实现');
```

### 4. CLI 切换

```javascript
// 切换 CLI 并记录原因
await statusBoard.switchCLI('iflow', {
  previousCLI: 'qwen',
  reason: '需要持久进程池'
});
```

## 与 planning-with-files 的对比

| 特性 | planning-with-files | Project Status Board |
|------|---------------------|---------------------|
| **目的** | 单个 AI 的任务规划 | 跨 CLI 会话协同 |
| **文件** | task_plan.md, findings.md, progress.md | PROJECT_STATUS.md |
| **生命周期** | 单个任务周期 | 项目整个生命周期 |
| **访问者** | 单个 AI | 多个 CLI 会话 |
| **持久化** | ✓ | ✓ |
| **并发控制** | ✗ | ✓ (文件锁) |

## 使用方式

### 1. 启动交互模式

```bash
stigmergy interactive
# 或
stigmergy i
```

### 2. 查看项目状态

```
> status
========================================
  项目全局状态看板
========================================

📁 项目信息:
  名称: my-project
  阶段: active

🎯 当前状态:
  活跃CLI: qwen
  最后活动: 2026/1/27 10:00:00

📋 任务统计:
  待处理: 3
  进行中: 1
  已完成: 5
...
```

### 3. 查看上下文

```
> context
========================================
  项目全局状态看板
========================================

📋 会话信息:
  Session ID: session-xxx
  当前CLI: qwen

📁 状态文件:
  /path/to/.stigmergy/status/PROJECT_STATUS.md

💾 本地上下文 (内存中):
  qwen: 8 条消息
  iflow: 2 条消息

📊 状态看板摘要 (持久化):
## 当前状态
- 当前CLI: qwen
...
```

### 4. 正常使用 CLI

```
> use qwen
✓ Switched to qwen CLI

qwen> 帮我实现用户认证功能
[qwen] 记录到状态看板...
[qwen] 执行任务...
✓ 完成

> use iflow
✓ Switched to iflow CLI

iflow> 继续优化认证流程
[iflow] 读取状态看板...
[iflow] 上下文注入: "qwen 刚刚实现了用户认证功能..."
[iflow] 执行任务...
✓ 完成
```

## 优势

### 1. 持久化共享内存
- ✅ 跨会话持久化
- ✅ 跨进程共享
- ✅ 版本控制友好（Markdown 文件）

### 2. 状态驱动协同
- ✅ 所有 CLI 基于同一状态工作
- ✅ 自动上下文注入
- ✅ 无需显式通信

### 3. 完整的项目历史
- ✅ 所有任务记录
- ✅ 所有关键发现
- ✅ 所有决策理由
- ✅ 完整的协作历史

### 4. 人类可读
- ✅ Markdown 格式
- ✅ 可以手动查看
- ✅ 可以添加注释
- ✅ 版本控制友好

## 工作流程示例

### 场景：多 CLI 协作开发功能

```
# 会话1：qwen
> use qwen
qwen> 设计一个用户认证系统
# 状态看板记录任务
# 生成设计方案

qwen> 总结一下设计方案
# 记录发现到状态看板

# 会话1结束
> exit

---

# 会话2：iflow（可能是另一个人，或稍后继续）
> use iflow
# 读取状态看板，看到之前的设计方案

iflow> 基于设计方案，实现认证 API
# 上下文自动注入：qwen 设计了认证系统
# 生成代码

iflow> 发现：需要添加密码加密
# 记录发现到状态看板

# 会话2结束
> exit

---

# 会话3：claude
> use claude
# 读取状态看板，看到：
# - qwen 的设计方案
# - iflow 的实现代码
# - 密码加密的问题

claude> 添加密码加密功能，并更新 API
# 上下文自动注入
# 完成功能

> status
# 查看完整的项目状态和协作历史
```

## 状态文件位置

```
项目根目录/
├── .stigmergy/
│   ├── status/
│   │   ├── PROJECT_STATUS.md    # 主状态文件
│   │   └── STATUS.lock          # 文件锁
│   ├── planning-files/          # TaskPlanningFiles
│   │   └── task-xxx/
│   │       ├── task_plan.md
│   │       ├── findings.md
│   │       └── progress.md
│   └── ...
└── ...
```

## 技术实现

### 文件锁机制

```javascript
async _acquireLock() {
  const maxWait = 5000;
  const start = Date.now();

  while (Date.now() - start < maxWait) {
    try {
      await fs.writeFile(this.lockFilePath, process.pid.toString(), { flag: 'wx' });
      return; // 成功获取锁
    } catch {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  throw new Error('Failed to acquire lock after timeout');
}
```

### 上下文摘要生成

```javascript
async getContextSummary(options = {}) {
  const status = await this.readStatus();

  const sections = [];

  // 当前状态
  sections.push(`## 当前状态`);
  sections.push(`- 当前CLI: ${status.currentCLI}`);
  sections.push(`- 项目阶段: ${status.projectInfo.phase}`);
  sections.push('');

  // 任务概览
  if (status.taskQueue?.length > 0) {
    sections.push(`## 任务队列`);
    // ... 添加任务信息
  }

  // 关键发现
  if (status.findings?.length > 0) {
    sections.push(`## 关键发现`);
    status.findings.slice(-maxHistory).forEach(f => {
      sections.push(`- **${f.category}** [${f.cli}]: ${f.content}`);
    });
  }

  return sections.join('\n');
}
```

## 与原内存上下文的对比

| 特性 | 原内存上下文 | 状态看板 |
|------|-------------|---------|
| **持久化** | ✗ (会话结束丢失) | ✓ |
| **跨会话共享** | ✗ | ✓ |
| **跨进程共享** | ✗ | ✓ |
| **人类可读** | ✗ | ✓ |
| **版本控制** | ✗ | ✓ |
| **性能** | 快 (内存) | 慢 (文件 I/O) |
| **复杂度** | 简单 | 中等 |

## 最佳实践

### 1. 状态看板使用

- ✓ 启动项目时初始化状态看板
- ✓ 每次任务都记录到状态看板
- ✓ 定期查看状态报告
- ✓ 重要发现立即记录
- ✓ 决策理由详细记录

### 2. 上下文管理

- ✓ 状态看板用于长期、跨会话的上下文
- ✓ 内存上下文用于短期、高频的对话
- ✓ 两者结合使用：状态看板 + 本地 CLI 上下文

### 3. 文件管理

- ✓ 将 PROJECT_STATUS.md 加入版本控制
- ✓ 定期备份状态文件
- ✓ 大型项目考虑分割状态文件
- ✓ 使用分支隔离不同实验的状态

## 总结

**项目全局状态看板**实现了：

1. ✅ **持久化共享内存** - 文件系统作为中介
2. ✅ **状态驱动协同** - 所有 CLI 基于同一状态
3. ✅ **完整项目历史** - 任务、发现、决策、协作记录
4. ✅ **人类可读** - Markdown 格式，易于查看
5. ✅ **跨会话持久** - 任何时间恢复上下文

这正是您建议的"stigmergy 全局上建立一个项目全局的状态看板，不同会话都严格基于这个项目状态进行间接协同，共享上下文"的实现！
