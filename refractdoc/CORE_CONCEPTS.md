# Stigmergy CLI 多智能体编排系统 - 核心概念详解

## 文档层次结构

本文档位于规范化文档体系的支撑文档层。

### 依赖关系
- 依赖: REQUIREMENTS.md, DESIGN.md
- 被依赖: CONTEXT_MANAGEMENT_DESIGN.md

### 文档用途
详细解释 Stigmergy CLI 多智能体编排系统的核心概念，包括事件驱动架构、智能合并策略和完整追踪系统。

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

## 概述

本文档详细解释 Stigmergy CLI 多智能体编排系统的三个核心概念：
1. 事件驱动架构（EventBus）- 实时状态更新和通知
2. 智能合并策略 - 自动处理合并冲突
3. 完整追踪系统 - 事件日志 + Worktree 记录

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
  private logFile: string = '.stigmergy/coordination/event-log.json'
  private isListening: boolean = false
  
  // 发布事件
  async publish(event: Event): Promise<void> {
    // 1. 记录到内存
    this.eventLog.push(event)
    
    // 2. 持久化到文件
    await this.persistEvent(event)
    
    // 3. 通知所有订阅者
    const handlers = this.subscribers.get(event.type) || []
    await Promise.all(
      handlers.map(handler => handler(event))
    )
  }
  
  // 订阅事件
  subscribe(eventType: EventType, handler: EventHandler): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, [])
    }
    this.subscribers.get(eventType)!.push(handler)
  }
  
  // 取消订阅
  unsubscribe(eventType: EventType, handler: EventHandler): void {
    const handlers = this.subscribers.get(eventType)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }
  
  // 持久化事件
  private async persistEvent(event: Event): Promise<void> {
    await fs.appendFile(
      this.logFile,
      JSON.stringify(event) + '\n',
      'utf8'
    )
  }
  
  // 获取事件日志
  async getEventLog(since?: Date): Promise<Event[]> {
    if (!since) {
      return [...this.eventLog]
    }
    
    return this.eventLog.filter(event => 
      new Date(event.timestamp) >= since
    )
  }
}
```

### 1.3 实时状态更新的使用场景

#### 场景 1：终端状态监控

```typescript
// 订阅终端事件
eventBus.subscribe('terminal.started', async (event) => {
  console.log(`✅ 终端已启动: ${event.data.terminalId}`)
  updateUI('terminal.status', { 
    id: event.data.terminalId, 
    status: 'running' 
  })
})

eventBus.subscribe('terminal.completed', async (event) => {
  console.log(`✅ 终端已完成: ${event.data.terminalId}`)
  updateUI('terminal.status', { 
    id: event.data.terminalId, 
    status: 'completed' 
  })
  
  // 自动触发下一步
  if (allTerminalsCompleted()) {
    await eventBus.publish({
      id: generateId(),
      type: 'task.completed',
      timestamp: new Date(),
      source: 'orchestrator',
      data: { taskId: event.data.taskId }
    })
  }
})

eventBus.subscribe('terminal.crashed', async (event) => {
  console.error(`💥 终端崩溃: ${event.data.terminalId}`)
  
  // 自动重启
  await restartTerminal(event.data.terminalId)
})
```

#### 场景 2：锁状态通知

```typescript
// 订阅锁事件
eventBus.subscribe('lock.acquired', async (event) => {
  console.log(`🔒 锁已获取: ${event.data.taskId}/${event.data.subtaskId}`)
  
  // 通知等待的任务
  notifyWaitingTasks(event.data.subtaskId)
})

eventBus.subscribe('lock.timeout', async (event) => {
  console.warn(`⏰ 锁超时: ${event.data.taskId}/${event.data.subtaskId}`)
  
  // 强制释放锁
  await forceReleaseLock(event.data.taskId, event.data.subtaskId)
})
```

### 1.4 通知系统的实现

```typescript
class NotificationSystem {
  constructor(private eventBus: EventBus) {
    this.setupSubscriptions()
  }
  
