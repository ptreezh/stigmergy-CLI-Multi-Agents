# 持续协同系统设计文档

## 1. 文档信息

| 项目 | 内容 |
|------|------|
| 文档名称 | 持续协同系统设计文档 |
| 文档版本 | 1.0.0 |
| 创建日期 | 2026-01-14 |
| 作者 | Stigmergy Team |
| 状态 | 草稿 |

## 2. 系统架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                        User Interface Layer                         │
│                     (用户界面层)                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ CLI Command  │  │ Web UI       │  │ API          │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Stigmergy Orchestrator                          │
│                    (Stigmergy 任务编排器)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Goal Manager │  │ Task Manager │  │ Event Bus    │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Hook System  │  │ State Sync    │  │ Protocol     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Task Router  │  │ Dispatcher    │  │ Monitor      │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Communication Layer                               │
│                    (通信层)                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ File System  │  │ Memory System│  │ Hook Channel │              │
│  │  Channel     │  │  Channel     │  │              │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Shared       │  │ Event        │  │ State        │              │
│  │ Context      │  │ Channel      │  │ Channel      │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      CLI Tools Layer                               │
│                    (CLI 工具层)                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │  Claude  │  │   Qwen   │  │   iFlow  │  │  Codex   │          │
│  │  Agent   │  │  Agent   │  │  Agent   │  │  Agent   │          │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
│  ┌──────────┐  ┌──────────┐                                          │
│  │CodeBuddy │  │ QoderCLI │                                          │
│  │  Agent   │  │  Agent   │                                          │
│  └──────────┘  └──────────┘                                          │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 核心组件设计

#### 2.2.1 Goal Manager (目标管理器)

**职责**：
- 管理用户定义的目标
- 追踪目标状态
- 验证目标达成条件

**接口**：
```typescript
interface GoalManager {
  createGoal(goal: Goal): Promise<string>;
  updateGoal(goalId: string, updates: Partial<Goal>): Promise<void>;
  getGoal(goalId: string): Promise<Goal>;
  listGoals(): Promise<Goal[]>;
  checkGoalCompletion(goalId: string): Promise<boolean>;
}

interface Goal {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  conditions: GoalCondition[];
  tasks: string[]; // task IDs
  createdAt: Date;
  updatedAt: Date;
}

interface GoalCondition {
  type: 'all_tasks_completed' | 'specific_task_completed' | 'custom';
  description: string;
  check: () => Promise<boolean>;
}
```

**实现要点**：
- 使用文件系统持久化目标数据
- 定期检查目标达成条件
- 支持自定义条件检查函数

#### 2.2.2 Task Manager (任务管理器)

**职责**：
- 管理任务生命周期
- 分配任务给 CLI 工具
- 追踪任务状态
- 处理任务重试

**接口**：
```typescript
interface TaskManager {
  createTask(task: Task): Promise<string>;
  updateTask(taskId: string, updates: Partial<Task>): Promise<void>;
  getTask(taskId: string): Promise<Task>;
  listTasks(filters?: TaskFilters): Promise<Task[]>;
  assignTask(taskId: string, cliTool: string): Promise<void>;
  completeTask(taskId: string, result: TaskResult): Promise<void>;
  failTask(taskId: string, error: Error): Promise<void>;
  retryTask(taskId: string): Promise<void>;
}

interface Task {
  id: string;
  name: string;
  description: string;
  type: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string | null; // CLI tool name
  dependencies: string[]; // task IDs
  context: TaskContext;
  instructions: string;
  inputFiles: string[];
  outputFiles: string[];
  canDispatch: boolean;
  dispatchTargets: string[]; // CLI tool names
  createdAt: Date;
  updatedAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  retryCount: number;
  maxRetries: number;
}

interface TaskContext {
  projectPath: string;
  workingDirectory: string;
  environment: Record<string, string>;
  sharedData: Record<string, any>;
}

interface TaskResult {
  success: boolean;
  output: any;
  error?: Error;
  metrics: TaskMetrics;
}

interface TaskMetrics {
  executionTime: number;
  resourceUsage: Record<string, number>;
}
```

**实现要点**：
- 使用优先级队列管理任务
- 支持任务依赖关系检查
- 实现任务重试机制
- 提供任务状态实时查询

#### 2.2.3 Event Bus (事件总线)

**职责**：
- 发布和订阅事件
- 管理事件处理器
- 记录事件历史

