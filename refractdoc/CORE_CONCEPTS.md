# Stigmergy CLI 多智能体编排系统 - 核心概念详解

## 文档层次结构

本文档位于规范化文档体系的支撑文档层。

### 依赖关系
- 依赖: REQUIREMENTS.md, DESIGN.md
- 被依赖: CONTEXT_MANAGEMENT_DESIGN.md

### 文档用途
详细解释 Stigmergy CLI 多智能体编排系统的核心概念，包括事件驱动架构、智能合并策略、完整追踪系统和三文件系统。

## 相关文档
- [REQUIREMENTS.md](./REQUIREMENTS.md) - 需求文档
- [DESIGN.md](./DESIGN.md) - 设计文档
- [CONTEXT_MANAGEMENT_DESIGN.md](./CONTEXT_MANAGEMENT_DESIGN.md) - 上下文管理设计
- [DOCUMENT_RELATIONSHIP_MAP.md](./DOCUMENT_RELATIONSHIP_MAP.md) - 文档关系图
- [CONSISTENCY_CHECK_REPORT.md](./CONSISTENCY_CHECK_REPORT.md) - 一致性检测报告
- [DOCUMENT_CONSTRAINTS.md](./DOCUMENT_CONSTRAINTS.md) - 文档约束和验证规则

## 变更历史

| 版本 | 日期 | 作者 | 变更内容 | 影响范围 |
|------|------|------|---------|---------|
| v1.0 | 2026-01-13 | iFlow CLI | 初始版本 | 所有章节 |
| v1.1 | 2026-01-13 | iFlow CLI | 添加三文件系统概念 | 第 4 节 |

## 概述

本文档详细解释 Stigmergy CLI 多智能体编排系统的四个核心概念：
1. 事件驱动架构（EventBus）- 实时状态更新和通知
2. 智能合并策略 - 自动处理合并冲突
3. 完整追踪系统 - 事件日志 + Worktree 记录
4. 三文件系统 - 任务规划和追踪机制

---

## 1. 事件驱动架构（Event-Driven Architecture）

### 1.1 什么是事件驱动？

事件驱动是一种软件架构模式，系统中的组件通过发布和订阅事件来进行通信，而不是直接调用。这种方式实现了松耦合、异步通信和可扩展性。

### 1.2 EventBus 的工作原理

#### 事件定义

```typescript
interface Event {
  id: string
  timestamp: Date
  type: EventType
  source: string
  data: any
  correlationId?: string  // 关联 ID，用于追踪相关事件
  userId?: string
  sessionId?: string
}
```

#### 事件类型

```typescript
type EventType = 
  // 任务事件
  | 'task.created'           // 任务创建
  | 'task.started'           // 任务启动
  | 'task.completed'         // 任务完成
  | 'task.failed'            // 任务失败
  | 'task.paused'            // 任务暂停
  | 'task.resumed'           // 任务恢复
  
  // 锁事件
  | 'lock.acquired'          // 锁获取
  | 'lock.released'          // 锁释放
  | 'lock.failed'            // 锁获取失败
  | 'lock.timeout'           // 锁超时
  
  // Worktree 事件
  | 'worktree.created'       // Worktree 创建
  | 'worktree.merged'        // Worktree 合并
  | 'worktree.removed'       // Worktree 删除
  | 'worktree.conflict'      // Worktree 冲突
  
  // 终端事件
  | 'terminal.started'       // 终端启动
  | 'terminal.completed'     // 终端完成
  | 'terminal.failed'        // 终端失败
  | 'terminal.crashed'       // 终端崩溃
  
  // 其他事件
  | 'conflict.detected'      // 冲突检测
  | 'error.occurred'         // 错误发生
```

#### EventBus 实现

```typescript
class EventBus {
  private eventLog: Event[] = []
  private subscribers: Map<EventType, EventHandler[]> = new Map()

  // 发布事件
  async publish(event: Event): Promise<void> {
    // 1. 记录到内存
    this.eventLog.push(event)
    
    // 2. 持久化到文件
    await this.persistEvent(event)
    
    // 3. 通知所有订阅者
    const handlers = this.subscribers.get(event.type) || []
    await Promise.all(handlers.map(handler => handler(event)))
  }

  // 订阅事件
  subscribe(eventType: EventType, handler: EventHandler): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, [])
    }
    this.subscribers.get(eventType)!.push(handler)
  }

  // 查询事件
  async queryEvents(filter: EventFilter): Promise<Event[]> {
    let events = [...this.eventLog]
    
    if (filter.taskId) {
      events = events.filter(e => e.correlationId === filter.taskId)
    }
    
    if (filter.type) {
      events = events.filter(e => e.type === filter.type)
    }
    
    if (filter.startTime && filter.endTime) {
      events = events.filter(e => 
        e.timestamp >= filter.startTime && 
        e.timestamp <= filter.endTime
      )
    }
    
    return events
  }
}
```