  private setupSubscriptions() {
    // 任务完成通知
    this.eventBus.subscribe('task.completed', (event) => {
      this.sendNotification({
        title: '任务完成',
        message: `任务 ${event.data.taskId} 已完成`,
        type: 'success'
      })
    })
    
    // 错误通知
    this.eventBus.subscribe('error.occurred', (event) => {
      this.sendNotification({
        title: '错误发生',
        message: event.data.message,
        type: 'error'
      })
    })
    
    // 冲突通知
    this.eventBus.subscribe('conflict.detected', (event) => {
      this.sendNotification({
        title: '检测到冲突',
        message: `文件 ${event.data.file} 存在冲突`,
        type: 'warning',
        actions: [
          { label: '查看冲突', action: () => this.showConflict(event.data) },
          { label: '忽略', action: () => this.ignoreConflict(event.data) }
        ]
      })
    })
  }
}
```

---

## 2. 智能合并策略（Intelligent Merge Strategy）

### 2.1 什么是智能合并？

智能合并是指在将多个 Worktree 的修改合并到主分支时，使用高级策略自动处理冲突，减少手动干预。

### 2.2 合并策略类型

#### 策略 1：Squash Merge（压缩合并）

```typescript
async function squashMerge(worktreePath: string, targetBranch: string) {
  const branchName = getCurrentBranch(worktreePath)
  
  // 1. 切换到主分支
  await execGit(['checkout', targetBranch], worktreePath)
  
  // 2. 压缩合并所有提交
  await execGit(['merge', '--squash', branchName], worktreePath)
  
  // 3. 提交合并
  await execGit(['commit', '-m', `Merge worktree ${worktreePath}`], worktreePath)
  
  // 4. 删除 worktree 分支
  await execGit(['branch', '-D', branchName], worktreePath)
}
```

**适用场景**：
- 任务已完成，不需要保留分支历史
- 多个小的提交需要合并成一个
- 保持主分支历史整洁

#### 策略 2：Merge Commit（合并提交）

```typescript
async function mergeCommit(worktreePath: string, targetBranch: string) {
  const branchName = getCurrentBranch(worktreePath)
  
  // 1. 切换到主分支
  await execGit(['checkout', targetBranch], worktreePath)
  
  // 2. 创建合并提交
  await execGit(['merge', '--no-ff', branchName], worktreePath)
  
  // 3. 保留分支历史
  // 不删除 worktree 分支
}
```

**适用场景**：
- 需要保留完整的分支历史
- 需要追踪每个任务的贡献
- 代码审查和审计

#### 策略 3：Selective Merge（选择性合并）

```typescript
async function selectiveMerge(
  worktreePath: string, 
  targetBranch: string,
  includeFiles: string[],
  excludeFiles: string[]
) {
  const branchName = getCurrentBranch(worktreePath)
  
  // 1. 获取所有修改的文件
  const modifiedFiles = await getModifiedFiles(worktreePath)
  
  // 2. 筛选要合并的文件
  const filesToMerge = modifiedFiles.filter(file => {
    if (includeFiles.length > 0) {
      return includeFiles.includes(file)
    }
    return !excludeFiles.includes(file)
  })
  
  // 3. 逐个文件合并
  for (const file of filesToMerge) {
    try {
      await execGit(['checkout', targetBranch, '--', file], worktreePath)
      await execGit(['checkout', branchName, '--', file], worktreePath)
    } catch (error) {
      // 处理冲突
      await resolveConflict(file, worktreePath)
    }
  }
}
```

**适用场景**：
- 只需要合并部分文件
- 某些文件有冲突需要手动处理
- 配置文件和代码文件分开处理

### 2.3 自动冲突处理

#### 冲突检测

```typescript
async function detectConflicts(worktreePath: string): Promise<ConflictInfo[]> {
  const conflicts: ConflictInfo[] = []
  
  // 1. 检查 Git 冲突标记
  const files = await getFilesWithConflictMarkers(worktreePath)
  
  for (const file of files) {
    // 2. 分析冲突内容
    const content = await fs.readFile(file, 'utf8')
    const conflictSections = extractConflictSections(content)
    
    // 3. 检测冲突类型
    const conflictType = detectConflictType(conflictSections)
    
    conflicts.push({
      file,
      type: conflictType,
      sections: conflictSections,
      severity: calculateSeverity(conflictType, conflictSections)
    })
  }
  
  return conflicts
}

