# Stigmergy CLI 多智能体编排系统 - 设计文档

## 文档层次结构

本文档位于规范化文档体系的核心文档层。

### 依赖关系
- 依赖: REQUIREMENTS.md
- 被依赖: IMPLEMENTATION.md, CORE_CONCEPTS.md, CONTEXT_MANAGEMENT_DESIGN.md

### 文档用途
定义 Stigmergy CLI 多智能体编排系统的完整设计，包括系统架构、核心模块、数据流和接口设计。

## 相关文档
- [REQUIREMENTS.md](./REQUIREMENTS.md) - 需求文档
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - 实施文档
- [CORE_CONCEPTS.md](./CORE_CONCEPTS.md) - 核心概念
- [CONTEXT_MANAGEMENT_DESIGN.md](./CONTEXT_MANAGEMENT_DESIGN.md) - 上下文管理设计
- [ARCHITECTURE_RIGOROUS_ANALYSIS.md](./ARCHITECTURE_RIGOROUS_ANALYSIS.md) - 架构严格论证
- [DESIGN_SIMPLIFIED.md](./DESIGN_SIMPLIFIED.md) - 简化设计
- [DOCUMENT_RELATIONSHIP_MAP.md](./DOCUMENT_RELATIONSHIP_MAP.md) - 文档关系图
- [CONSISTENCY_CHECK_REPORT.md](./CONSISTENCY_CHECK_REPORT.md) - 一致性检测报告
- [DOCUMENT_CONSTRAINTS.md](./DOCUMENT_CONSTRAINTS.md) - 文档约束和验证规则

## 变更历史

| 版本 | 日期 | 作者 | 变更内容 | 影响范围 |
|------|------|------|---------|---------|
| v1.0 | 2026-01-13 | iFlow CLI | 初始版本 | 所有章节 |

## 1. 系统架构设计

### 1.1 总体架构图
```
┌─────────────────────────────────────────────────────────────────────┐
│                         Stigmergy CLI                             │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │           Main CLI Interface (Node.js)                      │   │
│  │  - Command Parsing                                        │   │
│  │  - User Interaction                                       │   │
│  │  - Result Presentation                                   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │           Orchestration Layer                              │   │
│  │  ┌────────────────────────────────────────────────────┐    │   │
│  │  │  CentralOrchestrator (编排器)                    │    │   │
│  │  │  - Task Planning                                 │    │   │
│  │  │  - Task Decomposition                            │    │   │
│  │  │  - CLI Selection                                │    │   │
│  │  │  - Strategy Determination                         │    │   │
│  │  └────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │           Execution Layer                                 │   │
│  │  ┌────────────────────────────────────────────────────┐    │   │
│  │  │  EnhancedTerminalManager (终端管理器)            │    │   │
│  │  │  - Terminal Launching                            │    │   │
│  │  │  - Terminal Monitoring                           │    │   │
│  │  │  - Output Collection                            │    │    │   │
│  │  └────────────────────────────────────────────────────┘    │   │
│  │  ┌────────────────────────────────────────────────────┐    │   │
│  │  │  GitWorktreeManager (Worktree 管理器)            │    │   │
│  │  │  - Worktree Creation                            │    │   │   │
│  │  │  - Branch Management                             │    │   │
│  │  │  - Worktree Merging                             │    │   │
│  │  │  - Worktree Cleanup                              │    │   │   │
│  │  └────────────────────────────────────────────────────┘    │   │
│  │  ┌────────────────────────────────────────────────────┐    │   │
│  │  │  StateLockManager (状态锁管理器)                 │    │   │
│  │  │  - Lock Acquisition                             │    │   │
│  │  │  - Lock Release                                 │    │   │
│  │  │  - Dependency Checking                           │    │    │
│  │  │  - Deadlock Detection                            │    │   │
│  │  └────────────────────────────────────────────────────┘    │   │
│  │  ┌────────────────────────────────────────────────────┐    │   │
│  │  │  HookSystem (Hook 系统)                           │    │   │
│  │  │  - Task Detection Hook                         │    │
│  │  │  - Lock Acquisition Hook                         │    │
│  │  │  - Lock Release Hook                             │    │
│  │  │  - Conflict Detection Hook                       │    │
│  │  └────────────────────────────────────────────────────┘    │   │
│  │  ┌────────────────────────────────────────────────────┐    │   │
│  │  │  EventBus (事件总线)                              │    │   │
│  │  │  - Event Publishing                              │    │   │
│  │  │  - Event Subscribing                            │    │    │   │
│  │  │  - Event Logging                                │    │    │   │
│  │  └────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │           Coordination Layer (Shared Context)             │   │
│  │  ┌────────────────────────────────────────────────────┐    │   │
│  │  │  ProjectContextManager (上下文管理器)           │    │   │
│  │  │  - Shared Context Files                          │    │   │
│  │  │  - Task Registry                                 │    │   │
│  │  │  - State Locks                                   │    │   │
│  │  │  - Event Log                                     │    │   │
│  │  └────────────────────────────────────────────────────┘    │   │
│  │  ┌────────────────────────────────────────────────────┐    │   │
│  │  │  ResultAggregator (结果聚合器)                  │    │
│  │  │  - Result Collection                            │    │
│  │  │  - Conflict Detection                           │    │
│  │  │  - Summary Generation                          │    │
│  │  │  - Recommendation Generation                     │    │
│  │  └────────────────────────────────────────────────────┘    │   │
│  │  ┌────────────────────────────────────────────────────┐    │   │
│  │  │  ResumeSessionIntegration (ResumeSession 集成)   │    │
│  │  │  - Session State Persistence                   │    │   │   │
│  │  │  - Context Passing                             │    │    │   │
│  │  │  - Interrupt Recovery                            │    │    │   │
│  │  │  - History Recording                             │    │    │   │
│  │  └────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │           CLI Tools (独立终端窗口)                      │   │
│  │  ┌────────────────────────────────────────────────────┐    │   │
│  │  │  Terminal 1: claude --agent oracle              │    │   │
│  │  │  Worktree: .git/worktrees/task-001/subtask-1    │    │   │
│  │  │  Hook: task-detection.js, lock-acquisition.js    │    │   │
│  │  └────────────────────────────────────────────────────┘    │   │
│  │  ┌────────────────────────────────────────────────────┐    │   │
│  │  │  Terminal 2: gemini --agent gemini-pro          │    │   │
│  │  │  Worktree: .git/worktrees/task-001/subtask-2    │    │   │
│  │  │  Hook: task-detection.js, lock-acquisition.js    │    │   │
│  │  └────────────────────────────────────────────────────┘    │   │
│  │  ┌────────────────────────────────────────────────────┐    │   │
│  │  │  Terminal 3: iflow --agent backend            │    │   │
│  │  │  Worktree: .git/worktrees/task-001/subtask-3    │    │    │ │
│  │  │  Hook: task-detection.js, lock-acquisition.js    │    │   │
│  │  └────────────────────────────────────────────────────┘    │   │
│  │  ┌────────────────────────────────────────────────────┐    │   │
│  │  │  Terminal 4: opencode --agent sisyphus          │    │   │
│  │  │  Worktree:   .git/worktrees/task-001/subtask-4  │    │ │
│  │  │  Hook: task-detection.js, lock-acquisition.js    │    │   │
│  │  └────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │           File System (协调目录)                        │   │
│  │  .stigmergy/coordination/                                │   │
│  │  ├── task-registry.json     (任务注册表)                 │   │
│  │  ├── state-locks.json       (状态锁)                    │   │
│  │  ├── event-log.json         (事件日志)                  │   │
│  │  ├── worktree-registry.json (Worktree 注册)            │   │
│  │  └── task-summaries.json    (任务摘要)                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │           Git Repository (共享代码仓库)                    │   │
│  │  .git/worktrees/                                       │   │
│  │  ├── task-001/  (claude 工作目录)                      │   │
│  │  │   ├── (修改的代码文件)                              │   │
│  │  │   └── (独立的会话上下文)                            │   │
│  │  ├── task-002/  (gemini 工作目录)                      │   │   │
│  │  │   ├── (修改的代码文件)                              │   │
│  │  │   └── (独立的会话上下文)                            │   │
│  │  ├── task-003/  (iflow 工作目录)                       │   │
│  │  │   ├── (修改的代码文件)                              │   │
│  │  │   └── (独立的会话上下文)                            │   │
│  │  └── task-004/  (opencode 工作目录)                    │   │
│  │      ├── .stigmergy/coordination/ (协调上下文)            │   │
│  │      └── (修改的代码文件)                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 模块依赖关系

```
CentralOrchestrator
├── TaskRegistry (任务注册)
├── EnhancedTerminalManager (终端管理)
│   ├── GitWorktreeManager (Worktree 管理)
│   └── StateLockManager (状态锁)
│       └── EventBus (事件总线)
├── HookSystem (Hook 系统)
├── ProjectContextManager (上下文管理)
├── ResultAggregator (结果聚合)
└── ResumeSessionIntegration (ResumeSession 集成)
```

## 2. 核心模块设计

### 2.1 CentralOrchestrator（编排器）

**职责**: 任务规划、任务分解、CLI 选择、策略确定

**主要方法**:
```typescript
class CentralOrchestrator {
  // 任务规划
  async planTask(description: string): Promise<TaskPlan>
  