**接口**：
```typescript
interface EventBus {
  publish(event: Event): Promise<void>;
  subscribe(eventType: string, handler: EventHandler): string;
  unsubscribe(subscriptionId: string): void;
  getHistory(filters?: EventFilters): Promise<Event[]>;
}

interface Event {
  id: string;
  type: string;
  source: string; // CLI tool name or system
  data: any;
  timestamp: Date;
}

type EventHandler = (event: Event) => Promise<void> | void;

interface EventFilters {
  eventType?: string;
  source?: string;
  startTime?: Date;
  endTime?: Date;
}
```

**实现要点**：
- 使用文件系统作为事件存储
- 支持事件持久化
- 提供事件历史查询
- 支持事件处理器注册和注销

**事件类型定义**：
```typescript
enum EventType {
  // 任务事件
  TASK_CREATED = 'task.created',
  TASK_ASSIGNED = 'task.assigned',
  TASK_STARTED = 'task.started',
  TASK_COMPLETED = 'task.completed',
  TASK_FAILED = 'task.failed',
  
  // 派发事件
  TASK_DISPATCHED = 'task.dispatched',
  TASK_RECEIVED = 'task.received',
  
  // 目标事件
  GOAL_CREATED = 'goal.created',
  GOAL_UPDATED = 'goal.updated',
  GOAL_COMPLETED = 'goal.completed',
  GOAL_FAILED = 'goal.failed',
  
  // 系统事件
  SYSTEM_STARTED = 'system.started',
  SYSTEM_STOPPED = 'system.stopped',
  SYSTEM_ERROR = 'system.error',
}
```

#### 2.2.4 Hook System (钩子系统)

**职责**：
- 管理钩子注册
- 触发钩子执行
- 管理钩子生命周期

**接口**：
```typescript
interface HookSystem {
  registerHook(hook: Hook): string;
  unregisterHook(hookId: string): void;
  triggerHook(hookType: HookType, context: HookContext): Promise<void>;
  listHooks(filters?: HookFilters): Promise<Hook[]>;
}

interface Hook {
  id: string;
  name: string;
  type: HookType;
  description: string;
  target: string; // CLI tool name or 'all'
  condition: (context: HookContext) => boolean;
  action: (context: HookContext) => Promise<void>;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum HookType {
  STARTUP = 'startup',           // CLI 工具启动时
  TASK_COMPLETED = 'task.completed', // 任务完成时
  TASK_FAILED = 'task.failed',    // 任务失败时
  EVENT_OCCURRED = 'event.occurred', // 事件发生时
  STATE_CHANGED = 'state.changed',   // 状态改变时
  CUSTOM = 'custom',                 // 自定义钩子
}

interface HookContext {
  hookType: HookType;
  source: string;
  timestamp: Date;
  data: any;
}
```

**实现要点**：
- 钩子存储在 CLI 工具的 hooks 目录
- 支持钩子条件判断
- 支持异步钩子执行
- 提供钩子执行日志

#### 2.2.5 State Sync (状态同步)

**职责**：
- 管理系统状态
- 同步状态到所有 CLI 工具
- 处理状态冲突

**接口**：
```typescript
interface StateSync {
  updateState(key: string, value: any): Promise<void>;
  getState(key: string): Promise<any>;
  subscribe(key: string, callback: StateCallback): string;
  unsubscribe(subscriptionId: string): void;
  broadcastState(): Promise<void>;
}

interface SystemState {
  goals: Record<string, Goal>;
  tasks: Record<string, Task>;
  events: Event[];
  hooks: Record<string, Hook>;
  metrics: SystemMetrics;
}

interface SystemMetrics {
  totalGoals: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  activeTasks: number;
  cliTools: string[];
}

type StateCallback = (key: string, oldValue: any, newValue: any) => void;
```

**实现要点**：
- 使用文件系统作为状态存储
- 实现状态版本控制
- 支持状态订阅和通知
- 实现冲突解决策略

#### 2.2.6 Protocol (协议层)

**职责**：
- 定义任务派发协议
- 定义事件通信协议
- 定义状态同步协议

**协议定义**：

**任务派发协议**：
```typescript
interface TaskDispatchProtocol {
  protocol: 'task-dispatch';
  version: '1.0.0';
  timestamp: string;
  dispatcher: string; // CLI tool name
  recipient: string; // CLI tool name
  task: Task;
  context: DispatchContext;
  signature: string;
}

interface DispatchContext {
  sourceTaskId: string;
  relatedEvents: string[];
  sharedData: Record<string, any>;
}
```