// 冲突类型
enum ConflictType {
  CODE_CHANGE = 'code-change',        // 代码修改
  CONFIG_CHANGE = 'config-change',    // 配置修改
  DEPENDENCY_CHANGE = 'dependency-change', // 依赖修改
  WHITESPACE = 'whitespace',          // 空白字符
  STRUCTURAL = 'structural'           // 结构性冲突
}
```

#### 自动冲突解决

```typescript
async function autoResolveConflict(conflict: ConflictInfo): Promise<boolean> {
  switch (conflict.type) {
    case ConflictType.WHITESPACE:
      // 自动忽略空白字符差异
      return await resolveWhitespaceConflict(conflict)
    
    case ConflictType.CONFIG_CHANGE:
      // 使用配置合并策略
      return await resolveConfigConflict(conflict)
    
    case ConflictType.DEPENDENCY_CHANGE:
      // 使用最新的依赖版本
      return await resolveDependencyConflict(conflict)
    
    case ConflictType.CODE_CHANGE:
      // 尝试使用智能合并
      return await attemptSmartMerge(conflict)
    
    case ConflictType.STRUCTURAL:
      // 需要手动解决
      return false
    
    default:
      return false
  }
}

// 智能合并示例
async function attemptSmartMerge(conflict: ConflictInfo): Promise<boolean> {
  const { file, sections } = conflict
  
  for (const section of sections) {
    // 1. 检查是否是简单的添加/删除
    if (isSimpleAddition(section)) {
      await acceptAddition(file, section)
      continue
    }
    
    if (isSimpleDeletion(section)) {
      await acceptDeletion(file, section)
      continue
    }
    
    // 2. 检查是否是相同的修改
    if (isIdenticalChange(section)) {
      await acceptEither(file, section)
      continue
    }
    
    // 3. 检查是否可以智能合并
    if (canSmartMerge(section)) {
      await mergeChanges(file, section)
      continue
    }
    
    // 4. 无法自动解决
    return false
  }
  
  return true
}
```

### 2.4 合并策略选择

```typescript
class MergeStrategySelector {
  selectStrategy(task: Task, subtasks: SubTask[]): MergeStrategy {
    // 1. 检查任务类型
    if (task.type === 'bug-fix') {
      return { type: 'squash', message: 'Bug fix' }
    }
    
    if (task.type === 'feature') {
      return { type: 'merge-commit', message: `Feature: ${task.description}` }
    }
    
    // 2. 检查子任务数量
    if (subtasks.length > 4) {
      return { type: 'squash', message: 'Multiple subtasks' }
    }
    
    // 3. 检查文件修改范围
    const modifiedFiles = getAllModifiedFiles(subtasks)
    if (modifiedFiles.length > 20) {
      return { type: 'squash', message: 'Large changeset' }
    }
    
    // 4. 检查是否有配置文件
    if (hasConfigFiles(modifiedFiles)) {
      return { 
        type: 'selective', 
        excludeFiles: modifiedFiles.filter(f => isConfigFile(f)) 
      }
    }
    
    // 默认策略
    return { type: 'merge-commit', message: 'Default merge' }
  }
}
```

---

## 3. 完整追踪系统（Complete Tracking System）

### 3.1 什么是完整追踪？

完整追踪是指记录系统中的所有操作、状态变化和事件，形成完整的执行历史，支持审计、调试和回溯。

### 3.2 事件日志系统

#### 日志结构

```typescript
interface EventLogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'warning' | 'error' | 'debug'
  component: string
  event: string
  data: any
  correlationId?: string  // 关联 ID，用于追踪相关事件
  userId?: string
  sessionId?: string
}