  // 任务分解
  async decomposeTask(task: Task): Promise<SubTask[]>
  
  // CLI 选择
  async selectCLI(subtask: SubTask): Promise<CLISelection>
  
  // 策略确定
  async determineStrategy(task: Task, subtasks: SubTask[]): Promise<ExecutionStrategy>
  
  // 创建编排任务
  async createOrchestrationTask(description: string, strategy: OrchestrationStrategy): Promise<string>
  
  // 监控任务
  async monitorTask(taskId: string): Promise<TaskProgress>
  
  // 聚合结果
  async aggregateResults(taskId: string): Promise<TaskResult>
}
```

**数据结构**:
```typescript
interface Task {
  id: string
  description: string
  type: TaskType
  complexity: 'low' | 'medium' | 'high'
  estimatedDuration: number
  dependencies: string[]
}

interface SubTask {
  id: string
  taskId: string
  description: string
  type: SubTaskType
  priority: 'high' | 'medium' | 'low'
  dependencies: string[]
  requiredSkills: string[]
  requiredAgent: string | null
  mcpTools: string[]
  requiredFiles: string[]
  outputFiles: string[]
  assignedCLI: string | null
}

interface OrchestrationStrategy {
  mode: 'parallel' | 'sequential' | 'hybrid'
  parallelGroups?: ParallelGroup[]
  dependencies: Dependency[]
  concurrencyLimit?: number
}

interface ParallelGroup {
  groupId: string
  tasks: SubTask[]
  mode: 'parallel'
  dependencies: Dependency[]
}
```

### 2.2 EnhancedTerminalManager（终端管理器）

**职责**: 管理多个独立终端窗口

**主要方法**:
```typescript
class EnhancedTerminalManager {
  // 启动多个终端
  async launchTerminalsForTask(task: OrchestratedTask, strategy: OrchestrationStrategy): Promise<TerminalLaunchResult[]>
  
  // 启动单个终端
  async launchTerminalForSubtask(subtask: SubTask, worktree: Worktree, strategy: OrchestrationStrategy): Promise<TerminalLaunchResult>
  
  // 构建CLI命令
  private buildCLICommand(subtask: SubTask, worktree: Worktree): string
  
  // 监控所有终端
  async monitorAllTerminals(): Promise<TerminalStatus[]>
  
  // 等待所有终端完成
  async waitForAllTerminals(terminalIds: string[]): Promise<TerminalResult[]>
  
  // 读取终端输出
  async readTerminalOutput(terminalId: string): Promise<string>
  
  // 终止终端
  async killTerminal(terminalId: string): Promise<void>
  
  // 清理所有终端
  async cleanup(): Promise<void>
}
```

**CLI 参数映射**:
```typescript
const CLI_PARAM_MAPPINGS = {
  claude: {
    agent: (agent: string) => ` --agent ${agent}`,
    skills: (skills: string[]) => ` Bash("stigmergy skill read ${skills[0]}")`,
    mcp: (tools: string[]) => ` --mcp-config .stigmergy/mcp-claude.json`,
    cwd: (cwd: string) => ` --cwd "${cwd}"`
  },
  gemini: {
    agent: (agent: string) => ` --model ${agent}`,
    skills: (skills: string[]) => ` --skills ${skills.join(',')}`,
    mcp: (tools: string[]) => ` --mcp-config .stigmergy/mcp-gemini.json`,
    cwd: (cwd: string) => ` --cwd "${cwd}"`
  },
  iflow: {
    agent: (agent: string) => ` -p "请使用${agent}智能体"`,
    skills: (skills: string[]) => ` -p "请使用${skills.join('、')}技能"`,
    mcp: (tools: string[]) => ` --mcp-config .stigmergy/mcp-iflow.json`,
    cwd: (cwd: string) => ` --cwd "${cwd}"`
  },
  opencode: {
    agent: (agent: string) => ` --agent ${agent}`,
    skills: (skills: string[]) => ` --skills ${skills.join(',')}`,
    mcp: (tools: string[]) => ` --mcp-config .stigmergy/mcp-opencode.json`,
    cwd: (cwd: string) => ` --cwd "${cwd}"`
  }
}
```

### 2.3 GitWorktreeManager（Worktree 管理器）

**职责**: 管理 Git Worktree 的创建、合并和清理

**主要方法**:
```typescript
class GitWorktreeManager {
  // 创建 Worktree
  async create(config: WorktreeConfig): Promise<Worktree>
  
  // 创建分支
  private async createBranch(branchName: string): Promise<void>
  
  // 初始化 Worktree
  private async initializeWorktree(worktreePath: string, config: WorktreeConfig): Promise<void>
  
  // 同步配置文件
  private async syncConfigFiles(worktreePath: string): Promise<void>
  
  // 注册 Worktree 到任务
  async registerForTask(taskId: string, worktrees: Record<string, Worktree>): Promise<void>
  
  // 获取任务的 Worktrees
  async getWorktreesForTask(taskId: string): Promise<Record<string, Worktree>>
  
  // 合并 Worktree
  async mergeWorktree(subtaskId: string, strategy: MergeStrategy): Promise<void>
  
  // 删除 Worktree
  async removeWorktree(subtaskId: string): Promise<void>
  
  // 清理所有 Worktrees
  async cleanupAllWorktrees(): Promise<void>
  
  // 获取所有 Worktrees
  async getAllWorktrees(): Promise<Record<string, Worktree>>
  
  // 执行 Git 命令
  private async execGit(args: string[]): Promise<void>
}
```

**Worktree 目录结构**:
```
.git/
├── worktrees/
│   └── task-1234567890/
│       ├── subtask-1/
│       │   ├── .stigmergy/
│       │   │   ├── coordination/
│       │   │   │   ├── task-registry.json
│       │   │   │   ├── state-locks.json
│       │   │   │   ├── shared-context.json
│       │   │   │   └── event-log.json
│       │   │   └── output/
│       │   ├── (修改的代码文件)
│       │   └── .git/
│       ├── subtask-2/
│       │   └── (类似结构)
│       └── subtask-3/
│           └── (类似结构)
```

### 2.4 StateLockManager（状态锁管理器）

**职责**: 管理状态锁，防止冲突

**主要方法**:
```typescript
class StateLockManager {
  // 初始化任务的状态锁
  async initializeTask(taskId: string, subtasks: SubTask[]): Promise<void>
  