### 1.3 事件驱动架构的优势

#### 1.3.1 松耦合

组件之间不直接依赖，通过事件通信，降低耦合度。

#### 1.3.2 异步通信

事件发布和订阅是异步的，不会阻塞主流程。

#### 1.3.3 可扩展性

易于添加新的事件类型和处理器。

#### 1.3.4 可追溯性

所有事件都被记录，支持审计和调试。

### 1.4 事件驱动架构的应用场景

#### 1.4.1 任务状态监控

```typescript
// 订阅任务完成事件
eventBus.subscribe('task.completed', async (event) => {
  console.log(`Task ${event.correlationId} completed`)
  await cleanupTask(event.correlationId)
})

// 订阅任务失败事件
eventBus.subscribe('task.failed', async (event) => {
  console.error(`Task ${event.correlationId} failed:`, event.data.error)
  await notifyUser(event.correlationId, event.data.error)
})
```

#### 1.4.2 实时通知

```typescript
// 订阅冲突检测事件
eventBus.subscribe('conflict.detected', async (event) => {
  console.warn(`Conflict detected in task ${event.correlationId}:`, event.data.conflicts)
  await pauseTask(event.correlationId)
  await notifyUser(event.correlationId, event.data.conflicts)
})
```

---

## 2. 智能合并策略

### 2.1 什么是智能合并策略？

智能合并策略是指在合并 Git Worktree 时，根据冲突类型和上下文自动选择合适的合并策略，减少人工干预。

### 2.2 合并策略类型

#### 2.2.1 Squash 合并

将所有提交压缩为一个提交，保留更改但简化历史记录。

```bash
git merge --squash <branch>
```

**适用场景**：
- 功能分支合并到主分支
- 临时实验分支
- 不需要保留详细历史的分支

#### 2.2.2 Merge 合并

保留完整的提交历史，创建合并提交。

```bash
git merge <branch>
```

**适用场景**：
- 需要保留完整历史的分支
- 长期维护的分支
- 团队协作分支

#### 2.2.3 Selective 合并

只合并特定文件，忽略其他更改。

```bash
git checkout --patch <branch> <file>
```

**适用场景**：
- 只需要部分更改
- 避免引入不相关的更改
- 精确控制合并内容

### 2.3 智能合并策略的实现

#### 2.3.1 冲突检测

```typescript
async detectConflicts(worktree: Worktree): Promise<Conflict[]> {
  const conflicts: Conflict[] = []
  
  // 1. 检查文件冲突
  const { stdout } = await exec('git diff --name-only --diff-filter=U', {
    cwd: worktree.worktreePath
  })
  
  const conflictedFiles = stdout.trim().split('\n').filter(f => f)
  
  for (const file of conflictedFiles) {
    // 2. 分析冲突类型
    const conflictType = await analyzeConflictType(file, worktree)
    
    // 3. 生成解决方案
    const resolution = await generateResolution(conflictType, file, worktree)
    
    conflicts.push({
      file,
      type: conflictType,
      resolution
    })
  }
  
  return conflicts
}
```

#### 2.3.2 自动解决冲突

```typescript
async resolveConflict(conflict: Conflict): Promise<boolean> {
  switch (conflict.type) {
    case 'whitespace':
      // 空格冲突：自动解决
      await exec(`git checkout --ours ${conflict.file}`, {
        cwd: conflict.worktree.worktreePath
      })
      return true
      
    case 'minor':
      // 轻微冲突：自动合并
      await exec(`git checkout --theirs ${conflict.file}`, {
        cwd: conflict.worktree.worktreePath
      })
      return true
      
    case 'major':
      // 重大冲突：需要人工干预
      return false
      
    default:
      return false
  }
}
```

### 2.4 智能合并策略的优势

#### 2.4.1 自动化

自动处理大部分合并冲突，减少人工干预。

#### 2.4.2 灵活性

支持多种合并策略，根据场景选择合适的策略。

#### 2.4.3 智能化

根据冲突类型自动选择解决方法。

#### 2.4.4 可控性

提供手动干预的选项，确保合并质量。

---

## 3. 完整追踪系统

### 3.1 什么是完整追踪系统？