// 事件日志文件
// .stigmergy/coordination/event-log.json
[
  {
    "id": "evt-001",
    "timestamp": "2026-01-13T10:00:00.000Z",
    "level": "info",
    "component": "orchestrator",
    "event": "task.created",
    "data": {
      "taskId": "task-1234567890",
      "description": "实现电商系统",
      "strategy": "parallel"
    },
    "correlationId": "cor-1234567890",
    "sessionId": "session-abc123"
  },
  {
    "id": "evt-002",
    "timestamp": "2026-01-13T10:00:01.000Z",
    "level": "info",
    "component": "worktree-manager",
    "event": "worktree.created",
    "data": {
      "taskId": "task-1234567890",
      "subtaskId": "subtask-1",
      "worktreePath": ".git/worktrees/task-1234567890/subtask-1",
      "branch": "task-1234567890/subtask-1"
    },
    "correlationId": "cor-1234567890"
  },
  {
    "id": "evt-003",
    "timestamp": "2026-01-13T10:00:02.000Z",
    "level": "info",
    "component": "terminal-manager",
    "event": "terminal.started",
    "data": {
      "taskId": "task-1234567890",
      "subtaskId": "subtask-1",
      "terminalId": "term-001",
      "cli": "claude",
      "command": "claude --agent oracle"
    },
    "correlationId": "cor-1234567890"
  }
]
```

#### 日志查询

```typescript
class EventLogQuery {
  constructor(private logFile: string) {}
  
  // 按任务 ID 查询
  async queryByTaskId(taskId: string): Promise<EventLogEntry[]> {
    const logs = await this.loadLogs()
    return logs.filter(log => log.data.taskId === taskId)
  }
  
  // 按时间范围查询
  async queryByTimeRange(start: Date, end: Date): Promise<EventLogEntry[]> {
    const logs = await this.loadLogs()
    return logs.filter(log => {
      const timestamp = new Date(log.timestamp)
      return timestamp >= start && timestamp <= end
    })
  }
  
  // 按组件查询
  async queryByComponent(component: string): Promise<EventLogEntry[]> {
    const logs = await this.loadLogs()
    return logs.filter(log => log.component === component)
  }
  
  // 按关联 ID 查询
  async queryByCorrelationId(correlationId: string): Promise<EventLogEntry[]> {
    const logs = await this.loadLogs()
    return logs.filter(log => log.correlationId === correlationId)
  }
  
  // 按级别查询
  async queryByLevel(level: string): Promise<EventLogEntry[]> {
    const logs = await this.loadLogs()
    return logs.filter(log => log.level === level)
  }
  