**事件通信协议**：
```typescript
interface EventCommunicationProtocol {
  protocol: 'event-communication';
  version: '1.0.0';
  event: Event;
  recipients: string[]; // CLI tool names
  deliveryMode: 'broadcast' | 'unicast' | 'multicast';
  priority: 'low' | 'medium' | 'high';
}
```

**状态同步协议**：
```typescript
interface StateSyncProtocol {
  protocol: 'state-sync';
  version: '1.0.0';
  timestamp: string;
  source: string;
  stateChanges: StateChange[];
  version: number;
}

interface StateChange {
  key: string;
  oldValue: any;
  newValue: any;
  operation: 'create' | 'update' | 'delete';
}
```

### 2.3 数据流设计

#### 2.3.1 任务执行流程

```
┌─────────────┐
│ Goal Manager│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Task Manager│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Task Router │
└──────┬──────┘
       │
       ├─→ File System Channel
       │    └─→ tasks/task-001.json
       │
       ├─→ Memory System Channel
       │    └─→ ~/.claude/project-task-001.json
       │
       └─→ Hook Channel
            └─→ ~/.claude/hooks/startup-task-001.js
```

#### 2.3.2 事件触发流程

```
┌─────────────┐
│   Task      │
│  Completed  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Event Bus  │
└──────┬──────┘
       │
       ├─→ Event: task.completed
       │
       ├─→ Handler 1: Check if new tasks needed
       │
       ├─→ Handler 2: Update goal status
       │
       └─→ Handler 3: Notify other CLI tools
```

#### 2.3.3 任务派发流程

```
┌─────────────┐
│   CLI Tool  │
│  (Claude)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Dispatcher │
└──────┬──────┘
       │
       ├─→ File System Channel
       │    └─→ tasks/task-002.json
       │
       ├─→ Memory System Channel
       │    └─→ ~/.qwen/project-task-002.json
       │
       └─→ Hook Channel
            └─→ ~/.qwen/hooks/task-received-002.js
```

### 2.4 通信机制设计

#### 2.4.1 文件系统通道

**用途**：持久化任务、事件、状态数据

**文件结构**：
```
stigmergy-workspace/
├── goals/                    # 目标目录
│   ├── goal-001.json
│   └── index.json
├── tasks/                    # 任务目录
│   ├── task-001.json
│   ├── task-002.json
│   └── index.json
├── events/                   # 事件目录
│   ├── event-001.json
│   └── index.json
├── state/                    # 状态目录
│   ├── current.json
│   └── history.json
├── hooks/                    # 钩子目录
│   ├── startup/
│   ├── task-completed/
│   └── custom/
└── context/                  # 上下文目录
    ├── global.md
    └── task-001.md
```

#### 2.4.2 记忆系统通道

**用途**：CLI 工具的本地存储

**文件结构**：
```
~/.claude/
├── projects/
│   ├── stigmergy-goal-001.json
│   └── stigmergy-task-001.json
├── todos/
│   └── stigmergy-task-001.json
├── sessions/
│   └── stigmergy-task-001.json
└── hooks/
    ├── startup-stigmergy.js
    └── task-completed-stigmergy.js
```

#### 2.4.3 钩子通道

**用途**：触发 CLI 工具的自动执行

**钩子类型**：
1. **启动钩子**：CLI 工具启动时执行
2. **任务完成钩子**：任务完成时执行
3. **事件钩子**：特定事件发生时执行
4. **状态改变钩子**：状态改变时执行

### 2.5 状态管理设计

#### 2.5.1 任务状态机

```
┌─────────┐
│ pending │
└────┬────┘
     │ assign
     ▼
┌─────────┐
│ assigned│
└────┬────┘
     │ start
     ▼
┌─────────┐
│in_progress│
└────┬────┘
     │
     ├─→ complete → ┌──────────┐
     │               │ completed │
     │               └──────────┘
     │
     └─→ fail → ┌──────────┐
                    │  failed   │
                    └─────┬────┘
                          │ retry
                          └────→ pending
```

#### 2.5.2 目标状态机

```
┌─────────┐
│ pending │
└────┬────┘
     │ start
     ▼
┌───────────┐
│in_progress│
└─────┬─────┘
      │
      ├─→ complete → ┌──────────┐
      │               │ completed │
      │               └──────────┘
      │
      └─→ fail → ┌──────────┐
                     │  failed   │
                     └──────────┘
```

### 2.6 并发控制设计

#### 2.6.1 任务并发执行