  // 尝试获取锁（原子操作）
  async acquireLock(taskId: string, subtaskId: string, cliName: string): Promise<LockAcquisitionResult>
  
  // 释放锁
  async releaseLock(taskId: string, subtaskId: string, result: SubTaskResult): Promise<void>
  
  // 检查依赖
  private checkDependencies(locks: Record<string, StateLock>, dependencies: string[]): boolean
  
  // 检查文件锁
  private async checkFileLocks(files: string[], currentTaskId: string): Promise<string[]>
  
  // 获取子任务状态
  async getSubtaskStates(taskId: string): Promise<SubtaskState[]>
  
  // 加载锁
  private async loadLocks(taskId: string): Promise<Record<string, StateLock>>
  
  // 保存锁
  private async saveLocks(taskId: string, locks: Record<string, StateLock>): Promise<void>
  
  // 加载所有锁
  private async loadAllLocks(): Promise<Record<string, Record<string, StateLock>>>
  
  // 检测死锁
  async detectDeadlock(): Promise<DeadlockInfo | null>
  
  // 强制释放锁
  async forceReleaseLock(taskId: string, subtaskId: string): Promise<void>
  
  // 清理任务锁
  async cleanup(taskId: string): Promise<void>
}
```

**锁状态机**:
```
pending → in-progress → completed
    ↓           ↓
   failed      error
```

**原子锁操作**:
```typescript
// 使用文件锁实现原子操作
async function atomicLockOperation<T>(
  lockFile: string,
  operation: () => Promise<T>
): Promise<T> {
  // 1. 创建临时锁文件
  const tempLockFile = `${lockFile}.lock`
  
  // 2. 尝试创建临时锁文件（原子操作）
  try {
    await fs.writeFile(tempLockFile, Date.now().toString(), {
      flag: 'wx' // 独占创建，如果文件已存在则失败
    })
  } catch (error) {
    throw new Error('Lock is held by another process')
  }
  
  try {
    // 3. 执行操作
    const result = await operation()
    
    // 4. 删除临时锁文件
    await fs.unlink(tempLockFile)
    
    return result
  } catch (error) {
    // 5. 即使操作失败，也要删除锁文件
    await fs.unlink(tempLockFile)
    throw error
  }
}
```

### 2.5 HookSystem（Hook 系统）

**职责**: 为各 CLI 安装协调 Hook

**主要方法**:
```typescript
class HookSystem {
  // 为 CLI 安装协调 Hook
  async installCoordinationHooks(cliName: string): Promise<void>
  
  // 安装任务检测 Hook
  private async installTaskDetectionHook(cliName: string, hooksDir: string): Promise<void>
  
  // 安装锁获取 Hook
  private async installLockAcquisitionHook(cliName: string, hooksDir: string): Promise<void>
  
  // 安装锁释放 Hook
  private async installLockReleaseHook(cliName: string, hooksDir: string): Promise<void>
  
  // 安装冲突检测 Hook
  private async installConflictDetectionHook(cliName: string, hooks: string): Promise<void>

  
  // 更新 CLI 配置
  private async updateCLIConfiguration(cliName: string, hooksDir: string): Promise<void>
  
  // 生成任务检测 Hook
  private generateTaskDetectionHook(cliName: string): string
  
  // 生成锁获取 Hook
  private generateLockAcquisitionHook(cliName: string): string
  
  // 生成锁释放 Hook
  private generateLockReleaseHook(cliName: string): string
  
  // 生成冲突检测 Hook
  private generateConflictDetectionHook(cliName: string): string
}
```

**Hook 目录结构**:
```
~/.claude/.stigmergy/hooks/
├── task-detection.js        (任务检测)
├── lock-acquisition.js      (锁获取)
├── lock-release.js          (锁释放)
└── conflict-detection.js    (冲突检测)

~/.gemini/.stigmergy/hooks/
├── task-detection.js
├── lock-acquisition.js
├── lock-release.js
└── conflict-detection.js

~/.iflow/.stigmergy/hooks/
├── task-detection.js
├── lock-acquisition.js
├── lock-release.js
└── conflict-detection.js

~/.opencode/.stigmergy/hooks/
├── task-detection.js
├── lock-acquisition.js
├── lock-release.js
└── conflict-detection.js
```

### 2.6 ResumeSessionIntegration（ResumeSession 集成）

**职责**: 集成 ResumeSession 功能（任务级上下文管理）

**主要方法**:
```typescript
class ResumeSessionIntegration {
  // 保存任务状态
  async saveTaskState(taskId: string, task: OrchestratedTask): Promise<void>
  
  // 恢复任务状态
  async restoreTaskState(taskId: string): Promise<OrchestratedTask | null>
  
  // 传递最小化上下文到子任务
  async passMinimalContextToSubtask(taskId: string, subtaskId: string, context: MinimalContext): Promise<void>
  
  // 收集子任务结果摘要
  async collectSubtaskResultSummary(taskId: string, subtaskId: string): Promise<ResultSummary>
  
  // 记录历史
  async recordHistory(taskId: string, event: HistoryEvent): Promise<void>
  
  // 查询历史
  async queryHistory(taskId: string): Promise<HistoryEvent[]>
  
  // 生成恢复命令
  async generateResumeCommand(taskId: string): Promise<string>
}
```

**ResumeSession 在编排中的作用**（基于 Worktree 隔离）:

1. **任务级状态持久化**:
   - 保存编排任务状态（任务 ID、描述、状态）
   - 保存子任务状态（子任务 ID、状态、worktree 路径）
   - 保存 Worktree 信息（分支、路径、修改的文件）
   - 不保存实时的工作上下文

2. **最小化上下文传递**:
   - 只传递任务描述和约束
   - 只传递依赖关系的任务 ID（不传递详细内容）
   - 传递 worktree 路径和必需文件列表
   - 传递输出文件列表
   - 不传递实时的工作状态或详细上下文

3. **中断恢复**:
   - 检测中断的任务
   - 恢复任务状态和 Worktree 状态
   - 重新启动终端并恢复到中断点
   - 继续执行（从上次中断的地方开始）

4. **历史记录**:
   - 记录所有编排任务（任务摘要）
   - 记录任务分解（子任务列表和依赖）
   - 记录执行策略（并行、串行、混合）
   - 记录执行结果（成功/失败、输出文件、冲突）

5. **跨会话追踪**:
   - 跟踪任务跨多个会话（通过任务 ID）
   - 提供完整的执行历史（任务摘要）
   - 支持审计和分析（不包含详细上下文）

**关键原则**（基于 Worktree 隔离）:
- ✅ 每个 worktree 有独立的会话上下文
- ✅ 不需要在 CLI 之间传递实时上下文
- ✅ 只传递任务级别的最小化上下文
- ✅ 通过 Git 合并共享结果
- ✅ 通过状态锁协调对共享文件的访问

### 2.7 EventBus（事件总线）

**职责**: 事件发布和订阅

**主要方法**:
```typescript
class EventBus {
  // 发布事件
  async publish(event: Event): Promise<void>
  
  // 订阅事件
  subscribe(eventType: string, handler: EventHandler): void
  
  // 取消订阅
  unsubscribe(eventType: string, handler: EventHandler): void
  
  // 启动监听
  async startListening(): Promise<void>
  
  // 停止监听
  stopListening(): void
  
  // 获取事件日志
  async getEventLog(since?: Date): Promise<Event[]>
  
  // 清除事件日志
  async clearEventLog(): Promise<void>
}
```

**事件类型**:
```typescript
type EventType = 
  | 'task.created'
  | 'task.started'
  | 'task.completed'
  | 'task.failed'
  | 'lock.acquired'
  | 'lock.released'
  | 'lock.failed'
  | 'worktree.created'
  | 'worktree.merged'
  | 'worktree.removed'
  | 'terminal.started'
  | 'terminal.completed'
  | 'terminal.failed'
  | 'conflict.detected'
  | 'error.occurred'