  private async loadLogs(): Promise<EventLogEntry[]> {
    const content = await fs.readFile(this.logFile, 'utf8')
    return content.split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line))
  }
}
```

### 3.3 Worktree 记录系统

#### Worktree 注册表

```typescript
// .stigmergy/coordination/worktree-registry.json
{
  "task-1234567890": {
    "taskId": "task-1234567890",
    "description": "实现电商系统",
    "createdAt": "2026-01-13T10:00:00.000Z",
    "status": "completed",
    "worktrees": {
      "subtask-1": {
        "subtaskId": "subtask-1",
        "description": "设计数据库",
        "cli": "claude",
        "agent": "oracle",
        "worktreePath": ".git/worktrees/task-1234567890/subtask-1",
        "branch": "task-1234567890/subtask-1",
        "createdAt": "2026-01-13T10:00:01.000Z",
        "status": "completed",
        "mergedAt": "2026-01-13T10:30:00.000Z",
        "modifiedFiles": [
          "src/database/schema.sql",
          "src/database/migrations/001_initial.sql"
        ],
        "conflicts": [],
        "result": {
          "success": true,
          "output": "数据库设计完成",
          "duration": 1800000
        }
      },
      "subtask-2": {
        "subtaskId": "subtask-2",
        "description": "实现 API",
        "cli": "gemini",
        "agent": "gemini-pro",
        "worktreePath": ".git/worktrees/task-1234567890/subtask-2",
        "branch": "task-1234567890/subtask-2",
        "createdAt": "2026-01-13T10:00:01.000Z",
        "status": "completed",
        "mergedAt": "2026-01-13T10:35:00.000Z",
        "modifiedFiles": [
          "src/api/routes.js",
          "src/api/controllers.js"
        ],
        "conflicts": [
          {
            "file": "src/api/routes.js",
            "type": "code-change",
            "resolved": true,
            "resolution": "auto-merged"
          }
        ],
        "result": {
          "success": true,
          "output": "API 实现完成",
          "duration": 2100000
        }
      }
    },
    "summary": {
      "totalSubtasks": 4,
      "completedSubtasks": 4,
      "failedSubtasks": 0,
      "totalConflicts": 1,
      "resolvedConflicts": 1,
      "totalDuration": 7200000,
      "totalModifiedFiles": 12
    }
  }
}
```

#### Worktree 历史记录

```typescript
class WorktreeHistoryTracker {
  // 记录 Worktree 创建
  async recordCreation(worktree: Worktree): Promise<void> {
    const entry = {
      event: 'created',
      timestamp: new Date(),
      worktree
    }
    await this.addToHistory(worktree.taskId, worktree.subtaskId, entry)
  }
  
  // 记录 Worktree 修改
  async recordModification(
    worktree: Worktree, 
    modifiedFiles: string[]
  ): Promise<void> {
    const entry = {
      event: 'modified',
      timestamp: new Date(),
      worktree,
      modifiedFiles,
      diff: await this.generateDiff(worktree.worktreePath)
    }
    await this.addToHistory(worktree.taskId, worktree.subtaskId, entry)
  }
  
  // 记录 Worktree 合并
  async recordMerge(
    worktree: Worktree, 
    mergeResult: MergeResult
  ): Promise<void> {
    const entry = {
      event: 'merged',
      timestamp: new Date(),
      worktree,
      mergeResult
    }
    await this.addToHistory(worktree.taskId, worktree.subtaskId, entry)
  }
  
  // 记录 Worktree 删除
  async recordRemoval(worktree: Worktree): Promise<void> {
    const entry = {
      event: 'removed',
      timestamp: new Date(),
      worktree
    }
    await this.addToHistory(worktree.taskId, worktree.subtaskId, entry)
  }
  
  // 生成 Diff
  private async generateDiff(worktreePath: string): Promise<string> {
    const { stdout } = await execGit(['diff', 'main'], worktreePath)
    return stdout
  }
  
  // 添加到历史
  private async addToHistory(
    taskId: string, 
    subtaskId: string, 
    entry: HistoryEntry
  ): Promise<void> {
    const historyFile = `.stigmergy/coordination/history/${taskId}/${subtaskId}.json`
    const history = await this.loadHistory(historyFile)
    history.push(entry)
    await fs.writeFile(historyFile, JSON.stringify(history, null, 2))
  }
}
```

### 3.4 可追溯性功能

#### 任务执行时间线

```typescript
async function generateTaskTimeline(taskId: string): Promise<Timeline> {
  // 1. 查询所有相关事件
  const eventLog = new EventLogQuery('.stigmergy/coordination/event-log.json')
  const events = await eventLog.queryByTaskId(taskId)
  
  // 2. 按时间排序
  events.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
  
  // 3. 生成时间线
  const timeline: TimelineEvent[] = events.map(event => ({
    time: new Date(event.timestamp),
    event: event.event,
    component: event.component,
    data: event.data,
    duration: calculateDuration(event)
  }))
  
  return { taskId, timeline }
}