完整追踪系统通过事件日志和 Worktree 记录，实现对任务执行过程的完整追踪，包括任务时间线、文件修改历史、审计报告等。

### 3.2 追踪数据的来源

#### 3.2.1 事件日志

记录所有系统事件，包括任务创建、锁获取、Worktree 操作等。

```typescript
interface EventLog {
  id: string
  timestamp: Date
  type: EventType
  source: string
  data: any
  correlationId?: string
  level: 'info' | 'warning' | 'error'
}
```

#### 3.2.2 Worktree 记录

记录每个 Worktree 的创建、修改、合并、删除等操作。

```typescript
interface WorktreeRecord {
  taskId: string
  subtaskId: string
  worktreePath: string
  branch: string
  createdAt: Date
  operations: WorktreeOperation[]
  conflicts: Conflict[]
  modifiedFiles: string[]
}
```

### 3.3 追踪系统的功能

#### 3.3.1 任务时间线

```typescript
async generateTaskTimeline(taskId: string): Promise<Timeline> {
  // 1. 获取所有相关事件
  const events = await eventLog.queryByTaskId(taskId)
  
  // 2. 按时间排序
  events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  
  // 3. 生成时间线
  const timeline: Timeline = {
    taskId,
    events: events.map(e => ({
      timestamp: e.timestamp,
      type: e.type,
      source: e.source,
      data: e.data
    })),
    phases: identifyPhases(events),
    milestones: identifyMilestones(events)
  }
  
  return timeline
}
```

#### 3.3.2 文件修改历史

```typescript
async getFileHistory(filePath: string): Promise<FileHistory> {
  // 1. 获取 Git 日志
  const { stdout } = await exec(`git log --follow --pretty=format:"%H|%s|%an|%cd" -- ${filePath}`)
  
  // 2. 解析日志
  const commits = stdout.split('\n').map(line => {
    const [hash, subject, author, date] = line.split('|')
    return { hash, subject, author, date: new Date(date) }
  })
  
  return {
    filePath,
    commits
  }
}
```

#### 3.3.3 审计报告

```typescript
async generateAuditReport(taskId: string): Promise<AuditReport> {
  // 1. 获取事件日志
  const events = await eventLog.queryByTaskId(taskId)
  
  // 2. 获取 Worktree 记录
  const worktrees = await getWorktreesForTask(taskId)
  
  // 3. 统计信息
  const stats = {
    totalEvents: events.length,
    errorEvents: events.filter(e => e.level === 'error').length,
    warningEvents: events.filter(e => e.level === 'warning').length,
    totalWorktrees: Object.keys(worktrees).length,
    totalConflicts: Object.values(worktrees)
      .reduce((sum, wt) => sum + wt.conflicts.length, 0),
    totalModifiedFiles: Object.values(worktrees)
      .reduce((sum, wt) => sum + wt.modifiedFiles.length, 0),
    totalDuration: calculateTotalDuration(events)
  }
  
  // 4. 生成报告
  return {
    taskId,
    task,
    stats,
    events,
    worktrees,
    timeline: await generateTaskTimeline(taskId),
    recommendations: generateRecommendations(stats, events, worktrees)
  }
}
```

### 3.4 追踪命令

```bash
# 查看任务时间线
stigmergy timeline <task-id>

# 查看文件修改历史
stigmergy file-history <file-path>

# 生成审计报告
stigmergy audit <task-id>

# 查看事件日志
stigmergy events list --task <task-id>
stigmergy events list --component <component>
stigmergy events list --level error

# 实时查看事件
stigmergy events tail

# 查看冲突历史
stigmergy conflicts history <task-id>
```

---

## 4. 三文件系统（Task Planning Files）

### 4.1 什么是三文件系统？

三文件系统是一种任务规划和追踪机制，为每个任务创建三个 Markdown 文件来管理任务执行过程：

1. **task_plan.md** - 任务规划文件
2. **findings.md** - 研究发现文件
3. **progress.md** - 进度日志文件

### 4.2 三文件系统的作用

#### 4.2.1 防止信息丢失

- **视觉信息捕获**: 每次查看/浏览操作后立即保存发现到 findings.md
- **决策记录**: 所有技术决策都记录到 task_plan.md
- **错误追踪**: 所有错误都记录到 task_plan.md 和 progress.md

#### 4.2.2 上下文恢复

- **快速定位**: 通过 5-Question Reboot Check 快速恢复上下文
- **状态追踪**: 当前阶段、已完成阶段、进度一目了然
- **历史回顾**: 所有的研究发现、决策、错误都有记录

#### 4.2.3 注意力管理