**策略**：
- 支持任务并行执行（无依赖的任务）
- 支持任务串行执行（有依赖的任务）
- 使用依赖图管理任务执行顺序

**实现**：
```typescript
class TaskScheduler {
  async schedule(tasks: Task[]): Promise<void> {
    // 构建依赖图
    const dependencyGraph = this.buildDependencyGraph(tasks);
    
    // 拓扑排序
    const sortedTasks = this.topologicalSort(dependencyGraph);
    
    // 分层执行
    for (const layer of sortedTasks) {
      await Promise.all(layer.map(task => this.executeTask(task)));
    }
  }
  
  private buildDependencyGraph(tasks: Task[]): Map<string, string[]> {
    const graph = new Map();
    for (const task of tasks) {
      graph.set(task.id, task.dependencies);
    }
    return graph;
  }
  
  private topologicalSort(graph: Map<string, string[]>): Task[][] {
    // 实现拓扑排序算法
    // 返回分层任务列表
  }
}
```

#### 2.6.2 资源限制

**策略**：
- 限制每个 CLI 工具的最大并发任务数
- 使用优先级队列管理任务
- 实现任务超时和取消机制

**实现**：
```typescript
class ResourceLimiter {
  private maxConcurrentTasks: Map<string, number> = new Map();
  private currentTasks: Map<string, number> = new Map();
  
  canExecute(cliTool: string): boolean {
    const max = this.maxConcurrentTasks.get(cliTool) || 1;
    const current = this.currentTasks.get(cliTool) || 0;
    return current < max;
  }
  
  acquire(cliTool: string): void {
    const current = this.currentTasks.get(cliTool) || 0;
    this.currentTasks.set(cliTool, current + 1);
  }
  
  release(cliTool: string): void {
    const current = this.currentTasks.get(cliTool) || 0;
    this.currentTasks.set(cliTool, Math.max(0, current - 1));
  }
}
```

### 2.7 错误处理设计

#### 2.7.1 任务错误处理

**策略**：
- 自动重试失败的任务
- 记录错误日志
- 通知用户关键错误

**实现**：
```typescript
class TaskErrorHandler {
  async handleError(task: Task, error: Error): Promise<void> {
    // 记录错误
    this.logError(task, error);
    
    // 检查重试次数
    if (task.retryCount < task.maxRetries) {
      // 重试任务
      await this.retryTask(task);
    } else {
      // 标记任务失败
      await this.failTask(task, error);
      
      // 通知用户
      await this.notifyUser(task, error);
    }
  }
  
  private async retryTask(task: Task): Promise<void> {
    task.retryCount++;
    task.status = 'pending';
    await this.taskManager.updateTask(task.id, task);
  }
  
  private async failTask(task: Task, error: Error): Promise<void> {
    task.status = 'failed';
    task.error = error;
    await this.taskManager.updateTask(task.id, task);
  }
}
```

#### 2.7.2 系统错误处理

**策略**：
- 实现系统健康检查
- 自动恢复机制
- 故障转移

**实现**：
```typescript
class SystemErrorHandler {
  async handleSystemError(error: Error): Promise<void> {
    // 记录错误
    this.logError(error);
    
    // 检查错误类型
    if (this.isRecoverable(error)) {
      // 尝试恢复
      await this.recover(error);
    } else {
      // 通知用户
      await this.notifyUser(error);
      
      // 停止系统
      await this.stopSystem();
    }
  }
  
  private isRecoverable(error: Error): boolean {
    // 判断错误是否可恢复
    return false;
  }
  
  private async recover(error: Error): Promise<void> {
    // 实现恢复逻辑
  }
}
```

### 2.8 性能优化设计

#### 2.8.1 缓存机制

**策略**：
- 缓存任务状态
- 缓存事件历史
- 缓存系统状态

**实现**：
```typescript
class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  
  get(key: string): any {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // 检查是否过期
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }
  
  set(key: string, value: any, ttl: number = 60000): void {
    const entry: CacheEntry = {
      key,
      value,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttl,
    };
    this.cache.set(key, entry);
  }
  
  invalidate(key: string): void {
    this.cache.delete(key);
  }
}

interface CacheEntry {
  key: string;
  value: any;
  createdAt: number;
  expiresAt: number;
}
```

#### 2.8.2 批处理机制

**策略**：
- 批量读取文件
- 批量写入文件
- 批量处理事件