```

### 2.8 TaskPlanningFiles（三文件系统）

**职责**: 管理任务级别的三文件系统（task_plan.md, findings.md, progress.md）

**核心思想**: 将文件系统作为"磁盘上的工作记忆"（Persistent Working Memory on Disk），解决上下文爆炸问题

**主要方法**:
```typescript
class TaskPlanningFiles {
  // 初始化任务的三文件系统
  async initializeTask(taskId: string, description: string, worktreePath: string): Promise<TaskPlanningFiles>
  
  // 更新任务规划文件
  async updateTaskPlan(taskId: string, updates: TaskPlanUpdate): Promise<void>
  
  // 添加研究发现
  async addFinding(taskId: string, finding: Finding): Promise<void>
  
  // 记录进度
  async recordProgress(taskId: string, progress: ProgressEntry): Promise<void>
  
  // 记录错误
  async recordError(taskId: string, error: ErrorEntry): Promise<void>
  
  // 更新阶段状态
  async updatePhaseStatus(taskId: string, phase: string, status: PhaseStatus): Promise<void>
  
  // 读取任务规划
  async readTaskPlan(taskId: string): Promise<TaskPlan>
  
  // 读取研究发现
  async readFindings(taskId: string): Promise<Findings>
  
  // 读取进度日志
  async readProgress(taskId: string): Promise<Progress>
  
  // 恢复任务状态（用于中断恢复）
  async restoreTaskState(taskId: string): Promise<TaskState>
  
  // 清理或归档三文件系统
  async cleanup(taskId: string, archive: boolean): Promise<void>
}
```

**三文件结构**:

#### 1. task_plan.md（任务规划文件）
```markdown
# Task Plan: [Brief Description]

## Goal
[One sentence describing the end state]

## Current Phase
Phase 1

## Phases

### Phase 1: Requirements & Discovery
- [ ] Understand user intent
- [ ] Identify constraints and requirements
- [ ] Document findings in findings.md
- **Status:** in_progress

### Phase 2: Planning & Structure
- [ ] Define technical approach
- [ ] Create project structure if needed
- [ ] Document decisions with rationale
- **Status:** pending

### Phase 3: Implementation
- [ ] Execute the plan step by step
- [ ] Write code to files before executing
- [ ] Test incrementally
- **Status:** pending

### Phase 4: Testing & Verification
- [ ] Verify all requirements met
- [ ] Document test results in progress.md
- [ ] Fix any issues found
- **Status:** pending

### Phase 5: Delivery
- [ ] Review all output files
- [ ] Ensure deliverables are complete
- [ ] Deliver to user
- **Status:** pending

## Key Questions
1. [Question to answer]
2. [Question to answer]

## Decisions Made
| Decision | Rationale |
|----------|-----------|
|          |           |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
|       | 1       |            |

## Notes
- Update phase status as you progress: pending → in_progress → complete
- Re-read this plan before major decisions (attention manipulation)
- Log ALL errors - they help avoid repetition
```

#### 2. findings.md（研究发现文件）
```markdown
# Findings & Decisions

## Requirements
<!-- Captured from user request -->
-

## Research Findings
<!-- Key discoveries during exploration -->
-

## Technical Decisions
<!-- Decisions made with rationale -->
| Decision | Rationale |
|----------|-----------|
|          |           |

## Issues Encountered
<!-- Errors and how they were resolved -->
| Issue | Resolution |
|-------|------------|
|       |            |

## Resources
<!-- URLs, file paths, API references -->
-

## Visual/Browser Findings
<!-- CRITICAL: Update after every 2 view/browser operations -->
<!-- Multimodal content must be captured as text immediately -->
-

---
*Update this file after every 2 view/browser/search operations*
*This prevents visual information from being lost*
```

#### 3. progress.md（进度日志文件）
```markdown
# Progress Log

## Session: [DATE]

### Phase 1: [Title]
- **Status:** in_progress
- **Started:** [timestamp]
- Actions taken:
  -
- Files created/modified:
  -

### Phase 2: [Title]
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

<!-- Keep ALL errors - they help avoid repetition -->
| Timestamp | Error | Attempt | Resolution |
|-----------|-------|---------|------------|
|           |       | 1       |            |

## 5-Question Reboot Check
<!-- If you can answer these, context is solid -->
| Question | Answer |
|----------|--------|
| Where am I? | Phase X |
| Where am I going? | Remaining phases |
| What's the goal? | [goal statement] |
| What have I learned? | See findings.md |
| What have I done? | See above |

---
*Update after completing each phase or encountering errors*
```

**三文件系统在编排中的作用**:

1. **解决上下文爆炸**:
   - 将重要信息持久化到文件系统
   - 上下文保持小而清晰
   - 只在需要时读取文件

2. **防止信息丢失**:
   - 立即保存多模态信息（图片、PDF、浏览器数据）
   - 建立可追溯的知识库
   - 防止视觉信息丢失

3. **防止重复失败**:
   - 记录所有错误到 task_plan.md
   - 跟踪尝试次数
   - 改变方法，避免重复

4. **支持中断恢复**:
   - task_plan.md 显示当前阶段
   - findings.md 显示已有发现
   - progress.md 显示已完成的工作
   - 可以快速恢复到中断点

5. **支持动态智能体**:
   - 智能体使用三文件系统记录工作
   - 智能体配置可以包含在 task_plan.md 中
   - 智能体的学习和发现可以记录在 findings.md 中

**与 Worktree 隔离的集成**:

- 每个 worktree 有独立的三文件系统
- 不需要在 CLI 之间共享三文件系统
- 每个 worktree 独立记录自己的进度
- 通过 Git 合并共享结果摘要
- 通过事件总线通知状态变化

**与 ResumeSession 的集成**:

- ResumeSession 保存三文件系统
- 中断恢复时读取三文件系统
- 基于三文件系统生成历史记录
- 快速恢复到中断点

**关键规则**:

1. **先创建计划再执行** - 永不开始复杂任务前不创建 task_plan.md
2. **2-Action 规则** - 每次查看/浏览/搜索后立即保存发现
3. **决策前重读计划** - 保持目标在注意力窗口中
4. **阶段后更新状态** - 标记完成，记录错误
5. **记录所有错误** - 建立知识库，避免重复
6. **永不重复失败** - 跟踪尝试，改变方法
7. **3次失败升级** - 尝试3次后升级到用户

**预期效果**:

| 指标 | 改进 |
|------|------|
| 上下文大小 | 减少 95% |
| 信息丢失率 | 减少 90% |
| 重复失败率 | 减少 80% |
| 中断恢复时间 | 减少 70% |
| 可追溯性 | 提升 100% |

## 3. 数据流设计

### 3.1 任务执行流程

```
用户输入
    ↓
CentralOrchestrator.planTask()
    ↓
CentralOrchestrator.decomposeTask()
    ↓
CentralOrchestrator.selectCLI()
    ↓
CentralOrctrator.determineStrategy()
    ↓
CentralOrchestrator.createOrchestrationTask()
    ↓
GitWorktreeManager.createWorktreesForTask()
    ↓
EnhancedTerminalManager.launchTerminalsForTask()
    ↓
┌─────────────────────────────────────────────────────────┐
│                     并发执行阶段                              │
├─────────────────────────────────────────────────────────┤
│  Terminal 1 (claude)  │  Terminal 2 (gemini)  │  Terminal 3 (iflow)  │
│  ├─ Hook: task-detection.js  │  ├─ Hook: task-detection.js  │  ├─ Hook: task-detection.js  │
│  ├─ Hook: lock-acquisition.js│  ├─ Hook: lock-acquisition.js│  ├─ Hook: lock-acquisition.js│
│  ├─ 执行任务                │  ├─ 执行任务                │  ├─ 执行任务                │
│  ├─ Hook: lock-release.js    │  ├─ Hook: lock-release.js    │  ├─ Hook: lock-release.js    │
│  └─ 保存结果                │  └─ 保存结果                │  └─ 保存结果                │
└─────────────────────────────────────────────────────────┘
    ↓