- **注意力操纵**: 重读计划 before 重大决策，避免偏离目标
- **阶段提醒**: 明确当前阶段和剩余阶段
- **目标提醒**: 持续提醒最终目标

### 4.3 三文件系统的结构

#### 4.3.1 task_plan.md

```markdown
# Task Plan: [任务描述]

## Goal
[一句话描述最终状态]

## Current Phase
[当前阶段]

## Phases
- Phase 1: Requirements & Discovery
- Phase 2: Planning & Structure
- Phase 3: Implementation
- Phase 4: Testing & Verification
- Phase 5: Delivery

## Key Questions
1. [问题 1]
2. [问题 2]

## Decisions Made
| Decision | Rationale |
|----------|-----------|
|          |           |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
|       | 1       |            |

## Notes
- 更新阶段状态: pending → in_progress → completed
- 重大决策前重读此计划
- 记录所有错误 - 避免重复
```

#### 4.3.2 findings.md

```markdown
# Findings & Decisions

## Requirements
<!-- 从用户请求中捕获 -->
-

## Research Findings
<!-- 探索过程中的关键发现 -->
-

## Technical Decisions
<!-- 带有理由的技术决策 -->
| Decision | Rationale |
|----------|-----------|
|          |           |

## Issues Encountered
<!-- 错误和如何解决 -->
| Issue | Resolution |
|-------|------------|
|       |            |

## Resources
<!-- URL、文件路径、API 引用 -->
-

## Visual/Browser Findings
<!-- 关键: 每次查看/浏览操作后立即更新 -->
<!-- 多模态内容必须立即捕获为文本 -->
-

---
*每次 2 次查看/浏览/搜索操作后更新此文件*
*这可以防止视觉信息丢失*
```

#### 4.3.3 progress.md

```markdown
# Progress Log

## Session: [时间戳]

### Phase 1: [标题]
- **Status:** in_progress
- **Started:** [时间戳]
- Actions taken:
  -
- Files created/modified:
  -

### Phase 2: [标题]
- **Status:** pending
- Actions taken:
  -
- Files created/modified:
  -

## Test Results

| Test | Input | Expected | Actual | Status |
|------|-------|----------|--------|--------|
|      |       |          |        |        |

## Error Log

<!-- 保留所有错误 - 它们帮助避免重复 -->
| Timestamp | Error | Attempt | Resolution |
|-----------|-------|---------|------------|
|           |       | 1       |            |

## 5-Question Reboot Check
<!-- 如果你能回答这些问题，上下文就稳固了 -->
| Question | Answer |
|----------|--------|
| Where am I? | Phase X |
| Where am I going? | 剩余阶段 |
| What's the goal? | [目标陈述] |
| What have I learned? | 见 findings.md |
| What have I done? | 见上文 |

---
*完成每个阶段或遇到错误后更新*
```

### 4.4 三文件系统的使用流程

#### 4.4.1 初始化

```typescript
// 创建三文件系统
const planningFiles = await planningFilesManager.initializeTask(
  taskId,
  taskDescription,
  worktreePath
);
```

#### 4.4.2 更新任务规划

```typescript
// 更新当前阶段
await planningFilesManager.updateTaskPlan(taskId, {
  currentPhase: 'Phase 2'
});

// 添加关键问题
await planningFilesManager.updateTaskPlan(taskId, {
  keyQuestions: ['What is the best approach?']
});

// 添加决策
await planningFilesManager.updateTaskPlan(taskId, {
  decisions: [{
    decision: 'Use TypeScript',
    rationale: 'Type safety is important',
    timestamp: new Date()
  }]
});

// 添加错误
await planningFilesManager.updateTaskPlan(taskId, {
  errors: [{
    error: 'Module not found',
    attempt: 1,
    resolution: 'Install dependencies',
    timestamp: new Date()
  }]
});
```

#### 4.4.3 添加研究发现

```typescript
// 添加研究发现
await planningFilesManager.addFinding(taskId, {
  category: 'research',
  content: 'Found useful library for task',
  timestamp: new Date()
});
```

#### 4.4.4 记录进度

```typescript
// 记录进度
await planningFilesManager.addProgressEntry(taskId, {
  phase: 'Phase 2',
  status: 'completed',
  action: 'Completed requirements analysis',
  files: ['src/index.ts', 'package.json'],
  timestamp: new Date()
});
```

### 4.5 三文件系统与 ResumeSession 的集成

#### 4.5.1 保存状态