**实现**：
```typescript
class BatchProcessor {
  private queue: Array<() => Promise<void>> = [];
  private processing: boolean = false;
  
  async add(operation: () => Promise<void>): Promise<void> {
    this.queue.push(operation);
    
    if (!this.processing) {
      await this.process();
    }
  }
  
  private async process(): Promise<void> {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, 100); // 每批处理100个
      await Promise.all(batch.map(op => op()));
    }
    
    this.processing = false;
  }
}
```

## 3. 安全设计

### 3.1 访问控制

**策略**：
- 基于角色的访问控制（RBAC）
- 任务派发权限验证
- 事件发布权限验证

**实现**：
```typescript
class AccessController {
  private permissions: Map<string, string[]> = new Map();
  
  hasPermission(cliTool: string, action: string): boolean {
    const permissions = this.permissions.get(cliTool) || [];
    return permissions.includes(action);
  }
  
  grantPermission(cliTool: string, action: string): void {
    const permissions = this.permissions.get(cliTool) || [];
    permissions.push(action);
    this.permissions.set(cliTool, permissions);
  }
  
  revokePermission(cliTool: string, action: string): void {
    const permissions = this.permissions.get(cliTool) || [];
    const index = permissions.indexOf(action);
    if (index > -1) {
      permissions.splice(index, 1);
    }
  }
}
```

### 3.2 审计日志

**策略**：
- 记录所有关键操作
- 记录任务派发历史
- 记录事件发布历史

**实现**：
```typescript
class AuditLogger {
  async log(action: AuditAction): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: action.type,
      actor: action.actor,
      target: action.target,
      details: action.details,
    };
    
    // 写入审计日志文件
    await this.writeLog(logEntry);
  }
}

interface AuditAction {
  type: string;
  actor: string;
  target: string;
  details: any;
}
```

## 4. 测试设计

### 4.1 单元测试

**测试范围**：
- Goal Manager 测试
- Task Manager 测试
- Event Bus 测试
- Hook System 测试
- State Sync 测试

### 4.2 集成测试

**测试范围**：
- 任务执行流程测试
- 事件触发流程测试
- 任务派发流程测试
- 状态同步流程测试

### 4.3 端到端测试

**测试场景**：
- 代码分析和文档编写
- 持续集成和部署
- 多 CLI 工具协同

### 4.4 性能测试

**测试指标**：
- 任务派发延迟
- 事件处理延迟
- 状态同步延迟
- 系统吞吐量

### 4.5 可靠性测试

**测试场景**：
- 任务失败重试
- 系统故障恢复
- 网络中断处理
- 数据一致性

## 5. 部署设计

### 5.1 部署架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Production Server                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Stigmergy    │  │ File System  │  │ Monitoring   │      │
│  │ Orchestrator │  │ Storage      │  │ System       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    CLI Tools Servers                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Claude  │  │   Qwen   │  │   iFlow  │  │  Codex   │  │
│  │  Server  │  │  Server  │  │  Server  │  │  Server  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 部署步骤

1. **准备环境**
   - 安装 Node.js
   - 安装必要的 CLI 工具
   - 配置文件系统权限

2. **部署 Stigmergy Orchestrator**
   - 构建项目
   - 部署到服务器
   - 配置环境变量

3. **配置 CLI 工具**
   - 安装 CLI 工具
   - 配置钩子
   - 配置记忆系统

4. **验证部署**
   - 运行测试套件
   - 验证功能正常
   - 监控系统性能

## 6. 监控设计

### 6.1 监控指标

**系统指标**：
- 目标数量
- 任务数量
- 任务成功率
- 平均执行时间
- 系统可用性

**CLI 工具指标**：
- 活跃任务数
- 完成任务数
- 失败任务数
- 平均响应时间

### 6.2 告警规则

**告警条件**：
- 任务失败率 > 10%
- 系统可用性 < 99%
- 平均执行时间 > 预期值
- 磁盘空间 < 10%

### 6.3 日志管理

**日志级别**：
- DEBUG：调试信息
- INFO：一般信息
- WARN：警告信息
- ERROR：错误信息
- FATAL：致命错误

**日志存储**：
- 本地文件系统
- 远程日志服务器
- 日志轮转策略

## 7. 附录

### 7.1 技术栈

- **运行环境**：Node.js 18+
- **数据格式**：JSON
- **通信协议**：自定义协议
- **存储**：文件系统

### 7.2 参考资料

1. Stigmergy CLI Multi-Agents 项目文档
2. 多智能体系统设计模式
3. 事件驱动架构最佳实践

### 7.3 变更历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0.0 | 2026-01-14 | Stigmergy Team | 初始版本 |