ResultAggregator.aggregateResults()
    ↓
CentralOrchestrator.aggregateResults()
    ↓
GitWorktreeManager.mergeWorktrees()
    ↓
EnhancedTerminalManager.cleanup()
    ↓
显示最终结果
```

### 3.2 状态锁流程

```
任务开始
    ↓
StateLockManager.initializeTask()
    ↓
┌─────────────────────────────────────────────────────────┐
│                  锁获取阶段                                │
├─────────────────────────────────────────────────────────┤
│  Subtask 1 (无依赖)     │  Subtask 2 (依赖1)     │  Subtask 3 (依赖1,2) │
│  ├─ 检查依赖: ✓          │  ├─ 检查依赖: ✗          │  ├─ 检查依赖: ✗          │
│  ├─ 检查文件锁: ✓        │  ├─ 检查文件锁: ✓        │  ├─ 检查文件锁: ✓        │
│  ├─ 获取锁: ✓            │  ├─ 等待依赖完成           │  ├─ 等待依赖完成           │
│  └─ 状态: in-progress    │  └─ 等待中...              │  └─ 等待中...              │
│                            │  Subtask 1 完成          │  Subtask 2 完成          │
│                            │  ├─ 检查依赖: ✓          │  ├─ 检查依赖: ✓          │
│                            │  ├─ 检查文件锁: ✓        │  ├─ 检查文件锁: ✓        │
│                            │  └─ 获取锁: ✓            │  └─ 获取锁: ✓            │
│                            │  └─ 状态: in-progress    │  └─ 状态: in-progress    │
└─────────────────────────────────────────────────────────┘
    ↓
任务完成
    ↓
StateLockManager.cleanup()
```

### 3.3 ResumeSession 集成流程（基于 Worktree 隔离）

```
任务创建
    ↓
ResumeSessionIntegration.saveTaskState()
    ├─ 保存任务信息（任务 ID、描述、状态）
    ├─ 保存子任务列表（子任务 ID、描述、worktree 路径）
    ├─ 保存执行策略（并行、串行、混合）
    └─ 保存时间戳
    ↓
任务执行（中断）
    ↓
ResumeSessionIntegration.recordHistory()
    ├─ 记录中断事件
    ├─ 保存当前状态
    └─ 保存 Worktree 状态
    ↓
用户恢复
    ↓
ResumeSessionIntegration.restoreTaskState()
    ├─ 读取任务信息
    ├─ 读取子任务状态
    ├─ 读取执行策略
    ├─ 读取 Worktree 状态
    └─ 读取历史记录
    ↓
ResumeSessionIntegration.passMinimalContextToSubtask()
    ├─ 传递任务描述
    ├─ 传递约束条件
    ├─ 传递依赖关系（只传递任务 ID）
    ├─ 传递 worktree 路径
    ├─ 传递必需文件列表
    └─ 传递输出文件列表
    ↓
继续执行（在独立的 worktree 中）
    ↓
ResumeSessionIntegration.collectSubtaskResultSummary()
    ├─ 收集子任务结果摘要
    ├─ 更新任务状态
    └─ 记录执行历史
    ↓
任务完成
    ↓
ResumeSessionIntegration.recordHistory()
    ├─ 记录完成事件
    ├─ 保存最终结果摘要
    ├─ 保存合并结果
    └─ 保存执行摘要
```

**关键特点**:
- ✅ 只传递任务级别的最小化上下文
- ✅ 不传递实时的工作状态
- ✅ 每个 worktree 有独立的会话上下文
- ✅ 通过 Git 合并共享结果
- ✅ 通过事件总线通知状态变化

## 4. 接口设计

### 4.1 CLI 命令接口

```bash
# 初始化协调系统
stigmergy coord init

# 创建并执行编排任务
stigmergy coord execute "<task description>" [options]

# 选项：
--strategy <parallel|sequential|hybrid>  # 执行策略
--clis <cli1,cli2>                      # 指定使用的 CLI
--agents <agent1:cli1,agent2:cli2>      # 指定智能体
--skills <skill1:cli1,skill2:cli2>      # 指定技能
--mcp <tool1:cli1,tool2:cli2>           # 指定 MCP 工具
--worktrees                            # 使用 Git Worktree
--merge-strategy <squash|merge>        # 合并策略
--keep-worktrees                       # 保留 Worktree（不删除）
--background                            # 后台运行
--verbose                               # 详细输出

# Git Worktree 管理
stigmergy worktree list                  # 列出所有 Worktrees
stigmergy worktree show <subtaskId>      # 查看 Worktree 详情
stigmergy worktree merge <subtaskId>     # 合并 Worktree
stigmergy worktree remove <subtaskId>    # 删除 Worktree
stigmergy worktree cleanup               # 清理所有 Worktrees

# 终端管理
stigmergy terminal list                  # 列出所有终端
stigmergy terminal status <id>           # 查看终端状态
stigmergy terminal output <id>           # 查看终端输出
stigmergy terminal kill <id>             # 终止终端
stigmergy terminal kill-all              # 终止所有终端

# 状态锁管理
stigmergy locks list                     # 列出所有锁
stigmergy locks show <task-id>            # 查看任务锁
stigmergy locks release <task-id>        # 手动释放锁
stigmergy locks force-release <subtaskId> # 强制释放锁

# 事件日志
stigmergy events list                    # 列出事件
stigmergy events tail                    # 实时查看事件
stigmergy events clear                   # 清除事件日志

# 结果管理
stigmergy results <task-id>              # 查看结果
stigmergy results export <task-id>        # 导出结果
stigmergy results aggregate <task-id>     # 聚合结果

# Hook 管理
stigmergy hooks install <cli>            # 为 CLI 安装 Hook
stigmergy hooks uninstall <cli>          # 卸载 Hook
stigmergy hooks status <cli>             # 查看 Hook 状态

# ResumeSession 管理
stigmergy resume list                    # 列出可恢复的任务
stigmergy resume <task-id>               # 恢复任务
stigmergy resume history <task-id>         # 查看任务历史
```

### 4.2 API 接口

```typescript
// 编排器接口
interface IOrchestrator {
  createTask(description: string, strategy: OrchestrationStrategy): Promise<string>
  getTask(taskId: string): Promise<OrchestrationTask>
  monitorTask(taskId: string): Promise<TaskProgress>
  aggregateResults(taskId: string): Promise<TaskResult>
  cancelTask(taskId: string): Promise<void>
}

// 终端管理器接口
interface ITerminalManager {
  launchTerminals(task: OrchestratedTask, strategy: OrchestrationStrategy): Promise<TerminalLaunchResult[]>
  getTerminalStatus(terminalId: string): Promise<TerminalStatus>
  getTerminalOutput(terminalId: string): Promise<string>
  killTerminal(terminalId: string): Promise<void>
  killAllTerminals(): Promise<void>
}

// Worktree 管理器接口
interface IWorktreeManager {
  create(config: WorktreeConfig): Promise<Worktree>
  get(taskId: string, subtaskId: string): Promise<Worktree>
  merge(subtaskId: string, strategy: MergeStrategy): Promise<void>
  remove(taskId: string, subtaskId: string): Promise<void>
  cleanupAll(): Promise<void>
  getAll(): Promise<Record<string, Worktree>>
}