// 时间线示例
{
  "taskId": "task-1234567890",
  "timeline": [
    {
      "time": "2026-01-13T10:00:00.000Z",
      "event": "task.created",
      "component": "orchestrator",
      "data": { "taskId": "task-1234567890", "description": "实现电商系统" },
      "duration": 0
    },
    {
      "time": "2026-01-13T10:00:01.000Z",
      "event": "worktree.created",
      "component": "worktree-manager",
      "data": { "subtaskId": "subtask-1", "cli": "claude" },
      "duration": 1000
    },
    {
      "time": "2026-01-13T10:00:02.000Z",
      "event": "terminal.started",
      "component": "terminal-manager",
      "data": { "subtaskId": "subtask-1", "cli": "claude" },
      "duration": 1000
    },
    {
      "time": "2026-01-13T10:30:00.000Z",
      "event": "terminal.completed",
      "component": "terminal-manager",
      "data": { "subtaskId": "subtask-1", "duration": 1800000 },
      "duration": 1798000
    },
    {
      "time": "2026-01-13T10:30:01.000Z",
      "event": "worktree.merged",
      "component": "worktree-manager",
      "data": { "subtaskId": "subtask-1", "conflicts": 0 },
      "duration": 1000
    }
  ]
}
```

#### 文件修改历史

```typescript
async function getFileHistory(filePath: string): Promise<FileHistory> {
  // 1. 查询所有 Worktree 记录
  const registry = await loadWorktreeRegistry()
  
  // 2. 筛选修改过该文件的 Worktree
  const worktrees = Object.values(registry)
    .filter(task => 
      Object.values(task.worktrees).some(wt =>
        wt.modifiedFiles.includes(filePath)
      )
    )
  
  // 3. 生成修改历史
  const history: FileModification[] = []
  
  for (const task of worktrees) {
    for (const worktree of Object.values(task.worktrees)) {
      if (worktree.modifiedFiles.includes(filePath)) {
        history.push({
          taskId: task.taskId,
          subtaskId: worktree.subtaskId,
          cli: worktree.cli,
          agent: worktree.agent,
          timestamp: worktree.createdAt,
          worktreePath: worktree.worktreePath,
          branch: worktree.branch,
          status: worktree.status
        })
      }
    }
  }
  
  // 4. 按时间排序
  history.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
  
  return { filePath, history }
}
```

#### 审计报告

```typescript
async function generateAuditReport(taskId: string): Promise<AuditReport> {
  // 1. 获取任务信息
  const task = await getTaskInfo(taskId)
  
  // 2. 获取事件日志
  const eventLog = new EventLogQuery('.stigmergy/coordination/event-log.json')
  const events = await eventLog.queryByTaskId(taskId)
  
  // 3. 获取 Worktree 记录
  const worktrees = await getWorktreesForTask(taskId)
  
  // 4. 统计信息
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
  
  // 5. 生成报告
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

### 3.5 追踪命令

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

## 4. 总结

这三个核心概念共同构成了一个强大的编排系统：

### 4.1 事件驱动架构（EventBus）
- **实时监控**：通过事件订阅实现实时的状态更新
- **松耦合**：组件之间通过事件通信，降低耦合度
- **可扩展**：易于添加新的事件类型和处理器
- **可追溯**：所有事件都被记录，支持审计和调试

### 4.2 智能合并策略
- **自动化**：自动处理大部分合并冲突
- **灵活性**：支持多种合并策略（squash、merge、selective）
- **智能化**：根据冲突类型自动选择解决方法
- **可控性**：提供手动干预的选项

### 4.3 完整追踪系统
- **全面性**：记录所有操作和状态变化
- **可追溯**：支持任务时间线、文件修改历史、审计报告
- **可查询**：提供多种查询方式（按任务、时间、组件等）
- **可审计**：支持完整的审计和合规要求

这三个概念相互配合，实现了一个高效、可靠、可追溯的多智能体编排系统！