```typescript
// ResumeSession 保存三文件系统状态
const taskState = await planningFilesManager.getTaskState(taskId);
await resumeSession.saveTaskState(taskId, {
  ...task,
  currentPhase: taskState.currentPhase,
  completedPhases: taskState.completedPhases,
  findings: taskState.findings,
  progress: taskState.progress,
  errors: taskState.errors
});
```

#### 4.5.2 恢复状态

```typescript
// ResumeSession 恢复三文件系统状态
const task = await resumeSession.restoreTaskState(taskId);
// 快速恢复上下文
console.log('Current Phase:', task.currentPhase);
console.log('Completed Phases:', task.completedPhases);
console.log('Findings:', task.findings);
console.log('Progress:', task.progress);
```

### 4.6 三文件系统与 EventBus 的集成

#### 4.6.1 重要事件记录

```typescript
// EventBus 自动记录重要事件到 findings.md
eventBus.subscribe('task.created', async (event) => {
  await planningFilesManager.addFinding(event.correlationId, {
    category: 'research',
    content: `Task created: ${event.data.description}`,
    timestamp: new Date(event.timestamp)
  });
});

eventBus.subscribe('conflict.detected', async (event) => {
  await planningFilesManager.addFinding(event.correlationId, {
    category: 'issue',
    content: `Conflict detected: ${event.data.conflicts.join(', ')}`,
    timestamp: new Date(event.timestamp)
  });
});
```

#### 4.6.2 错误事件记录

```typescript
// EventBus 自动记录错误到 task_plan.md
eventBus.subscribe('error.occurred', async (event) => {
  await planningFilesManager.updateTaskPlan(event.correlationId, {
    errors: [{
      error: event.data.error,
      attempt: event.data.attempt || 1,
      resolution: event.data.resolution,
      timestamp: new Date(event.timestamp)
    }]
  });
});
```

### 4.7 三文件系统的最佳实践

#### 4.7.1 更新频率

- **task_plan.md**: 每次阶段变更、决策、错误时更新
- **findings.md**: 每 2 次查看/浏览/搜索操作后更新
- **progress.md**: 完成每个阶段或遇到错误时更新

#### 4.7.2 内容质量

- **task_plan.md**: 保持简洁，只记录关键信息
- **findings.md**: 详细记录，包含时间戳和元数据
- **progress.md**: 实时更新，记录所有操作

#### 4.7.3 上下文恢复

- **中断前**: 确保所有文件都已更新
- **恢复后**: 先读取 task_plan.md，然后是 findings.md，最后是 progress.md
- **5-Question Reboot Check**: 如果能回答所有问题，说明上下文恢复成功

### 4.8 三文件系统的优势

#### 4.8.1 防止信息丢失

- **视觉信息**: 每次查看/浏览后立即保存
- **决策过程**: 所有决策都有理由记录
- **错误经验**: 所有错误都有解决方案记录

#### 4.8.2 提高效率

- **快速定位**: 通过搜索快速找到相关信息
- **避免重复**: 查看历史记录避免重复错误
- **持续提醒**: 持续提醒目标和当前阶段

#### 4.8.3 改善质量

- **决策质量**: 重读计划确保决策正确
- **代码质量**: 记录所有测试结果
- **交付质量**: 确保所有需求都得到满足

---

## 5. 总结

这四个核心概念共同构成了一个强大的编排系统：

### 5.1 事件驱动架构（EventBus）
- **实时监控**：通过事件订阅实现实时的状态更新
- **松耦合**：组件之间通过事件通信，降低耦合度
- **可扩展**：易于添加新的事件类型和处理器
- **可追溯**：所有事件都被记录，支持审计和调试

### 5.2 智能合并策略
- **自动化**：自动处理大部分合并冲突
- **灵活性**：支持多种合并策略（squash、merge、selective）
- **智能化**：根据冲突类型自动选择解决方法
- **可控性**：提供手动干预的选项

### 5.3 完整追踪系统
- **全面性**：记录所有操作和状态变化
- **可追溯**：支持任务时间线、文件修改历史、审计报告
- **可查询**：提供多种查询方式（按任务、时间、组件等）
- **可审计**：支持完整的审计和合规要求

### 5.4 三文件系统
- **防止信息丢失**：视觉信息、决策、错误都被记录
- **快速恢复**：通过 5-Question Reboot Check 快速恢复上下文
- **注意力管理**：重读计划、阶段提醒、目标提醒
- **提高质量**：决策质量、代码质量、交付质量

这四个概念相互配合，实现了一个高效、可靠、可追踪、可恢复的多智能体编排系统！

---

*本文档持续更新中，与系统实现保持同步*