// 状态锁管理器接口
interface IStateLockManager {
  initializeTask(taskId: string, subtasks: SubTask[]): Promise<void>
  acquireLock(taskId: string, subtaskId: string, cliName: 参数化): Promise<LockAcquisitionResult>
  releaseLock(taskId: string, subtaskId: string, result: SubTaskResult): Promise<void>
  getLocks(taskId: string): Promise<Record<string, StateLock>>
  forceRelease(taskId: string, subtaskId: string): Promise<void>
  cleanup(taskId: string): Promise<void>
  detectDeadlock(): Promise<DeadlockInfo | null>
}

// Hook 系统接口
interface IHookSystem {
  installHooks(cliName: string): Promise<void>
  uninstallHooks(cliName: string): Promise<void>
  getHookStatus(cliName: string): Promise<HookStatus>
  updateHook(cliName: string, hookType: string, content: string): Promise<void>
}

// ResumeSession 集成接口
interface IResumeSessionIntegration {
  saveTaskState(taskId: string, task: OrchestratedTask): Promise<void>
  restoreTaskState(taskId: string): Promise<OrchestratedTask | null>
  passContextToSubtask(taskId: string, subtaskId: string, context: SharedContext): Promise<void>
  collectSubtaskContext(taskId: string, subtaskId: string): Promise<SharedContext>
  recordHistory(taskId: string, event: HistoryEvent): Promise<void>
  queryHistory(taskId: string): Promise<HistoryEvent[]>
  generateResumeCommand(taskId: string): Promise<string>
}
```

## 5. 兼容性设计

### 5.1 向后兼容性

**现有功能保持不变**:
- `stigmergy call` - 现有的单 CLI 调用功能
- `stigmergy status` - 现有的状态检查功能
- `stigmergy scan` - 现有的扫描功能
- `stigmergy install` - 现有的安装功能
- 现有的 Hook 系统
- 现有的 ResumeSession 功能

**新功能作为扩展**:
- `stigmergy coord execute` - 新的编排执行命令
- `stigmergy worktree` - 新的 Worktree 管理命令
- `stigmergy terminal` - 新的终端管理命令
- `stigmergy locks` - 新的状态锁管理命令
- `stigmergy events` - 新的事件日志命令

### 5.2 渐进式迁移

**阶段 1: 基础功能**
- 实现基本的任务分解
- 实现单终端执行
- 实现基本的状态锁
- 不使用 Git Worktree

**阶段 2: 多终端并发**
- 实现多终端并发
- 实现并行执行策略
- 实现结果聚合
- 不使用 Git Worktree

**阶段 3: Git Worktree 隔离**
- 实现 Git Worktree 创建
- 实现 Worktree 合并
- 实现配置同步
- 实现冲突检测

**阶段 4: Hook 集成**
- 实现任务检测 Hook
- 实现锁获取 Hook
- 实现锁释放 Hook
- 实现冲突检测 Hook

**阶段 5: ResumeSession 集成**
- 实现会话状态持久化
- 实现上下文传递
- 实现中断恢复
- 实现历史记录

### 5.3 配置兼容

**现有配置保持不变**:
- `~/.stigmergy/config.json` - 现有的配置文件
- `~/.claude/config.json` - Claude CLI 配置
- `~/.gemini/config.json` - Gemini CLI 配置
- 其他 CLI 的配置文件

**新增配置文件**:
- `.stigmergy/coordination/task-registry.json` - 任务注册表
- `.stigmergy/coordination/state-locks.json` - 状态锁
- `.stigmergy/coordination/shared-context.json` - 共享上下文
- `.stigmergy/coordination/event-log.json` - 事件日志
- `.stigmergy/coordination/worktree-registry.json` - Worktree 注册

**CLI 配置扩展**:
- `~/.claude/.stigmergy/hooks/` - Claude CLI Hook 目录
- `~/.gemini/.stigmergy/hooks/` - Gemini CLI Hook 目录
- `~/.iflow/.stigmergy/hooks/` - iFlow CLI Hook 目录
- `~/.opencode/.stigmergy/hooks/` - OpenCode CLI Hook 目录

## 6. 错误处理设计

### 6.1 错误类型

```typescript
enum ErrorType {
  // 终端相关错误
  TERMINAL_LAUNCH_FAILED = 'TERMINAL_LAUNCH_FAILED',
  TERMINAL_CRASHED = 'TERMINAL_CRASHED',
  TERMINAL_TIMEOUT = 'TERMINAL_TIMEOUT',
  
  // Worktree 相关错误
  WORKTREE_CREATE_FAILED = 'WORK_TREE_CREATE_FAILED',
  WORKTREE_MERGE_CONFLICT = 'WORK_TREE_MERGE_CONFLICT',
  WORKTREE_CLEANUP_FAILED = 'WORK_TREE_CLEANUP_FAILED',
  
  // 锁相关错误
  LOCK_ACQUISITION_FAILED = 'LOCK_ACQUISITION_FAILED',
  LOCK_RELEASE_FAILED = 'LOCK_RELEASE_FAILED',
  LOCK_TIMEOUT = 'LOCK_TIMEOUT',
  DEADLOCK_DETECTED = 'DEADLOCK_DETECTED',
  
  // Hook 相关错误
  HOOK_INSTALL_FAILED = 'HOOK_INSTALL_FAILED',
  HOOK_EXECUTION_FAILED = 'HOOK_EXECUTION_FAILED',
  HOOK_MISSING = 'HOOK_MISSING',
  
  // 任务相关错误
  TASK_DECOMPOSITION_FAILED = 'TASK_DECOMPOSITION_FAILED',
  TASK_VALIDATION_FAILED = 'TASK_VALIDATION_FAILED',
  TASK_EXECUTION_FAILED = 'TASK_EXECUTION_FAILED',
  
  // 兼容性相关错误
  BACKWARD_COMPATIBILITY_ISSUE = 'BACKWARD_COMPATIBILITY_ISSUE',
  CLI_NOT_SUPPORTED = 'CLI_NOT_SUPPORTED',
  CLI_VERSION_INCOMPATIBLE = 'CLI_VERSION_INCOMPATIBLE'
}
```

### 6.2 错误恢复策略

```typescript
class ErrorHandler {
  // 处理终端错误
  async handleTerminalError(error: TerminalError): Promise<RecoveryAction> {
    switch (error.type) {
      case ErrorType.TERMINAL_CRASHED:
        return RecoveryAction.RESTART_TERMINAL
      
      case ErrorType.TERMINAL_TIMEOUT:
        return RecoveryAction.EXTEND_TIMEOUT
      
      case ErrorType.TERMINAL_LAUNCH_FAILED:
        return RecoveryAction.USE_FALLBACK_CLI
      
      default:
        return RecoveryAction.LOG_AND_CONTINUE
    }
  }
  
  // 处理 Worktree 错误
  async handleWorktreeError(error: WorktreeError): Promise<RecoveryAction> {
    switch (error.type) {
      case ErrorType.WORKTREE_MERGE_CONFLICT:
        return RecoveryAction.MANUAL_RESOLUTION
      
      case ErrorType.WORKTREE_CREATE_FAILED:
        return RecoveryAction.SKIP_WORKTREE
      
      case ErrorType.WORKTREE_CLEANUP_FAILED:
        return RecoveryAction.MANUAL_CLEANUP
      
      default:
        return RecoveryAction.LOG_AND_CONTINUE
    }
  }
  
  // 处理锁错误
  async handleLockError(error: LockError): Promise<RecoveryAction> {
    switch (error.type) {
      case ErrorType.LOCK_ACQUISITION_FAILED:
        return RecoveryAction.WAIT_AND_RETRY
      
      case ErrorType.LOCK_TIMEOUT:
        return RecoveryAction.FORCE_RELEASE
      
      case ErrorType.DEADLOCK_DETECTED:
        return ErrorType.DEADLOCK_DETECTED ? RecoveryAction.FORCE_RELEASE : RecoveryAction.LOG_AND_CONTINUE
      
      default:
        return RecoveryAction.LOG_AND_CONTINUE
    }
  }
}
```

## 7. 性能优化设计

### 7.1 并发优化

**并发度控制**:
```typescript
class ConcurrencyController {
  private maxConcurrency: number = 8
  private currentConcurrency: number = 0
  private pendingQueue: Task[] = []
  
  async executeWithConcurrencyControl(task: Task): Promise<void> {
    // 等待可用的并发槽
    while (this.currentConcurrency >= this.maxConcurrency) {
      await this.waitForSlot()
    }
    
    // 获取并发槽
    this.currentConcurrency++
    
    try {
      // 执行任务
      await this.executeTask(task)
    } finally {
      // 释放并发槽
      this.currentConcurrency--
    }
  }
}
```

### 7.2 缓存优化

**文件系统缓存**:
```typescript
class FileSystemCache {
  private cache: Map<string, CacheEntry>
  private ttl: number = 30000 // 30秒
  
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    // 检查是否过期
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data as T
  }
  
  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.ttl
    })
  }
}
```

### 7.3 批量操作优化

**批量文件操作**:
```typescript
class BatchFileOperations {
  async batchRead(files: string[]): Promise<Map<string, string>> {
    const results = new Map()
    
    await Promise.all(
      files.map(async file => {
        const content = await fs.readFile(file, 'utf8')
        results.set(file, content)
      })
    )
    
    return results
  }
  
  async batchWrite(writes: Map<string, string>): Promise<void> {
    await Promise.all(
      Array.from(writes.entries()).map(([file, content]) =>
        fs.writeFile(file, content, 'utf8')
      )
    )
  }
}
```

## 8. 安全设计

### 8.1 输入验证

```typescript
class InputValidator {
  // 验证 CLI 名称
  validateCLIName(cliName: string): boolean {
    const validCLIs = ['claude', 'gemini', 'iflow', 'opencode', 'qwen', 'codebuddy', 'copilot', 'codex']
    return validCLIs.includes(cliName.toLowerCase())
  }
  
  // 验证智能体名称
  validateAgentName(cliName: string, agentName: string): boolean {
    const validAgents = {
      claude: ['oracle', 'claude-code', 'claude-opus'],
      gemini: ['gemini-pro', 'gemini-flash'],
      iflow: ['backend', 'frontend', 'general'],
      opencode: ['oracle', 'librarian', 'explore', 'sisyphus']
    }
    
    const agents = validAgents[cliName] || []
    return agents.includes(agentName)
  }
  
  // 验证技能名称
  validateSkillNames(cliName: string, skillNames: string[]): boolean {
    const validSkills = {
      claude: ['code-review', 'refactoring', 'debugging'],
      gemini: ['frontend-ui-ux', 'multimodal', 'creative'],
      iflow: ['backend-logic', 'chinese-docs'],
      opencode: ['frontend-ui-ux', 'backend-logic', 'testing']
    }
    
    const skills = validSkills[cliName] || []
    return skillNames.every(skill => skills.includes(skill))
  }
  
  // 验证路径安全性
  validatePath(path: string): boolean {
    // 防止路径遍历攻击
    const normalizedPath = path.normalize(path)
    return normalizedPath.startsWith(process.cwd()) ||
           normalizedPath.startsWith(os.homedir())
  }
}
```

### 8.2 命令注入防护

```typescript
class CommandSanitizer {
  // 清理 CLI 命令
  sanitizeCLICommand(command: string): string {
    // 移除危险字符
    let sanitized = command
      .replace(/[;&|`$()]/g, '') // 移除 shell 元字符
      .replace(/\s+/g, ' ')      // 合并多个空格
      .trim()
    
    // 验证命令格式
    if (!this.isValidCommandFormat(sanitized)) {
      throw new Error('Invalid command format')
    }
    
    return sanitized
  }
  
  // 验证命令格式
  private isValidCommandFormat(command: string): boolean {
    // 只允许字母、数字、连字符、斜杠和空格
    return /^[a-zA-Z0-9_\-/.: ]+$/.test(command)
  }
}
```

### 8.3 资源限制

```typescript
class ResourceLimiter {
  private maxMemoryUsage: number = 500 * 1024 * 1024 // 500MB
  private maxTerminalCount: number = 8
  private maxWorktreeCount: number = 16
  
  // 检查内存使用
  async checkMemoryUsage(): Promise<boolean> {
    const usage = process.memoryUsage()
    return usage.heapUsed < this.maxMemoryUsage
  }
  
  // 检查终端数量
  checkTerminalCount(count: number): boolean {
    return count <= this.maxTerminalCount
  }
  
  // 检查 Worktree 数量
  checkWorktreeCount(count: number): boolean {
    return count <= this.maxWorktreeCount
  }
}
```

## 9. 测试设计

### 9.1 单元测试

```typescript
// TerminalManager.test.ts
describe('EnhancedTerminalManager', () => {
  it('should launch multiple terminals in parallel', async () => {
    const task = createMockTask()
    const terminals = await terminalManager.launchTerminalsForTask(task, { mode: 'parallel' })
    expect(terminals).toHaveLength(4)
  })
  
  it('should monitor terminal status', async () => {
    const terminal = await terminalManager.launchTerminalForSubtask(mockSubtask, mockWorktree, mockStrategy)
    const status = await terminalManager.checkTerminalStatus(terminal.terminalId)
    expect(status).toBe('running')
  })
})

// StateLockManager.test.ts
describe('StateLockManager', () => {
  it('should acquire lock atomically', async () => {
    const result = await lockManager.acquireLock('task-1', 'subtask-1', 'claude')
    expect(result.success).toBe(true)
  })
  
  it('should check dependencies', async () => {
    await lockManager.initializeTask('task-1', mockSubtasks)
    const locks = await lockManager.loadLocks('task-1')
    const hasDeps = lockManager.checkDependencies(locks, ['subtask-2', 'subtask-3'])
    expect(hasDeps).toBe(false) // 因为子任务还没完成
  })
})
```

### 9.2 集成测试

```typescript
// orchestration-flow.test.ts
describe('Orchestration Flow', () => {
  it('should execute full orchestration flow', async () => {
    const result = await orchestrator.executeFullOrchestration(
      '实现一个完整的电商系统',
      { mode: 'hybrid', clis: ['claude', 'gemini', 'iflow', 'opencode'] }
    )
    
    expect(result.status).toBe('completed')
    expect(result.results).toHaveLength(4)
    expect(result.conflicts).toHaveLength(0)
  })
  
  it('should handle task interruption and recovery', async () => {
    // 创建任务
    const taskId = await orchestrator.createOrchestrationTask('测试任务', { mode: 'parallel' })
    
    // 模拟中断
    await orchestrator.interruptTask(taskId)
    
    // 恢复任务
    const result = await orchestrator.resumeTask(taskId)
    
    expect(result.status).toBe('completed')
  })
})
```

### 9.3 性能测试

```typescript
// performance.test.ts
describe('Performance Tests', () => {
  it('should achieve 3x speedup with parallel execution', async () => {
    const sequentialTime = await measureSequentialExecution()
    const parallelTime = await measureParallelExecution()
    
    const speedup = sequentialTime / parallelTime
    expect(speedup).toBeGreaterThan(3)
  })
  
  it('should complete within time budget', async () => {
    const startTime = Date.now()
    await orchestrator.executeFullOrchestration('测试任务', { mode: 'parallel' })
    const duration = Date.now() - startTime
    
    expect(duration).toBeLessThan(30 * 60 * 1000) // 30分钟
  })
})
```

## 10. 部署设计

### 10.1 安装流程

```
1. 用户运行: stigmergy coord init
   ↓
2. 系统创建协调目录结构:
   .stigmergy/
   ├── coordination/
   │   ├── task-registry.json
   │   ├── state-locks.json
   │   ├── shared-context.json
   │   ├── event-log.json
   │   ├── worktree-���istry.json
   │   └── terminal-sessions.json
   └── hooks/
       ├── task-detection.js
       ├── lock-acquisition.js
       ├── lock-release.js
       └── conflict-detection.js
   ↓
3. 为每个 CLI 安装 Hook:
   - stigmergy hooks install claude
   - stigmergy hooks install gemini
   - stigmergy hooks install iflow
   - stigmergy hooks install opencode
   ↓
4. 验证安装:
   - stigmergy coord status
   - stigmergy hooks status <cli>
   ↓
5. 完成
```

### 10.2 升级流程

```
1. 用户运行: stigmergy coord upgrade
   ↓
2. 检查当前版本
   ↓
3. 备份现有配置
   ↓
4. 更新核心组件
   ↓
5. 更新 Hook 文件
   ↓
6. 验证升级
   ↓
7. 完成
```

### 10.10 回滚流程

```
1. 用户运行: stigmergy coord rollback
   ↓
2. 检查备份
   ↓
3. 恢复备份
   ↓
4. 验证回滚
   ↓
5. 完成
```

## 11. 监控设计

### 11.1 监控指标

```typescript
interface MonitoringMetrics {
  // 任务指标
  totalTasks: number
  completedTasks: number
  failedTasks: number
  averageDuration: number
  
  // 性能指标
  averageTerminalLaunchTime: number
  averageWorktreeCreateTime: number
  averageLockAcquisitionTime: number
  averageResponseTime: number
  
  // 资源指标
  currentMemoryUsage: number
  currentTerminalCount: number
  currentWorktreeCount: number
  
  // 错误指标
  totalErrors: number
  errorsByType: Record<string, number>
  
  // 兼容性指标
  existingFunctionCalls: number
  newFunctionCalls: number
  compatibilityIssues: number
}
```

### 11.2 日志设计

```typescript
interface LogEntry {
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'debug'
  component: string
  message: string
  data?: any
}

// 日志级别
enum LogLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  DEBUG = 'debug'
}

// 日志组件
enum LogComponent {
  ORCHESTRATOR = 'orchestrator',
  TERMINAL_MANAGER = 'terminal-manager',
  WORKTREE_MANAGER = 'worktree-manager',
  LOCK_MANAGER = 'lock-manager',
  HOOK_SYSTEM = 'hook-system',
  EVENT_BUS = 'event-bus',
  RESUME_SESSION = 'resume-session',
  CLI_ADAPTER = 'cli-adapter'
}
```

### 11.3 告警设计

```typescript
interface Alert {
  type: 'performance' | 'error' | 'warning' | 'info'
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  component: string
  message: string
  data?: any
  suggestions?: string[]
}

// 告警类型
enum AlertType {
  PERFORMANCE_DEGRADATION = 'performance-degradation',
  HIGH_ERROR_RATE = 'high-error-rate',
  RESOURCE_EXHAUSTION = 'resource-exhaustion',
  DEADLOCK_RISK = 'deadlock-risk',
  COMPATIBILITY_ISSUE = 'compatibility-issue',
  SECURITY_VIOLATION = 'security-violation'
}
```

## 12. 文档设计

### 12.1 用户文档

**命令参考**:
- 完整的命令列表
- 每个命令的详细说明
- 使用示例
- 常见问题解答

**教程**:
- 快速入门指南
- 高级功能教程
- 最佳实践
- 故障排除

**API 文档**:
- API 接口说明
- 数据结构定义
- 错误代码说明
- 事件类型说明

### 12.2 开发者文档

**架构文档**:
- 系统架构图
- 模块依赖关系
- 数据流图
- 接口设计文档

**实现文档**:
- 模块实现细节
- 算法说明
- 性能优化技巧
- 安全考虑

**测试文档**:
- 测试策略
- 测试用例
- 测试覆盖率报告

### 12.3 运维文档

**安装文档**:
- 系统要求
- 安装步骤
- 配置说明
- 验证步骤

**运维文档**:
- 监控指南
- 日志分析
- 性能优化
- 故障排除

**升级文档**:
- 升级步骤
- 兼容性说明
- 回滚步骤
- 数据迁移

## 13. 扩展性设计

### 13.1 CLI 扩展

**添加新的 CLI**:
1. 在 CLI 能力矩阵中添加 CLI 信息
2. 创建 CLI 参数映射
3. 创建 CLI 特定的 Hook
4. 更新 CLI 选择逻辑

**示例**:
```typescript
// 1. 添加到 CLI 能力矩阵
cliRegistry['new-cli'] = {
  name: 'New CLI',
  strengths: ['special-task'],
  model: 'new-cli/model',
  cost: 'low'
}

// 2. 创建 CLI 参数映射
CLI_PARAM_MAPPINGS['new-cli'] = {
  agent: (agent: string) => ` --agent ${agent}`,
  skills: (skills: string[]) => ` --skills ${skills.join(',')}`,
  mcp: (tools: string[]) => ` --mcp-config .stigmergy/mcp-new-cli.json`,
  cwd: (cwd: string) => ` --cwd "${cwd}"`
}

// 3. 创建 CLI 特定的 Hook
await hookSystem.installCoordinationHooks('new-cli')
```

### 13.2 Hook 扩展

**添加新的 Hook 类型**:
1. 在 Hook 系统中注册新 Hook 类型
2. 创建 Hook 生成器
3. 更新 CLI 配置
4. 测试 Hook 功能

**示例**:
```typescript
async function installCustomHook(cliName: string, hookType: string): Promise<void> {
  const hookContent = generateCustomHook(cliName, hookType)
  const hookFile = path.join(hooksDir, `${hookType}.js`)
  
  await fs.writeFile(hookFile, hookContent)
```

## 13. 追溯矩阵

### 13.1 设计到实施的追溯

| 设计组件 | 实施文档 | 实施阶段 | 实施任务 |
|---------|---------|---------|---------|
| CentralOrchestrator | IMPLEMENTATION.md | 阶段 1 | 任务 1.2 |
| EnhancedTerminalManager | IMPLEMENTATION.md | 阶段 2 | 任务 2.1 |
| GitWorktreeManager | IMPLEMENTATION.md | 阶段 3 | 任务 3.1 |
| StateLockManager | IMPLEMENTATION.md | 阶段 1 | 任务 1.5 |
| HookSystem | IMPLEMENTATION.md | 阶段 4 | 任务 4.1 |
| EventBus | IMPLEMENTATION.md | 阶段 1 | 任务 1.4 |
| ResultAggregator | IMPLEMENTATION.md | 阶段 2 | 任务 2.2 |
| ResumeSessionIntegration | IMPLEMENTATION.md | 阶段 5 | 任务 5.1 |
| TaskPlanningFiles | IMPLEMENTATION.md | 阶段 6 | 任务 6.1 |

**覆盖率**: 9/9 (100%)

**说明**: 所有组件都有对应的实施任务，架构已简化为 9 个核心组件
  
  // 更新 CLI 配置
  const config = await loadCLIConfig(cliName)
  config.hooks[hookType] = hookFile
  
  await saveCLIConfig(cliName, config)
}
```

### 13.3 策略扩展

**添加新的执行策略**:
1. 在策略管理器中注册新策略
2. 实现策略逻辑
3. 更新 CLI 命令选项
4. 测试策略功能

**示例**:
```typescript
strategyRegistry.register('custom-strategy', {
  name: 'Custom Strategy',
  description: 'Custom execution strategy',
  execute: async (task, subtasks) => {
    // 自定义执行逻辑
  }
})
```

这就是完整的设计文档，基于 Speckit 规范，涵盖了所有核心模块的设计、接口设计、兼容性设计、错误处理、性能优化、安全设计、测试设计、部署设计、监控设计、文档设计和扩展性设计！